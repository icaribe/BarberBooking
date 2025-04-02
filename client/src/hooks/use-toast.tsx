import React, { createContext, useContext, useState } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...toast };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto dismiss toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Render toasts UI
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`rounded-lg p-4 shadow-md transition-all ${
                toast.type === "error"
                  ? "bg-red-500 text-white"
                  : toast.type === "success"
                  ? "bg-green-500 text-white"
                  : toast.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : toast.type === "info"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{toast.title}</h3>
                  {toast.description && (
                    <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-sm opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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