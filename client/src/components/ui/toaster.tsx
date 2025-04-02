import React from "react";
import { ToastProvider } from "../../hooks/toast-context";

export function Toaster({ children }: { children?: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}