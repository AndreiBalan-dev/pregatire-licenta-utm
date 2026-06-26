"use client";

import { useCallback, useEffect, useState } from "react";
import { cue, isMuted, setMuted, type Cue } from "@/lib/challenge/sound";

/**
 * Thin React wrapper over the challenge sound engine. `play` always reads the
 * live module-level mute state, so it stays correct even though each hook
 * instance keeps its own `muted` flag for rendering the toggle. Initial render
 * is unmuted to match SSR; the real preference is read after mount.
 */
export function useProvocareSound() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const play = useCallback((name: Cue) => cue(name), []);

  const toggleMuted = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }, []);

  return { play, muted, toggleMuted };
}
