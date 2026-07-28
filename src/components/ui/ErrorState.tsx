import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'কিছু একটা সমস্যা হয়েছে',
  description = 'দয়া করে কিছুক্ষণ পরে আবার চেষ্টা করুন।',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-bd-red-200 dark:border-bd-red-900/40 bg-bd-red-50/50 dark:bg-bd-red-950/20 py-14 px-6 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-bd-red-100 text-bd-red-600 dark:bg-bd-red-900/40 dark:text-bd-red-300">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-5">
          <RefreshCw className="h-4 w-4" /> আবার চেষ্টা করুন
        </button>
      )}
    </div>
  );
}
