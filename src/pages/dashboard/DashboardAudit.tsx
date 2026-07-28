import { useEffect, useState } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { listAuditLogs, describeAction } from '@/services/userService';
import { ROLE_LABELS, type AuditLog } from '@/types';
import { ScrollText, RefreshCw } from 'lucide-react';
import { formatBnDate } from '@/utils/format';

export function DashboardAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await listAuditLogs(100);
      setLogs(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">অডিট লগ</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">সকল গুরুত্বপূর্ণ কার্যক্রমের ইতিহাস</p>
          </div>
          <button onClick={load} className="btn-ghost"><RefreshCw className="h-4 w-4" /> রিফ্রেশ</button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : logs.length === 0 ? (
        <EmptyState icon={<ScrollText className="h-8 w-8" />} title="কোনো লগ নেই" description="এখনো কোনো কার্যক্রম লগ করা হয়নি।" />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log, i) => (
              <FadeIn key={log.id ?? i} delay={(i % 8) * 0.03}>
                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300 shrink-0">
                    <ScrollText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{describeAction(log.action)}</span>
                      <span className="chip bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{ROLE_LABELS[log.actorRole]}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{log.actorEmail}</span>
                      {log.targetEmail && ` → ${log.targetEmail}`}
                    </p>
                    {log.details && <p className="mt-0.5 text-xs text-gray-400">{log.details}</p>}
                  </div>
                  <div className="text-xs text-gray-400 shrink-0 text-right">{formatBnDate(new Date(log.createdAt).toISOString(), 'd MMM yyyy, h:mm a')}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
