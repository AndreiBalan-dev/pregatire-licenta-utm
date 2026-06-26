"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { SubjectSelector } from "@/components/practice/SubjectSelector";
import { ToggleRow } from "@/components/challenge/ToggleRow";
import { NameModal } from "@/components/challenge/NameModal";
import { SoundToggle } from "@/components/challenge/SoundToggle";
import { useProvocareSound } from "@/hooks/useProvocareSound";
import { savePlayer } from "@/lib/challenge/identity";
import { modules } from "@/data/modules";
import { questionsBySubject } from "@/data";
import { cn } from "@/lib/utils";

const COUNT_OPTIONS = [5, 10, 20, 30, 50];
const CAPACITY = 6;

// Quick-pick minutes for the whole-game timer; the slider covers 1-120 in full.
const TIMER_PRESETS = [5, 10, 20, 30, 60];
const PER_Q_OPTIONS = [
  { s: 15, label: "15 sec" },
  { s: 30, label: "30 sec" },
  { s: 60, label: "1 min" },
  { s: 120, label: "2 min" },
  { s: 180, label: "3 min" },
  { s: 300, label: "5 min" },
];
type TimerMode = "total" | "per_question";

export default function ProvocarePage() {
  const router = useRouter();
  const { play } = useProvocareSound();

  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [useAll, setUseAll] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [timerMode, setTimerMode] = useState<TimerMode>("total");
  const [totalMinutes, setTotalMinutes] = useState(10);
  const [perQuestionSeconds, setPerQuestionSeconds] = useState(120);

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

  async function createLobby(hostName: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hostName,
          config: {
            mode: "self_paced",
            subjectIds,
            questionCount: effective,
            shuffleOrder,
            shuffleOptions,
            instantFeedback,
            perQuestionSeconds: null,
            capacity: CAPACITY,
            hostPlays: true,
            timer: {
              mode: timerMode,
              totalSeconds: totalMinutes * 60,
              perQuestionSeconds,
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
              Alege materiile, invită-ți colegii printr-un link și vedeți cine punctează mai mult. Fără cont, până la {CAPACITY} jucători.
            </p>
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

                  <div>
                    <span className="block mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Timp
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: "total", label: "Timp total" },
                        { key: "per_question", label: "Pe întrebare" },
                      ] as const).map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setTimerMode(m.key)}
                          className={cn(
                            "py-2.5 rounded-[var(--radius-md)] text-sm font-bold border transition-all cursor-pointer",
                            timerMode === m.key
                              ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                              : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
                          )}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {timerMode === "total" ? (
                      <div className="mt-3">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-xs text-[var(--color-text-tertiary)]">Durata întregului joc</span>
                          <span className="text-sm font-bold tabular-nums text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
                            {totalMinutes} min
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={120}
                          step={1}
                          value={totalMinutes}
                          onChange={(e) => setTotalMinutes(Number(e.target.value))}
                          className="w-full cursor-pointer"
                          style={{ accentColor: "var(--color-accent)" }}
                          aria-label="Durata totală în minute"
                        />
                        <div className="mt-2.5 grid grid-cols-5 gap-1.5">
                          {TIMER_PRESETS.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setTotalMinutes(m)}
                              className={cn(
                                "py-1.5 rounded-[var(--radius-md)] text-xs font-bold tabular-nums border transition-all cursor-pointer",
                                totalMinutes === m
                                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                                  : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]",
                              )}
                            >
                              {m}m
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <span className="block mb-2 text-xs text-[var(--color-text-tertiary)]">Timp pentru fiecare întrebare</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {PER_Q_OPTIONS.map((o) => (
                            <button
                              key={o.s}
                              type="button"
                              onClick={() => setPerQuestionSeconds(o.s)}
                              className={cn(
                                "py-2.5 rounded-[var(--radius-md)] text-sm font-bold tabular-nums border transition-all cursor-pointer",
                                perQuestionSeconds === o.s
                                  ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                                  : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
                              )}
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
                      {timerMode === "total"
                        ? "Toți au același timp pentru tot testul. Răspunzi corect și rapid = mai multe puncte."
                        : "Fiecare întrebare are limita ei. Când timpul expiră, treci automat mai departe."}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <ToggleRow checked={shuffleOrder} onChange={setShuffleOrder} label="Amestecă ordinea" description="Întrebările apar în altă ordine pentru fiecare" />
                    <ToggleRow checked={shuffleOptions} onChange={setShuffleOptions} label="Amestecă variantele" description="Răspunsurile A-D sunt amestecate la fiecare" />
                    <ToggleRow checked={instantFeedback} onChange={setInstantFeedback} label="Feedback instant" description="Arată corect/greșit imediat după răspuns" />
                  </div>

                  <button
                    onClick={() => { setError(null); setNameOpen(true); }}
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
        submitLabel="Creează provocarea"
        busy={busy}
        error={error}
        onSubmit={createLobby}
        onClose={() => { if (!busy) { setNameOpen(false); setError(null); } }}
      />
    </>
  );
}
