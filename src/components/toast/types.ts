export type ToastVariant = "message" | "confirm" | "delete" | "info";

export type ToastActionVariant = "default" | "destructive" | "outline" | "secondary";

export type ToastAction = {
  label: string;
  variant?: ToastActionVariant;
  onClick?: () => void;
};

export type ToastOptions = {
  id?: string;
  variant?: ToastVariant;
  title: string;
  description?: string;
  /** Auto-dismiss after ms. Only applies to `message` and `info` variants. */
  duration?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

export type ToastItem = ToastOptions & {
  id: string;
  open: boolean;
};

export type ToastContextValue = {
  show: (options: ToastOptions) => string;
  message: (options: Omit<ToastOptions, "variant">) => string;
  info: (options: Omit<ToastOptions, "variant">) => string;
  confirm: (options: Omit<ToastOptions, "variant">) => string;
  delete: (options: Omit<ToastOptions, "variant">) => string;
  dismiss: (id: string) => void;
};
