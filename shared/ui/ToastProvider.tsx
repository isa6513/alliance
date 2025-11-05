import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type ToastVariant = "info" | "success" | "error" | "warning" | "confirm";

type ToastBase = {
  id: number;
  variant: ToastVariant;
  title?: string;
  message: string;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  anchorEl?: HTMLElement | null;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topleft"
    | "topright"
    | "bottomleft"
    | "bottomright";
};

type ToastOptions = Omit<ToastBase, "id" | "variant"> & {
  variant?: Exclude<ToastVariant, "confirm">;
  durationMs?: number;
};

type ToastConfirm = ToastBase & {
  anchorEl?: HTMLElement | null;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topleft"
    | "topright"
    | "bottomleft"
    | "bottomright";
  variant: "confirm";
  confirmLabel: string;
  cancelLabel: string;
  resolve: (value: boolean) => void;
};

type AnyToast = ToastBase | ToastConfirm;

type ToastContextValue = {
  showToast: (opts: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider />");
  }
  return ctx;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<AnyToast[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ variant = "info", title, message, durationMs = 4000 }: ToastOptions) => {
      const id = ++idRef.current;
      const toast: AnyToast = { id, variant, title, message };
      setToasts((prev) => [...prev, toast]);

      if (durationMs != null) {
        setTimeout(() => removeToast(id), durationMs);
      }
    },
    [removeToast]
  );

  const confirm = useCallback(
    ({
      title,
      message,
      confirmLabel = "Confirm",
      cancelLabel = "Cancel",
      anchorEl,
      placement,
    }: ConfirmOptions): Promise<boolean> => {
      const id = ++idRef.current;

      return new Promise<boolean>((resolve) => {
        const toast: ToastConfirm = {
          id,
          variant: "confirm",
          title,
          message,
          confirmLabel,
          cancelLabel,
          anchorEl,
          placement,
          resolve,
        };
        setToasts((prev) => [...prev, toast]);
      });
    },
    []
  );

  const handleConfirm = useCallback(
    (toast: ToastConfirm, value: boolean) => {
      toast.resolve(value);
      removeToast(toast.id);
    },
    [removeToast]
  );

  const value: ToastContextValue = {
    showToast,
    success: (message, title) =>
      showToast({ variant: "success", message, title }),
    error: (message, title) => showToast({ variant: "error", message, title }),
    info: (message, title) => showToast({ variant: "info", message, title }),
    warning: (message, title) =>
      showToast({ variant: "warning", message, title }),
    confirm,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div className="z-50 pointer-events-none fixed inset-0 flex flex-col items-end gap-2 px-4 py-6 sm:bottom-0 sm:top-auto sm:items-end">
        {toasts.map((toast) => {
          const isConfirm = toast.variant === "confirm";
          const t = toast as AnyToast;

          const colorClasses =
            t.variant === "success"
              ? "bg-emerald-600 text-white"
              : t.variant === "error"
              ? "bg-red-600 text-white"
              : t.variant === "warning"
              ? "bg-amber-500 text-white"
              : t.variant === "confirm"
              ? "bg-zinc-50 text-black border border-zinc-200"
              : "bg-slate-700 text-white";

          let style: React.CSSProperties = {};
          const confirmToast = t as ToastConfirm;
          if (isConfirm && confirmToast.anchorEl) {
            const rect = confirmToast.anchorEl.getBoundingClientRect();
            const placement = confirmToast.placement || "bottom";

            style = { position: "fixed" };

            const margin = 8;

            switch (placement) {
              case "top":
                style = {
                  ...style,
                  top: rect.top - margin,
                  left: rect.left + rect.width / 2,
                  transform: "translate(-50%, -100%)",
                };
                break;
              case "bottom":
                style = {
                  ...style,
                  top: rect.bottom + margin,
                  left: rect.left + rect.width / 2,
                  transform: "translate(-50%, 0)",
                };
                break;
              case "left":
                style = {
                  ...style,
                  top: rect.top + rect.height / 2,
                  left: rect.left - margin,
                  transform: "translate(-100%, -50%)",
                };
                break;
              case "right":
                style = {
                  ...style,
                  top: rect.top + rect.height / 2,
                  left: rect.right + margin,
                  transform: "translate(0, -50%)",
                };
                break;
              case "topleft":
                style = {
                  ...style,
                  top: rect.top - margin,
                  left: rect.right,
                  transform: "translate(-100%, -100%)",
                };
                break;
              case "topright":
                style = {
                  ...style,
                  top: rect.top - margin,
                  left: rect.right + margin,
                  transform: "translate(0, -100%)",
                };
                break;
              case "bottomleft":
                style = {
                  ...style,
                  top: rect.bottom + margin,
                  left: rect.left - margin,
                  transform: "translate(-100%, 0)",
                };
                break;
              case "bottomright":
                style = {
                  ...style,
                  top: rect.bottom + margin,
                  left: rect.right + margin,
                  transform: "translate(0, 0)",
                };
                break;
            }
          }

          return (
            <div
              key={t.id}
              style={style}
              className={`pointer-events-auto mb-2 w-full max-w-sm rounded-xl shadow-lg ring-1 ring-black/5 ${colorClasses}`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1">
                  {t.title && (
                    <h3 className="text-sm font-semibold">{t.title}</h3>
                  )}
                  <p className="mt-1 text-sm">{t.message}</p>

                  {t.variant === "confirm" && (
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-md px-3 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                        onClick={() => handleConfirm(t as ToastConfirm, false)}
                      >
                        {(t as ToastConfirm).cancelLabel}
                      </button>
                      <button
                        type="button"
                        className={`rounded-md px-3 py-1 text-sm font-medium hover:bg-zinc-100 ${
                          (t as ToastConfirm).confirmLabel === "Delete"
                            ? "text-red-500"
                            : (t as ToastConfirm).confirmLabel === "Create"
                            ? "text-green"
                            : "text-black"
                        }`}
                        onClick={() => handleConfirm(t as ToastConfirm, true)}
                      >
                        {(t as ToastConfirm).confirmLabel}
                      </button>
                    </div>
                  )}
                </div>

                {!isConfirm && (
                  <button
                    type="button"
                    className="ml-2 text-slate-100/70 hover:text-white"
                    onClick={() => removeToast(t.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
