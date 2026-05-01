// Copy + callbacks driving `ConfirmModal` (LAN warnings, confirm-before-stop, etc.).
export interface IConfirmModalOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}
