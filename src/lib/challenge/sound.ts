// Synthesized sound effects + haptics for Provocare. There are no audio files:
// every cue is a short Web Audio envelope, built lazily on first use (after a
// user gesture, per browser autoplay rules). A single "effects" mute controls
// both sound and haptics and is remembered in localStorage. Scoped to the
// challenge screens - the study surfaces stay silent.

const MUTE_KEY = "utm-provocare-muted";

export type Cue =
  | "select"
  | "correct"
  | "wrong"
  | "join"
  | "start"
  | "milestone"
  | "win"
  | "finish"
  | "tick"
  | "timeout";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

if (typeof window !== "undefined") {
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    /* private mode: default to on */
  }
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneSpec {
  freq: number;
  to?: number; // glide target frequency
  type?: OscillatorType;
  start?: number; // offset in seconds from now
  dur?: number;
  gain?: number;
}

function tone(c: AudioContext, out: GainNode, t0: number, spec: ToneSpec) {
  const osc = c.createOscillator();
  const g = c.createGain();
  const start = t0 + (spec.start ?? 0);
  const dur = spec.dur ?? 0.12;
  const peak = spec.gain ?? 0.12;
  osc.type = spec.type ?? "sine";
  osc.frequency.setValueAtTime(spec.freq, start);
  if (spec.to) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.to), start + dur);
  }
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(out);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

const HAPTICS: Record<Cue, number | number[]> = {
  select: 8,
  correct: 14,
  wrong: [22, 36, 22],
  join: 10,
  start: [12, 28, 12],
  milestone: 12,
  win: [26, 40, 60],
  finish: 18,
  tick: 5,
  timeout: [40, 30, 40, 30, 90],
};

function synth(cue: Cue) {
  const c = ensureCtx();
  if (!c || !master) return;
  const out = master;
  const t = c.currentTime;
  switch (cue) {
    case "select":
      tone(c, out, t, { freq: 320, to: 220, type: "triangle", dur: 0.05, gain: 0.1 });
      break;
    case "correct":
      tone(c, out, t, { freq: 660, type: "sine", dur: 0.1, gain: 0.12 });
      tone(c, out, t, { freq: 990, type: "sine", start: 0.085, dur: 0.13, gain: 0.12 });
      break;
    case "wrong":
      tone(c, out, t, { freq: 200, to: 120, type: "sawtooth", dur: 0.22, gain: 0.09 });
      break;
    case "join":
      tone(c, out, t, { freq: 540, to: 820, type: "sine", dur: 0.1, gain: 0.1 });
      break;
    case "start":
      tone(c, out, t, { freq: 300, to: 560, type: "triangle", dur: 0.18, gain: 0.1 });
      tone(c, out, t, { freq: 880, type: "sine", start: 0.16, dur: 0.18, gain: 0.12 });
      break;
    case "milestone":
      tone(c, out, t, { freq: 784, type: "sine", dur: 0.14, gain: 0.1 });
      tone(c, out, t, { freq: 1176, type: "sine", start: 0.04, dur: 0.16, gain: 0.07 });
      break;
    case "win": {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) =>
        tone(c, out, t, { freq: f, type: "triangle", start: i * 0.11, dur: 0.2, gain: 0.12 }),
      );
      break;
    }
    case "finish":
      tone(c, out, t, { freq: 440, type: "sine", dur: 0.12, gain: 0.09 });
      tone(c, out, t, { freq: 330, type: "sine", start: 0.1, dur: 0.16, gain: 0.08 });
      break;
    case "tick":
      // Short, quiet clock blip - meant to sit under the UI, once per second.
      tone(c, out, t, { freq: 1046, type: "triangle", dur: 0.035, gain: 0.05 });
      break;
    case "timeout":
      // Descending "time's up" buzz, distinct from a wrong answer.
      tone(c, out, t, { freq: 440, to: 165, type: "sawtooth", dur: 0.32, gain: 0.1 });
      tone(c, out, t, { freq: 150, type: "sine", start: 0.06, dur: 0.3, gain: 0.08 });
      break;
  }
}

/** Play a cue (sound + matching haptic). No-op when muted. */
export function cue(name: Cue) {
  if (muted) return;
  try {
    synth(name);
  } catch {
    /* audio unavailable - ignore */
  }
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(HAPTICS[name]);
    }
  } catch {
    /* vibration unsupported - ignore */
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  try {
    window.localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (!v) ensureCtx(); // warm up the context on unmute (we're inside a gesture)
}
