import type { Notice } from '@/types';
import { Bell, Flame, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NoticeTickerProps {
  notices: Notice[];
  onSelectNotice?: (notice: Notice) => void;
}

export function NoticeTicker({ notices, onSelectNotice }: NoticeTickerProps) {
  if (notices.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-bd-red-700 via-bd-red-600 to-bd-green-700 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center h-11 overflow-hidden">
        {/* Left Badge */}
        <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg shrink-0 font-bold text-xs uppercase tracking-wider text-amber-300 mr-3 border border-white/20">
          <Flame className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span>নোটিশ আপডেট</span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-xs font-medium">
            {notices.map((n) => (
              <button
                key={n.id}
                onClick={() => onSelectNotice?.(n)}
                className="hover:underline flex items-center gap-2 text-white hover:text-amber-200 transition text-left cursor-pointer"
              >
                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">
                  {n.category}
                </span>
                <span>{n.title}</span>
                <span className="text-white/60 text-[10px]">({new Date(n.date).toLocaleDateString('bn-BD')})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Action */}
        <Link
          to="/notices"
          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-white hover:text-amber-200 ml-4 shrink-0"
        >
          <span>সব নোটিশ</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
