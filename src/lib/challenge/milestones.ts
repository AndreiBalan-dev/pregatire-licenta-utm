import type { MilestoneEvent } from "@/lib/realtime/events";

export interface MilestoneInput {
  playerId: number;
  name: string;
  total: number;
  beforeAnswered: number;
  afterAnswered: number;
  justFinished: boolean;
  anyoneFinishedBefore: boolean;
  becameLeader: boolean;
}

const THRESHOLDS = [25, 50, 75] as const; // 100% is covered by finish events

function pct(answered: number, total: number): number {
  return total > 0 ? (answered / total) * 100 : 0;
}

/** Pure milestone derivation from a single answer's before/after state. The
 *  caller supplies the cross-player facts (first finish, lead change) it
 *  computed from the DB; this function turns the delta into toastable events. */
export function detectMilestones(input: MilestoneInput): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];
  const before = pct(input.beforeAnswered, input.total);
  const after = pct(input.afterAnswered, input.total);

  for (const t of THRESHOLDS) {
    if (before < t && after >= t) {
      events.push({ type: "progress", value: t, playerId: input.playerId, text: `${input.name} a ajuns la ${t}%` });
    }
  }

  if (input.justFinished) {
    if (input.anyoneFinishedBefore) {
      events.push({ type: "finished", playerId: input.playerId, text: `${input.name} a terminat` });
    } else {
      events.push({ type: "first_finish", playerId: input.playerId, text: `${input.name} a terminat prima/primul` });
    }
  }

  if (input.becameLeader) {
    events.push({ type: "lead_change", playerId: input.playerId, text: `${input.name} a preluat conducerea` });
  }

  return events;
}
