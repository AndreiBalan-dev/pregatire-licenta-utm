"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { getQuestion } from "@/data";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { Leaderboard } from "./Leaderboard";
import type { AnswerKey } from "@/data/types";
import type { Standing, MilestoneEvent } from "@/lib/realtime/events";

interface Props {
  code: string; token: string;
  snapshot: {
    config: { instantFeedback: boolean };
    me: { playerId: number; questionOrder: number[] | null; optionOrder: Record<number, string[]> | null; answers: { questionId: number; selected: string; isCorrect: boolean }[] };
  };
  standings: Standing[];
  lastMilestone: MilestoneEvent | null;
}

export function SelfPacedRuntime({ code, token, snapshot, standings, lastMilestone }: Props) {
  const order = useMemo(() => snapshot.me.questionOrder ?? [], [snapshot.me.questionOrder]);
  const answered = useMemo(() => new Map(snapshot.me.answers.map((a) => [a.questionId, a])), [snapshot.me.answers]);

  const firstUnanswered = order.findIndex((id) => !answered.has(id));
  const [index, setIndex] = useState(firstUnanswered === -1 ? order.length : firstUnanswered);
  const [selected, setSelected] = useState<AnswerKey | null>(null);
  const [feedback, setFeedback] = useState<{ correctAnswer?: string; explanation?: string | null } | null>(null);
  const startRef = useRef<number>(Date.now());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { startRef.current = Date.now(); setSelected(null); setFeedback(null); }, [index]);
  useEffect(() => { if (lastMilestone) { setToast(lastMilestone.text); const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [lastMilestone]);

  if (index >= order.length) {
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-4">Ai terminat! Așteptăm ceilalți jucători...</h1>
        <Leaderboard standings={standings} meId={snapshot.me.playerId} />
      </main>
    );
  }

  const questionId = order[index];
  const question = getQuestion(questionId);
  if (!question) { setIndex((i) => i + 1); return null; }
  const optionOrder = (snapshot.me.optionOrder?.[questionId] as AnswerKey[] | undefined) ?? undefined;

  async function submit(answer: AnswerKey) {
    if (selected) return;
    setSelected(answer);
    const timeMs = Date.now() - startRef.current;
    const res = await fetch("/api/challenge/answer", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, token, questionId, selected: answer, timeMs }),
    });
    const data = await res.json();
    if (snapshot.config.instantFeedback && data.recorded) {
      setFeedback({ correctAnswer: data.correctAnswer, explanation: data.explanation });
    } else {
      advance();
    }
  }

  function advance() { setIndex((i) => i + 1); }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm shadow-lg z-50">{toast}</div>}

      <QuestionCard
        question={question}
        questionNumber={index + 1}
        totalQuestions={order.length}
        selectedAnswer={selected}
        showFeedback={!!feedback}
        isBookmarked={false}
        onSelectAnswer={submit}
        optionOrder={optionOrder}
      />

      {feedback && (
        <button onClick={advance} className="mt-4 w-full py-3 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold">
          {index + 1 >= order.length ? "Vezi rezultatele" : "Următoarea întrebare"}
        </button>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--color-text-tertiary)] mb-2">Clasament</h2>
        <Leaderboard standings={standings} meId={snapshot.me.playerId} />
      </section>
    </main>
  );
}
