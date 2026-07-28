import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-bd-radial px-4">
          <div className="max-w-md w-full glass-strong rounded-3xl p-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bd-red-100 text-bd-red-600 dark:bg-bd-red-900/40 dark:text-bd-red-300">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">কিছু সমস্যা হয়েছে</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              অপ্রত্যাশিত একটি সমস্যা দেখা দিয়েছে। দয়া করে পৃষ্ঠাটি রিফ্রেশ করুন অথবা পরে আবার চেষ্টা করুন।
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="btn-primary">
                <RefreshCw className="h-4 w-4" /> রিফ্রেশ করুন
              </button>
              <button onClick={this.handleReset} className="btn-ghost">
                আবার চেষ্টা করুন
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
