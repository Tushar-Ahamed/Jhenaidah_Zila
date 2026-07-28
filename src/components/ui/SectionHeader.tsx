import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  to?: string;
  toLabel?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({ title, subtitle, to, toLabel = 'সব দেখুন', align = 'left' }: SectionHeaderProps) {
  return (
    <div className={`mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 ${align === 'center' ? 'text-center sm:text-center' : ''}`}>
      <div className={align === 'center' ? 'mx-auto' : ''}>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-bd-green-700 dark:text-bd-green-300 hover:gap-2.5 transition-all"
        >
          {toLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
