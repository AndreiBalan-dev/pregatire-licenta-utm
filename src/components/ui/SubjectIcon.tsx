import { cn } from "@/lib/utils";

interface SubjectIconProps {
  subjectId: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const ICONS: Record<string, (props: { strokeWidth: number }) => React.ReactNode> = {
  // Programming
  "fundamentele-programarii": (p) => (
    <>
      <polyline points="4 17 10 11 4 5" strokeWidth={p.strokeWidth} />
      <line x1="12" y1="19" x2="20" y2="19" strokeWidth={p.strokeWidth} />
    </>
  ),
  "programare-python": (p) => (
    <>
      <polyline points="16 18 22 12 16 6" strokeWidth={p.strokeWidth} />
      <polyline points="8 6 2 12 8 18" strokeWidth={p.strokeWidth} />
    </>
  ),
  "poo-cpp": (p) => (
    <>
      <circle cx="12" cy="12" r="3" strokeWidth={p.strokeWidth} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth={p.strokeWidth} />
    </>
  ),
  "metode-avansate-java": (p) => (
    <>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" strokeWidth={p.strokeWidth} />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" strokeWidth={p.strokeWidth} />
      <line x1="6" y1="1" x2="6" y2="4" strokeWidth={p.strokeWidth} />
      <line x1="10" y1="1" x2="10" y2="4" strokeWidth={p.strokeWidth} />
      <line x1="14" y1="1" x2="14" y2="4" strokeWidth={p.strokeWidth} />
    </>
  ),
  "tehnici-avansate": (p) => (
    <>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth={p.strokeWidth} />
    </>
  ),
  "algoritmi-structuri-date": (p) => (
    <>
      <circle cx="6" cy="6" r="3" strokeWidth={p.strokeWidth} />
      <circle cx="6" cy="18" r="3" strokeWidth={p.strokeWidth} />
      <path d="M15.7 6.3a4 4 0 0 1-4 4H8" strokeWidth={p.strokeWidth} />
      <path d="M6 9v6" strokeWidth={p.strokeWidth} />
      <path d="M18 9a4 4 0 0 1-4 4h-2" strokeWidth={p.strokeWidth} />
    </>
  ),

  // Databases
  "baze-de-date": (p) => (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" strokeWidth={p.strokeWidth} />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" strokeWidth={p.strokeWidth} />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" strokeWidth={p.strokeWidth} />
    </>
  ),
  "sgbd": (p) => (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" strokeWidth={p.strokeWidth} />
      <rect x="2" y="14" width="20" height="8" rx="2" strokeWidth={p.strokeWidth} />
      <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth={p.strokeWidth} />
      <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth={p.strokeWidth} />
    </>
  ),

  // Networks
  "sisteme-de-operare": (p) => (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth={p.strokeWidth} />
      <line x1="8" y1="21" x2="16" y2="21" strokeWidth={p.strokeWidth} />
      <line x1="12" y1="17" x2="12" y2="21" strokeWidth={p.strokeWidth} />
    </>
  ),
  "retele-calculatoare": (p) => (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth={p.strokeWidth} />
      <line x1="2" y1="12" x2="22" y2="12" strokeWidth={p.strokeWidth} />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth={p.strokeWidth} />
    </>
  ),
  "criptografie": (p) => (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth={p.strokeWidth} />
      <path d="M9 12l2 2 4-4" strokeWidth={p.strokeWidth} />
    </>
  ),

  // Web
  "tehnologii-web": (p) => (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth={p.strokeWidth} />
      <line x1="2" y1="12" x2="22" y2="12" strokeWidth={p.strokeWidth} />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth={p.strokeWidth} />
    </>
  ),
  "comert-electronic": (p) => (
    <>
      <circle cx="9" cy="21" r="1" strokeWidth={p.strokeWidth} />
      <circle cx="20" cy="21" r="1" strokeWidth={p.strokeWidth} />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth={p.strokeWidth} />
    </>
  ),
  "cloud-computing": (p) => (
    <>
      <path d="M17.5 19a4.5 4.5 0 1 0 0-9 6 6 0 0 0-11.5 2 4 4 0 0 0 1 7.87" strokeWidth={p.strokeWidth} />
    </>
  ),
  "inovare-transformare-digitala": (p) => (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" strokeWidth={p.strokeWidth} />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" strokeWidth={p.strokeWidth} />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" strokeWidth={p.strokeWidth} />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" strokeWidth={p.strokeWidth} />
    </>
  ),
};

export function SubjectIcon({ subjectId, size = 16, className, strokeWidth = 2 }: SubjectIconProps) {
  const renderIcon = ICONS[subjectId];
  return (
    <span
      className={cn("inline-flex items-center justify-center flex-shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {renderIcon ? (
          renderIcon({ strokeWidth })
        ) : (
          <>
            <circle cx="12" cy="12" r="10" strokeWidth={strokeWidth} />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth={strokeWidth} />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={strokeWidth} />
          </>
        )}
      </svg>
    </span>
  );
}
