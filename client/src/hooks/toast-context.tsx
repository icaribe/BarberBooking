import React, { createContext, useContext, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info" | "default";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id" | "type"> & { type?: ToastType }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id" | "type"> & { type?: ToastType }) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: Toast = {
      id,
      title: toast.title,
      description: toast.description,
      type: toast.type || "default",
      duration: toast.duration || 3000
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg p-4 shadow-lg transition-all duration-300 transform translate-y-0 
              ${toast.type === "success" ? "bg-green-500 text-white" :
                toast.type === "error" ? "bg-red-500 text-white" :
                toast.type === "warning" ? "bg-yellow-500 text-white" :
                toast.type === "info" ? "bg-blue-500 text-white" :
                "bg-gray-800 text-white"
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{toast.title}</h4>
                {toast.description && <p className="mt-1 text-sm opacity-90">{toast.description}</p>}
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}