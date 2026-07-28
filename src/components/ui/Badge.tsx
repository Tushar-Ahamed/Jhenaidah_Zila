import { classNames } from '@/utils/format';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'amber' | 'gray' | 'blue';
  className?: string;
}

const variants: Record<string, string> = {
  green: 'bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300',
  red: 'bg-bd-red-100 text-bd-red-700 dark:bg-bd-red-900/40 dark:text-bd-red-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export function Badge({ children, variant = 'green', className }: BadgeProps) {
  return <span className={classNames('chip', variants[variant], className)}>{children}</span>;
}
