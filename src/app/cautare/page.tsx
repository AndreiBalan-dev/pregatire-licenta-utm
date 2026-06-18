"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { ToastContainer } from "@/components/ui/Toast";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/useToast";
import { allQuestions } from "@/data";
import { modules } from "@/data/modules";
import { buildMergedAnswerMap } from "@/lib/answer-merge";
import { shuffleArray } from "@/lib/utils";
import { TOTAL_QUESTIONS } from "@/lib/site-config";
import {
  EMPTY_CRITERIA,
  criteriaFromParams,
  criteriaToParams,
  hasAnyCriteria,
  searchQuestions,
  type SearchContext,
  type SearchCriteria,
} from "@/lib/search";
import { SearchBar } from "@/components/search/SearchBar";
import { MaterieFilterPopup } from "@/components/search/MaterieFilterPopup";
import { FiltersModal } from "@/components/search/FiltersModal";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { SmartActions } from "@/components/search/SmartActions";
import { LaunchBar } from "@/components/search/LaunchBar";
import { ResultsList } from "@/components/search/ResultsList";

const ALL_SUBJECT_IDS = new Set(modules.flatMap((m) => m.subjects.map((s) => s.id)));
const SURPRISE_COUNT = 20;

/** Seed criteria from the URL, expanding any `?mod=` into its materii (the UI is subject-based). */
function seedFromParams(params: URLSearchParams): SearchCriteria {
  const c = criteriaFromParams(params);
  if (c.moduleIds.length) {
    const extra = c.moduleIds.flatMap(
      (id) => modules.find((m) => m.id === id)?.subjects.map((s) => s.id) ?? [],
    );
    c.subjectIds = [...new Set([...c.subjectIds, ...extra])];
    c.moduleIds = [];
  }
  c.subjectIds = c.subjectIds.filter((id) => ALL_SUBJECT_IDS.has(id));
  return c;
}

function CautareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, startPractice, toggleBookmark } = useSession();
  const { toasts, addToast, removeToast } = useToast();

  const [criteria, setCriteria] = useState<SearchCriteria>(() =>
    seedFromParams(new URLSearchParams(searchParams.toString())),
  );

  // Keep the URL in sync (shareable + back-button friendly), debounced for typing.
  useEffect(() => {
    const qs = criteriaToParams(criteria).toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    const t = setTimeout(() => window.history.replaceState(null, "", url), 300);
    return () => clearTimeout(t);
  }, [criteria]);

  const ctx = useMemo<SearchContext>(
    () => ({ answered: buildMergedAnswerMap(session), bookmarks: new Set(session.bookmarks) }),
    [session],
  );

  const results = useMemo(() => searchQuestions(allQuestions, criteria, ctx), [criteria, ctx]);

  const update = useCallback((patch: Partial<SearchCriteria>) => {
    setCriteria((c) => ({ ...c, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setCriteria((c) => ({
      ...c,
      code: "any",
      codeLanguages: [],
      figure: "any",
      explanation: "any",
      progress: [],
      correctAnswer: null,
      sort: "relevance",
    }));
  }, []);

  const clearAll = useCallback(() => setCriteria(EMPTY_CRITERIA), []);

  const launch = useCallback(
    (mode: "practice" | "test") => {
      const ids = results.map((q) => q.id);
      if (ids.length === 0) return;
      const sessionId = startPractice([], ids, {
        shuffleOptions: session.settings.shuffleOptions,
        mode,
      });
      router.push(`/practica/${sessionId}`);
    },
    [results, startPractice, session.settings.shuffleOptions, router],
  );

  const practiceOne = useCallback(
    (id: number) => {
      const sessionId = startPractice([], [id], {
        mode: "practice",
        shuffleOptions: session.settings.shuffleOptions,
      });
      router.push(`/practica/${sessionId}`);
    },
    [startPractice, session.settings.shuffleOptions, router],
  );

  const surprise = useCallback(() => {
    const picked = shuffleArray(allQuestions.map((q) => q.id)).slice(0, SURPRISE_COUNT);
    const sessionId = startPractice([], picked, {
      mode: "practice",
      shuffleOptions: session.settings.shuffleOptions,
    });
    router.push(`/practica/${sessionId}`);
  }, [startPractice, session.settings.shuffleOptions, router]);

  // Weakest materii: lowest accuracy among attempted subjects (with room to improve).
  const weakSubjects = useMemo(() => {
    return Object.entries(session.subjectStats)
      .filter(([, s]) => s.attempted > 0 && s.correct < s.attempted)
      .map(([id, s]) => ({ id, acc: s.correct / s.attempted, attempted: s.attempted }))
      .sort((a, b) => a.acc - b.acc || b.attempted - a.attempted)
      .slice(0, 3)
      .map((x) => x.id);
  }, [session.subjectStats]);

  const applyWeakSpots = useCallback(() => {
    if (weakSubjects.length === 0) {
      addToast("Rezolvă câteva întrebări întâi ca să-ți știu punctele slabe.", "info");
      return;
    }
    setCriteria({ ...EMPTY_CRITERIA, subjectIds: weakSubjects, progress: ["wrong", "unanswered"] });
    addToast("Am ales materiile tale mai slabe - greșite și nerezolvate.", "info");
  }, [weakSubjects, addToast]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast("Link copiat în clipboard.", "success");
    } catch {
      addToast("Nu am putut copia linkul.", "error");
    }
  }, [addToast]);

  const hasFilters = hasAnyCriteria(criteria);

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <Container narrow className="relative">
          <div className="mb-6">
            <h1
              className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Căutare
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Caută în toate cele {TOTAL_QUESTIONS} de întrebări și pornește exact ce vrei să exersezi.
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <SearchBar value={criteria.q} onChange={(q) => update({ q })} />

            <div className="flex items-center gap-2 flex-wrap">
              <MaterieFilterPopup
                subjectIds={criteria.subjectIds}
                onChange={(subjectIds) => update({ subjectIds })}
              />
              <FiltersModal
                criteria={criteria}
                update={update}
                onResetFilters={resetFilters}
                resultCount={results.length}
              />
              <div className="w-full sm:w-auto sm:ml-auto">
                <SmartActions
                  onSurprise={surprise}
                  onWeakSpots={applyWeakSpots}
                  weakAvailable={weakSubjects.length > 0}
                  onCopyLink={copyLink}
                />
              </div>
            </div>

            <ActiveFilters criteria={criteria} update={update} onClearAll={clearAll} />

            <LaunchBar
              count={results.length}
              onPractice={() => launch("practice")}
              onSimulate={() => launch("test")}
            />
          </div>

          <ResultsList
            results={results}
            query={criteria.q}
            ctx={ctx}
            onToggleBookmark={toggleBookmark}
            onPracticeOne={practiceOne}
            onClearFilters={clearAll}
            hasFilters={hasFilters}
          />
        </Container>
      </main>
      <MobileNav />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function CautarePage() {
  return (
    <Suspense>
      <CautareContent />
    </Suspense>
  );
}
