import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1
        className="text-6xl font-extrabold text-[var(--color-accent)] mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        404
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-8 text-center">
        Pagina nu a fost gasita.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        Inapoi acasa
      </Link>
    </div>
  );
}
