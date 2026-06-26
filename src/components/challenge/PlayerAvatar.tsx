import { cn } from "@/lib/utils";

// Deterministic colour per name (no randomness, so it's stable across renders
// and SSR-safe). Pulls from the app's module palette plus a few extras.
const PALETTE = [
  "#E8A631", "#A78BFA", "#34D399", "#F97316",
  "#38BDF8", "#F472B6", "#FBBF24", "#60A5FA",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function avatarColor(name: string): string {
  return PALETTE[hash(name) % PALETTE.length];
}

export function PlayerAvatar({
  name,
  size = 44,
  isHost = false,
  className,
}: {
  name: string;
  size?: number;
  isHost?: boolean;
  className?: string;
}) {
  const color = avatarColor(name);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center rounded-full font-bold select-none flex-shrink-0", className)}
      style={{
        width: size,
        height: size,
        fontFamily: "var(--font-display)",
        fontSize: Math.round(size * 0.36),
        color,
        background: `radial-gradient(circle at 30% 25%, ${color}38, ${color}12)`,
        border: `1.5px solid ${color}66`,
        boxShadow: `0 0 14px ${color}22`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
      {isHost && (
        <span
          className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full"
          style={{
            width: Math.round(size * 0.42),
            height: Math.round(size * 0.42),
            background: "var(--color-accent)",
            color: "#0C0C0E",
            border: "2px solid var(--color-bg-secondary)",
          }}
          title="Gazda"
        >
          <svg width={Math.round(size * 0.24)} height={Math.round(size * 0.24)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z" />
          </svg>
        </span>
      )}
    </div>
  );
}
