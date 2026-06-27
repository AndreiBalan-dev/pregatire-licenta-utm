"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { SubjectSelector } from "@/components/practice/SubjectSelector";
import { ToggleRow } from "@/components/challenge/ToggleRow";
import { TimerPicker, type TimerValue } from "@/components/challenge/TimerPicker";
import { NameModal } from "@/components/challenge/NameModal";
import { SoundToggle } from "@/components/challenge/SoundToggle";
import { useProvocareSound } from "@/hooks/useProvocareSound";
import { savePlayer } from "@/lib/challenge/identity";
import type { ChallengePreset } from "@/lib/challenge/types";
import { EXAM_TOTAL_QUESTIONS } from "@/lib/exam";
import { CHALLENGE_TIMER } from "@/lib/constants";
import { modules } from "@/data/modules";
import { questionsBySubject } from "@/data";
import { cn } from "@/lib/utils";

const COUNT_OPTIONS = [5, 10, 20, 30, 50];
const CAPACITY = 6;

const ALL_SUBJECT_IDS = modules.flatMap((m) => m.subjects.map((s) => s.id));
const SIMULARE_DEFAULT_MINUTES = CHALLENGE_TIMER.SIMULARE_TOTAL_DEFAULT_SECONDS / 60;

export default function ProvocarePage() {
  const router = useRouter();
  const { play } = useProvocareSound();

  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [useAll, setUseAll] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [customTimer, setCustomTimer] = useState<TimerValue>({ mode: "total", totalMinutes: 10, perQuestionSeconds: 120 });
  const [simulareTimer, setSimulareTimer] = useState<TimerValue>({ mode: "total", totalMinutes: SIMULARE_DEFAULT_MINUTES, perQuestionSeconds: 120 });

  const [pendingPreset, setPendingPreset] = useState<ChallengePreset>("custom");
  const [nameOpen, setNameOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSubject = (id: string) =>
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  const selectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    setSubjectIds((prev) => [...new Set([...prev, ...mod.subjects.map((s) => s.id)])]);
  };
  const deselectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const ids = new Set(mod.subjects.map((s) => s.id));
    setSubjectIds((prev) => prev.filter((s) => !ids.has(s)));
  };

  const pool = useMemo(
    () => subjectIds.reduce((sum, sid) => sum + (questionsBySubject[sid]?.length ?? 0), 0),
    [subjectIds],
  );
  // "Toate" follows the live pool; a preset is clamped to what's available.
  const effective = useAll ? pool : pool > 0 ? Math.min(questionCount, pool) : questionCount;
  const hasSubjects = subjectIds.length > 0;

  function openCreate(preset: ChallengePreset) {
    setPendingPreset(preset);
    setError(null);
    setNameOpen(true);
  }

  async function createLobby(hostName: string) {
    setBusy(true);
    setError(null);
    const isSimulare = pendingPreset === "simulare";
    const timer = isSimulare ? simulareTimer : customTimer;
    try {
      const res = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hostName,
          config: {
            mode: "self_paced",
            preset: pendingPreset,
            // Simulare always runs the full balanced exam, so it ignores the
            // custom subject/count selection and uses every subject + 36 grile.
            subjectIds: isSimulare ? ALL_SUBJECT_IDS : subjectIds,
            questionCount: isSimulare ? EXAM_TOTAL_QUESTIONS : effective,
            shuffleOrder: isSimulare ? true : shuffleOrder,
            shuffleOptions: isSimulare ? true : shuffleOptions,
            instantFeedback: isSimulare ? false : instantFeedback,
            perQuestionSeconds: null,
            capacity: CAPACITY,
            hostPlays: true,
            timer: {
              mode: timer.mode,
              totalSeconds: timer.totalMinutes * 60,
              perQuestionSeconds: timer.perQuestionSeconds,
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ceva n-a mers. Mai încearcă.");
        return;
      }
      savePlayer(data.code, {
        hostToken: data.hostToken,
        playerToken: data.playerToken ?? undefined,
        name: hostName,
      });
      // Flag this code as freshly created so the lobby shows the share overlay.
      // The host lands directly in the lobby (presence active) before sharing,
      // so invitees can never hit a half-created room.
      try { sessionStorage.setItem(`provocare:new:${data.code}`, "1"); } catch { /* ignore */ }
      play("start");
      router.push(`/provocare/${data.code}`);
    } catch {
      setError("Conexiune eșuată. Verifică internetul și mai încearcă.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <Container narrow className="relative">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] animate-fade-in"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Provocare
              </span>
              <SoundToggle />
            </div>
            <h1
              className="mt-2 text-3xl font-bold text-[var(--color-text-primary)] animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Creează o provocare
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Invită-ți colegii printr-un link și vedeți cine punctează mai mult. Fără cont, până la {CAPACITY} jucători.
            </p>
          </div>

          {/* Simulare preset: one-tap multiplayer exam, graded on the 1-10 nota. */}
          <div className="mb-6 animate-slide-up">
            <div
              className="relative rounded-[var(--radius-xl)] border overflow-hidden"
              style={{
                borderColor: "rgba(232, 166, 49, 0.4)",
                background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 45%, var(--color-bg-secondary) 100%)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-accent), transparent)", opacity: 0.08 }}
              />
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Simulare
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Provocare ca la examen
                </h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  36 de grile din toate materiile, cu același echilibru pe module ca la Simulator. Notate pe scala 1-10, iar clasamentul merge pe notă.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-text-tertiary)]">
                  <span>36 de grile</span>
                  <span className="w-px h-3 bg-[var(--color-border)]" />
                  <span>toate materiile</span>
                  <span className="w-px h-3 bg-[var(--color-border)]" />
                  <span>notă pe 1-10</span>
                  <span className="w-px h-3 bg-[var(--color-border)]" />
                  <span>simulare reală</span>
                </div>

                <div className="mt-5">
                  <TimerPicker value={simulareTimer} onChange={setSimulareTimer} />
                </div>

                <button
                  onClick={() => openCreate("simulare")}
                  className="mt-5 w-full py-3.5 rounded-[var(--radius-lg)] text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] shadow-[0_0_30px_rgba(232,166,49,0.15)] hover:shadow-[0_0_40px_rgba(232,166,49,0.25)] active:scale-[0.98]"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                >
                  Creează simularea
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              sau personalizează
            </span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <SubjectSelector
            selectedSubjects={subjectIds}
            onToggleSubject={toggleSubject}
            onSelectAllModule={selectAllModule}
            onDeselectAllModule={deselectAllModule}
          />

          {hasSubjects && (
            <div className="mt-10 animate-slide-up">
              <div
                className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden"
                style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 40%, var(--color-bg-secondary) 100%)" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, var(--color-accent), transparent)", opacity: 0.06 }}
                />
                <div className="relative px-6 pt-8 pb-6 text-center">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Provocare Nouă
                  </span>
                  <div className="mt-3 flex items-baseline justify-center gap-3">
                    <span
                      className="text-5xl sm:text-6xl font-extrabold text-[var(--color-text-primary)] tabular-nums"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                    >
                      {effective}
                    </span>
                    <span className="text-base text-[var(--color-text-tertiary)] font-medium">
                      {effective === 1 ? "întrebare" : "întrebări"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                    <span>{subjectIds.length} {subjectIds.length === 1 ? "materie" : "materii"}</span>
                    <span className="w-px h-3 bg-[var(--color-border)]" />
                    <span>până la {CAPACITY} jucători</span>
                  </div>
                  {!useAll && pool > 0 && pool < questionCount && (
                    <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
                      Doar {pool} disponibile pentru materiile alese.
                    </p>
                  )}
                </div>

                <div className="relative px-5 sm:px-6 pb-6 space-y-5">
                  <div>
                    <span className="block mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Întrebări
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {COUNT_OPTIONS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setUseAll(false); setQuestionCount(n); }}
                          className={cn(
                            "py-2.5 rounded-[var(--radius-md)] text-sm font-bold tabular-nums border transition-all cursor-pointer",
                            !useAll && questionCount === n
                              ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                              : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
                          )}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseAll(true)}
                      className={cn(
                        "mt-1.5 w-full py-2.5 rounded-[var(--radius-md)] text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5",
                        useAll
                          ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                          : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
                      )}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Toate{pool > 0 && <span className="tabular-nums opacity-70">({pool})</span>}
                    </button>
                  </div>

                  <TimerPicker value={customTimer} onChange={setCustomTimer} />

                  <div className="space-y-2.5">
                    <ToggleRow checked={shuffleOrder} onChange={setShuffleOrder} label="Amestecă ordinea" description="Întrebările apar în altă ordine pentru fiecare" />
                    <ToggleRow checked={shuffleOptions} onChange={setShuffleOptions} label="Amestecă variantele" description="Răspunsurile A-D sunt amestecate la fiecare" />
                    <ToggleRow checked={instantFeedback} onChange={setInstantFeedback} label="Feedback instant" description="Arată corect/greșit imediat după răspuns" />
                  </div>

                  <button
                    onClick={() => openCreate("custom")}
                    className="w-full py-4 rounded-[var(--radius-lg)] text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] shadow-[0_0_30px_rgba(232,166,49,0.15)] hover:shadow-[0_0_40px_rgba(232,166,49,0.25)] active:scale-[0.98]"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                  >
                    Creează provocarea
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      <MobileNav />

      <NameModal
        open={nameOpen}
        title="Cum te numești?"
        subtitle="Așa te vor vedea ceilalți în clasament."
        submitLabel={pendingPreset === "simulare" ? "Creează simularea" : "Creează provocarea"}
        busy={busy}
        error={error}
        onSubmit={createLobby}
        onClose={() => { if (!busy) { setNameOpen(false); setError(null); } }}
      />
    </>
  );
}
