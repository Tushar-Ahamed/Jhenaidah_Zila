import { classNames } from '@/utils/format';

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className, rounded = 'rounded-md' }: SkeletonProps) {
  return <div className={classNames('skeleton', rounded, className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={classNames('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" rounded="rounded" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5">
      <Skeleton className="h-40 w-full" rounded="rounded-xl" />
      <Skeleton className="mt-4 h-5 w-3/4" />
      <SkeletonText lines={2} className="mt-3" />
    </div>
  );
}
