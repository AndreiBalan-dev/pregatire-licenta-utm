"use client";

import { useEffect, useState } from "react";

const COLORS = ["#E8A631", "#34D399", "#A78BFA", "#38BDF8", "#F472B6", "#FBBF24"];

// Deterministic pseudo-random from the piece index, so nothing impure runs
// during render (the project uses the React compiler).
function rand(i: number, salt: number): number {
  return (((i + 1) * (salt + 7) * 9301 + 49297) % 233280) / 233280;
}

export function Confetti({ count = 90 }: { count?: number }) {
  const [show, setShow] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); // eslint-disable-line react-hooks/set-state-in-effect
    const t = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(t);
  }, []);

  if (reduced || !show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const left = rand(i, 1) * 100;
        const delay = rand(i, 2) * 0.9;
        const dur = 2.2 + rand(i, 3) * 1.8;
        const drift = (rand(i, 4) - 0.5) * 30;
        const size = 6 + Math.round(rand(i, 5) * 6);
        const isRect = i % 3 === 0;
        const color = COLORS[i % COLORS.length];
        const style = {
          left: `${left}%`,
          width: size,
          height: isRect ? Math.round(size * 0.45) : size,
          background: color,
          borderRadius: isRect ? 1 : "50%",
          "--confetti-dur": `${dur}s`,
          "--confetti-delay": `${delay}s`,
          "--confetti-drift": `${drift}px`,
        } as React.CSSProperties;
        return <span key={i} className="confetti-piece absolute top-0" style={style} />;
      })}
    </div>
  );
}
