import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'নিশ্চিত করুন', danger = true, loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`grid h-14 w-14 place-items-center rounded-full ${danger ? 'bg-bd-red-100 text-bd-red-600 dark:bg-bd-red-900/40 dark:text-bd-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'}`}>
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        <div className="mt-6 flex gap-3 w-full">
          <button onClick={onClose} className="btn-ghost flex-1" disabled={loading}>বাতিল</button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {loading ? 'প্রক্রিয়াকরণ...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
