"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ExamRepeatBadge } from "@/components/exam/ExamRepeatBadge";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { modules } from "@/data/modules";
import { scoreGradientCss, scorePositionPct, scoreToColor } from "@/lib/exam";
import { cn } from "@/lib/utils";
import type { ExamSummaryData } from "@/hooks/useSession";

interface ExamHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: ExamSummaryData[];
  onClear?: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "acum câteva secunde";
  if (min < 60) return `acum ${min} ${min === 1 ? "minut" : "minute"}`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `acum ${hours} ${hours === 1 ? "oră" : "ore"}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `acum ${days} ${days === 1 ? "zi" : "zile"}`;
  const months = Math.floor(days / 30);
  return `acum ${months} ${months === 1 ? "lună" : "luni"}`;
}

function formatDuration(ms: number | null): string {
  if (!ms || ms <= 0) return "";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return `${hours}h ${min}m`;
  if (min > 0) return `${min}m`;
  return `${totalSec}s`;
}

export function ExamHistoryModal({ open, onClose, history, onClear }: ExamHistoryModalProps) {
  const theme = useResolvedTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const sorted = useMemo(
    () => [...history].sort((a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return tb - ta;
    }),
    [history],
  );

  return (
    <Modal open={open} onClose={onClose} title={`Istoric examene (${history.length})`} className="!max-w-2xl">
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Nu există examene în istoric încă.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] leading-relaxed">
              Toate examenele tale anterioare. Apasă pe oricare pentru a vedea cum ai stat pe module sau să deschizi review-ul complet.
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
              {sorted.map((s) => {
                const color = scoreToColor(s.score, theme);
                const isExpanded = expandedId === s.examId;
                const modStats = modules
                  .map((m) => {
                    const stat = s.perModule[m.id] || { correct: 0, total: 0 };
                    return { mod: m, ...stat, pct: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0 };
                  })
                  .filter((m) => m.total > 0);

                return (
                  <div
                    key={s.examId}
                    className={cn(
                      "rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] overflow-hidden transition-colors",
                      isExpanded ? "border-[var(--color-border-strong)]" : "border-[var(--color-border)]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : s.examId)}
                      className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                      aria-expanded={isExpanded}
                    >
                      {/* Score chip */}
                      <div
                        className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--radius-md)] flex items-center justify-center font-extrabold tabular-nums"
                        style={{
                          background: "var(--color-bg-secondary)",
                          border: `1px solid ${color}40`,
                          color,
                          fontFamily: "var(--font-display)",
                          fontSize: s.score >= 10 ? "14px" : "17px",
                          letterSpacing: "-0.02em",
                        }}
                        aria-hidden="true"
                      >
                        {s.score.toFixed(2)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]" style={{ fontFamily: "var(--font-display)" }}>
                            {s.submittedAt ? timeAgo(s.submittedAt) : "neexpediat"}
                          </span>
                          {s.isRepeat && <ExamRepeatBadge size="sm" shuffled={s.repeatShuffled} />}
                        </div>
                        <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                          <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">{s.correctCount}</span>
                          <span className="text-[var(--color-text-tertiary)]">/{s.total} corecte</span>
                          {s.unansweredCount > 0 && (
                            <>
                              <span className="text-[var(--color-text-tertiary)]"> · </span>
                              <span className="tabular-nums">{s.unansweredCount}</span>
                              <span className="text-[var(--color-text-tertiary)]"> fără răspuns</span>
                            </>
                          )}
                          {s.durationMs && (
                            <>
                              <span className="text-[var(--color-text-tertiary)] hidden sm:inline"> · </span>
                              <span className="text-[var(--color-text-tertiary)] block sm:inline font-mono text-[10px] sm:text-xs mt-0.5 sm:mt-0">
                                {formatDuration(s.durationMs)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expand chevron */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                          "flex-shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[var(--color-border)] px-3 sm:px-4 py-3 sm:py-4 space-y-3 animate-fade-in">
                        {/* Gradient bar */}
                        <div>
                          <div className="relative">
                            <div
                              className="h-1.5 rounded-full overflow-hidden border border-[var(--color-border)]"
                              style={{ background: scoreGradientCss(theme) }}
                              aria-hidden="true"
                            />
                            <div
                              className="absolute top-1/2 w-2.5 h-2.5 rounded-full"
                              style={{
                                left: `${scorePositionPct(s.score)}%`,
                                transform: "translate(-50%, -50%)",
                                background: color,
                                boxShadow: `0 0 0 2px var(--color-bg-primary), 0 0 6px ${color}AA`,
                              }}
                              aria-hidden="true"
                            />
                          </div>
                        </div>

                        {/* Per-module mini bars */}
                        {modStats.length > 0 && (
                          <div className="space-y-1.5">
                            {modStats.map((m) => (
                              <div key={m.mod.id} className="flex items-center gap-2.5">
                                <span className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] flex-shrink-0 w-20 sm:w-28 truncate">
                                  {m.mod.name}
                                </span>
                                <div className="flex-1 h-1 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${m.pct}%`, backgroundColor: m.mod.color }}
                                  />
                                </div>
                                <span
                                  className="text-[10px] sm:text-[11px] font-semibold tabular-nums flex-shrink-0 w-10 text-right"
                                  style={{
                                    color: m.pct >= 70 ? "var(--color-correct)" : m.pct >= 40 ? "var(--color-accent)" : "var(--color-wrong)",
                                  }}
                                >
                                  {m.correct}/{m.total}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Link to full review */}
                        <Link
                          href={`/simulator/${s.examId}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40 text-xs font-semibold hover:bg-[var(--color-accent)] hover:text-[#0C0C0E] transition-all"
                          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                        >
                          Vezi review-ul complet
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="9 6 15 12 9 18" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer actions */}
        {onClear && sorted.length > 0 && (
          <div className="pt-3 mt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-3 flex-wrap">
            {confirmingClear ? (
              <>
                <span className="text-xs text-[var(--color-text-secondary)]">Sigur ștergi tot istoricul?</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(false)}>
                    Anulează
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      onClear();
                      setConfirmingClear(false);
                    }}
                  >
                    Da, șterge tot
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  Maxim 20 examene memorate. Cele mai vechi se șterg automat.
                </span>
                <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(true)}>
                  Șterge istoricul
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
