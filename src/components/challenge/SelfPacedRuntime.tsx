"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getQuestion } from "@/data";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { Leaderboard, type ScoreMode } from "./Leaderboard";
import { SoundToggle } from "./SoundToggle";
import { CountdownTimer } from "./CountdownTimer";
import { useProvocareSound } from "@/hooks/useProvocareSound";
import { HighlighterToggle } from "@/components/ui/HighlighterToggle";
import { KeyboardNavToggle } from "@/components/ui/KeyboardNavToggle";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { CHALLENGE_TIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";
import type { TimerConfig } from "@/lib/challenge/types";
import type { Standing, MilestoneEvent } from "@/lib/realtime/events";
import type { GraceState } from "@/hooks/usePresenceGrace";

// After a question times out we reveal the answer, then auto-advance so an
// away/idle player doesn't stall the round.
const TIMEOUT_AUTO_ADVANCE = 5;

interface Props {
  code: string;
  token: string;
  snapshot: {
    config: { instantFeedback: boolean; preset?: string };
    me: {
      playerId: number;
      questionOrder: number[] | null;
      optionOrder: Record<number, string[]> | null;
      answers: { questionId: number; selected: string; isCorrect: boolean }[];
    };
  };
  standings: Standing[];
  lastMilestone: MilestoneEvent | null;
  timer: TimerConfig;
  /** Server-fresh seconds left on the whole-game clock (total mode), else null. */
  totalRemaining: number | null;
  /** Called once when the whole-game clock hits zero, so the lobby can refetch. */
  onTimeUp: () => void;
  /** Per-player connection state for the live leaderboard's disconnect display. */
  connection?: Map<number, GraceState>;
}

export function SelfPacedRuntime({ code, token, snapshot, standings, lastMilestone, timer, totalRemaining, onTimeUp, connection }: Props) {
  const { play } = useProvocareSound();
  const { on: kbdOn } = useKeyboardNav();

  const isTotal = timer.mode === "total";
  const isPerQuestion = timer.mode === "per_question";
  const isUnlimited = timer.mode === "unlimited";
  // Simulare grades on the 1-10 nota; the leaderboard renders that instead of points.
  const scoreMode: ScoreMode = snapshot.config.preset === "simulare" ? "nota" : "points";

  const order = useMemo(
    () => (snapshot.me.questionOrder ?? []).filter((id) => !!getQuestion(id)),
    [snapshot.me.questionOrder],
  );
  const answered = useMemo(
    () => new Map(snapshot.me.answers.map((a) => [a.questionId, a])),
    [snapshot.me.answers],
  );

  const firstUnanswered = order.findIndex((id) => !answered.has(id));
  const [index, setIndex] = useState(firstUnanswered === -1 ? order.length : firstUnanswered);
  const [selected, setSelected] = useState<AnswerKey | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [timeoutAnim, setTimeoutAnim] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showGo, setShowGo] = useState(false);
  const [autoAdvanceLeft, setAutoAdvanceLeft] = useState<number | null>(null);
  const [display, setDisplay] = useState<{ secondsLeft: number; danger: boolean }>(() =>
    isPerQuestion
      ? { secondsLeft: timer.perQuestionSeconds, danger: false }
      : { secondsLeft: totalRemaining ?? timer.totalSeconds, danger: false },
  );

  const startRef = useRef<number>(0);
  const lockRef = useRef(false); // per-question: frozen once answered / timed out
  const timedOutFiredRef = useRef(false);
  const lastTickRef = useRef(-1); // last whole-second a tick played (dedupe)
  const shownRef = useRef<{ s: number; d: boolean }>({ s: -1, d: false });
  const totalDeadlineRef = useRef<number | null>(null);
  const timeUpFiredRef = useRef(false);

  const done = index >= order.length;
  const doneRef = useRef(done);
  useEffect(() => { doneRef.current = done; });

  // Reset the per-question timing refs on each new question. The per-question UI
  // state (selected/feedback/...) is reset synchronously inside advance() instead,
  // so a new question never renders one frame with the previous answer still set
  // (which left an option looking pre-focused).
  useEffect(() => {
    startRef.current = Date.now();
    lockRef.current = false;
    timedOutFiredRef.current = false;
    lastTickRef.current = -1;
    shownRef.current = { s: -1, d: false };
  }, [index]);

  // Opening "GO!" flourish - only at the true start of the round, and only once
  // per game per browser, so it never replays on a reconnect or a re-mount.
  useEffect(() => {
    if (firstUnanswered !== 0) return; // resuming mid-round, or already finished
    let already = false;
    try { already = sessionStorage.getItem(`provocare:go:${code}`) === "1"; } catch { /* ignore */ }
    if (already) return;
    try { sessionStorage.setItem(`provocare:go:${code}`, "1"); } catch { /* ignore */ }
    setShowGo(true); // eslint-disable-line react-hooks/set-state-in-effect
    play("start");
    const t = setTimeout(() => setShowGo(false), 900);
    return () => clearTimeout(t);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!lastMilestone) return;
    setToast(lastMilestone.text); // eslint-disable-line react-hooks/set-state-in-effect
    play("milestone");
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [lastMilestone, play]);

  // Total-mode deadline: (re)sync to the server-fresh remaining whenever it changes.
  useEffect(() => {
    if (!isTotal) return;
    const secs = totalRemaining ?? timer.totalSeconds;
    totalDeadlineRef.current = Date.now() + secs * 1000;
  }, [isTotal, totalRemaining, timer.totalSeconds]);

  // Keep the timeout/time-up handlers fresh for the long-lived ticking interval.
  const submitTimeoutRef = useRef<() => void>(() => {});
  const totalTimeUpRef = useRef<() => void>(() => {});

  const advance = useCallback(() => {
    // Reset answer state in the same batch as the index bump so the next question
    // renders clean (no stale selection, no lingering auto-advance countdown).
    setSelected(null);
    setFeedback(false);
    setLastPoints(null);
    setTimedOut(false);
    setAutoAdvanceLeft(null);
    setIndex((i) => i + 1);
  }, []);

  // Auto-advance countdown after a timeout. Scheduling lives in the timeout
  // callback (not the effect body) so it doesn't count as a sync setState.
  useEffect(() => {
    if (autoAdvanceLeft === null) return;
    const t = setTimeout(() => {
      if (autoAdvanceLeft <= 1) advance();
      else setAutoAdvanceLeft(autoAdvanceLeft - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [autoAdvanceLeft, advance]);

  function handleTotalTimeUp() {
    if (timeUpFiredRef.current) return;
    timeUpFiredRef.current = true;
    play("timeout");
    setGameOver(true);
    onTimeUp();
    // If our clock beat the server's to the deadline, the first refetch may still
    // read "running". Nudge again so the results show within a couple of seconds
    // rather than waiting for the 15s heartbeat.
    setTimeout(onTimeUp, 1500);
    setTimeout(onTimeUp, 4000);
  }

  async function submitTimeout() {
    if (lockRef.current || timedOutFiredRef.current || doneRef.current) return;
    lockRef.current = true;
    timedOutFiredRef.current = true;
    const qid = order[index];
    setTimedOut(true);
    setTimeoutAnim(true);
    play("timeout");
    setTimeout(() => setTimeoutAnim(false), 700);
    const timeMs = timer.perQuestionSeconds * 1000;
    try {
      const res = await fetch("/api/challenge/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, token, questionId: qid, timedOut: true, timeMs }),
      });
      if (!res.ok) { setAutoAdvanceLeft(TIMEOUT_AUTO_ADVANCE); return; }
      const data = await res.json();
      setLastPoints(0);
      // Reveal the answer (instant mode) and auto-advance after a short pause so
      // the player can read it; either way the round keeps moving.
      if (snapshot.config.instantFeedback && data.recorded) setFeedback(true);
      setAutoAdvanceLeft(TIMEOUT_AUTO_ADVANCE);
    } catch {
      setAutoAdvanceLeft(TIMEOUT_AUTO_ADVANCE);
    }
  }

  useEffect(() => {
    submitTimeoutRef.current = submitTimeout;
    totalTimeUpRef.current = handleTotalTimeUp;
  });

  // Single ticking loop for the whole game. Total and per-question never run at
  // once (the mode is fixed), so the two tick windows can't collide.
  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      if (timer.mode === "total") {
        const dl = totalDeadlineRef.current;
        if (dl == null) return;
        const secs = Math.max(0, Math.ceil((dl - now) / 1000));
        const danger = secs <= CHALLENGE_TIMER.TICK_TAIL_TOTAL;
        if (secs !== shownRef.current.s || danger !== shownRef.current.d) {
          shownRef.current = { s: secs, d: danger };
          setDisplay({ secondsLeft: secs, danger });
        }
        if (danger && secs > 0 && secs !== lastTickRef.current) { lastTickRef.current = secs; play("tick"); }
        if (secs <= 0) totalTimeUpRef.current();
      } else if (timer.mode === "per_question") {
        if (doneRef.current || lockRef.current) return;
        const dl = startRef.current + timer.perQuestionSeconds * 1000;
        const secs = Math.max(0, Math.ceil((dl - now) / 1000));
        const danger = secs <= CHALLENGE_TIMER.TICK_TAIL_PER_QUESTION;
        if (secs !== shownRef.current.s || danger !== shownRef.current.d) {
          shownRef.current = { s: secs, d: danger };
          setDisplay({ secondsLeft: secs, danger });
        }
        if (danger && secs > 0 && secs !== lastTickRef.current) { lastTickRef.current = secs; play("tick"); }
        if (secs <= 0) submitTimeoutRef.current();
      }
    };
    loop();
    const id = setInterval(loop, 200);
    return () => clearInterval(id);
  }, [timer.mode, timer.perQuestionSeconds, play]);

  const me = standings.find((s) => s.playerId === snapshot.me.playerId);

  async function submit(answer: AnswerKey) {
    if (selected || gameOver || lockRef.current) return;
    lockRef.current = true;
    setSelected(answer);
    play("select");
    const qid = order[index];
    const q = getQuestion(qid);
    const timeMs = Date.now() - startRef.current;
    try {
      const res = await fetch("/api/challenge/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, token, questionId: qid, selected: answer, timeMs }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err?.timeUp) { handleTotalTimeUp(); return; }
        advance();
        return;
      }
      const data = await res.json();
      setLastPoints(typeof data.points === "number" ? data.points : null);
      if (snapshot.config.instantFeedback && data.recorded) {
        setFeedback(true);
        play(q && answer === q.correctAnswer ? "correct" : "wrong");
      } else {
        advance();
      }
    } catch {
      advance();
    }
  }

  const goOverlay = showGo ? (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
      <span
        className="animate-go-flash text-6xl sm:text-8xl font-extrabold text-[var(--color-accent)]"
        style={{ fontFamily: "var(--font-display)", textShadow: "0 0 40px rgba(232,166,49,0.45)" }}
      >
        GO!
      </span>
    </div>
  ) : null;

  const gameOverOverlay = gameOver ? (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-3 px-6 text-center bg-[var(--color-bg-primary)]/85 backdrop-blur-sm">
      <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-wrong)]" style={{ fontFamily: "var(--font-display)" }}>
        Timpul a expirat
      </span>
      <p className="text-sm text-[var(--color-text-secondary)]">Se încarcă rezultatele...</p>
    </div>
  ) : null;

  if (done) {
    return (
      <main className="relative max-w-md mx-auto px-4 py-10">
        {goOverlay}
        {gameOverOverlay}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
            Ai terminat
          </span>
          <SoundToggle />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          Gata! Bravo.
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">Așteptăm ceilalți jucători să termine...</p>
        {isTotal && (
          <div className="mb-6">
            <CountdownTimer secondsLeft={display.secondsLeft} totalSeconds={timer.totalSeconds} danger={display.danger} label="Jocul se termină în" />
          </div>
        )}
        <Leaderboard standings={standings} meId={snapshot.me.playerId} connection={connection} scoreMode={scoreMode} />
      </main>
    );
  }

  const questionId = order[index];
  const question = getQuestion(questionId);
  if (!question) return null;
  const optionOrder = (snapshot.me.optionOrder?.[questionId] as AnswerKey[] | undefined) ?? undefined;
  // The result panel shows after a normal answer (feedback) or a timeout.
  const showResultArea = feedback || timedOut;

  return (
    <main className="relative max-w-2xl mx-auto px-4 py-6">
      {goOverlay}
      {gameOverOverlay}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] px-4 py-2.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-accent)] text-sm font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-lg)] toast-enter max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        {me ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">Locul</span>
            <span className="text-sm font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>{me.rank}</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">din {standings.length}</span>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1.5">
          <HighlighterToggle />
          <span className="hidden md:inline-flex">
            <KeyboardNavToggle />
          </span>
          <SoundToggle />
        </div>
      </div>

      {isUnlimited ? (
        <div className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Fără limită de timp
        </div>
      ) : (
        <div className="mb-4">
          <CountdownTimer
            secondsLeft={display.secondsLeft}
            totalSeconds={isTotal ? timer.totalSeconds : timer.perQuestionSeconds}
            danger={display.danger}
            label={isTotal ? "Timp rămas" : "Timp"}
          />
        </div>
      )}

      <div className={cn("relative", timeoutAnim && "animate-timeout-shake")}>
        <QuestionCard
          question={question}
          questionNumber={index + 1}
          totalQuestions={order.length}
          selectedAnswer={selected}
          showFeedback={feedback}
          isBookmarked={false}
          onSelectAnswer={submit}
          optionOrder={optionOrder}
          keyboardActive={kbdOn}
          onNext={showResultArea ? advance : undefined}
        />
        {timeoutAnim && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[var(--radius-md)] animate-timeout-wash"
            style={{ background: "var(--color-wrong)" }}
            aria-hidden="true"
          />
        )}
      </div>

      {showResultArea && (
        <div className="mt-4 space-y-3">
          <div
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-bold animate-roster-pop",
              !timedOut && "bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
            )}
            style={
              timedOut
                ? { background: "color-mix(in srgb, var(--color-wrong) 14%, transparent)", color: "var(--color-wrong)", fontFamily: "var(--font-display)" }
                : { fontFamily: "var(--font-display)" }
            }
          >
            {timedOut ? "Timp expirat - 0 puncte" : `+${lastPoints ?? 0} puncte`}
          </div>
          {autoAdvanceLeft !== null && (
            <p className="text-center text-xs text-[var(--color-text-tertiary)]">
              Continuă automat în {autoAdvanceLeft}s
            </p>
          )}
          <button
            onClick={advance}
            className="w-full py-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {autoAdvanceLeft !== null
              ? "Continuă acum"
              : index + 1 >= order.length ? "Vezi rezultatele" : "Următoarea întrebare"}
          </button>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">
          Clasament live
        </h2>
        <Leaderboard standings={standings} meId={snapshot.me.playerId} connection={connection} scoreMode={scoreMode} />
      </section>
    </main>
  );
}
