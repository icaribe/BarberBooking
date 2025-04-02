import { useToast } from "../../hooks/use-toast";
import { useEffect, useState } from "react";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mountedToasts, setMountedToasts] = useState<string[]>([]);

  // Adiciona animação de entrada para novos toasts
  useEffect(() => {
    toasts.forEach(toast => {
      if (!mountedToasts.includes(toast.id)) {
        setMountedToasts(prev => [...prev, toast.id]);
      }
    });
  }, [toasts, mountedToasts]);

  // Remove toasts que não existem mais
  useEffect(() => {
    setMountedToasts(prev => prev.filter(id => toasts.some(toast => toast.id === id)));
  }, [toasts]);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden
            ${toast.variant === "destructive" ? "border-l-4 border-destructive" : ""}
            transform transition-all duration-300 ease-in-out
            ${mountedToasts.includes(toast.id) ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
          `}
        >
          <div className="p-4 relative">
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {toast.title && <div className="font-semibold">{toast.title}</div>}
            {toast.description && <div className="text-sm text-muted-foreground">{toast.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}