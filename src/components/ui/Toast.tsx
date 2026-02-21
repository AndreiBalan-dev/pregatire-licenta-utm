"use client";

import { cn } from "@/lib/utils";
import type { Toast as ToastType } from "@/hooks/useToast";

const typeStyles: Record<ToastType["type"], string> = {
  success:
    "border-[var(--color-correct-border)] bg-[var(--color-correct-bg)] text-[var(--color-correct)]",
  error:
    "border-[var(--color-wrong-border)] bg-[var(--color-wrong-bg)] text-[var(--color-wrong)]",
  info:
    "border-[var(--color-border-strong)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-md:bottom-20 max-md:right-2 max-md:left-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "px-4 py-3 rounded-[var(--radius-md)] border text-sm font-medium cursor-pointer toast-enter",
            "shadow-[var(--shadow-md)]",
            typeStyles[toast.type]
          )}
          onClick={() => onRemove(toast.id)}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
