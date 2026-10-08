import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = { id, type, title, message };
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-viewport">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast-card toast-${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === "success" && <CheckCircle2 size={18} />}
                            {toast.type === "error" && <XCircle size={18} />}
                            {toast.type === "warning" && <AlertTriangle size={18} />}
                            {toast.type === "info" && <Info size={18} />}
                        </div>
                        <div className="toast-content">
                            <div className="toast-title">{toast.title}</div>
                            {toast.message && <div className="toast-msg">{toast.message}</div>}
                        </div>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return ctx;
};
