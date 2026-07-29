import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { NAV_LINKS, ORG_INFO } from '@/data/sampleData';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-bd-gradient text-white font-bold text-lg shadow-md">
                ঝি
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-base leading-snug">{ORG_INFO.fullName}</p>
                <p className="text-xs text-bd-green-600 dark:text-bd-green-400 font-medium">{ORG_INFO.tagline}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {ORG_INFO.about.slice(0, 180)}...
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={ORG_INFO.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 dark:bg-gray-800 text-bd-green-700 dark:text-bd-green-300 hover:bg-bd-green-600 hover:text-white transition shadow-sm"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${ORG_INFO.email}`}
                aria-label="Email"
                className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 dark:bg-gray-800 text-bd-green-700 dark:text-bd-green-300 hover:bg-bd-green-600 hover:text-white transition shadow-sm"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">দ্রুত লিংক</h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-bd-green-700 dark:hover:text-bd-green-300 transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">যোগাযোগ</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-bd-green-600 shrink-0" />
                <span>{ORG_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-bd-green-600 shrink-0" />
                <span>{ORG_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-bd-green-600 shrink-0" />
                <span className="break-all">{ORG_INFO.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Bottom Footer Bar */}
        <div className="mt-10 pt-6 border-t border-gray-200/80 dark:border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center md:text-left">
          {/* Left Text */}
          <p className="font-medium text-gray-600 dark:text-gray-400">
            © 2026 Jhenaidah Zila Somiti, University of Rajshahi. All rights reserved.
          </p>

          {/* Right Text */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-medium">
            <a href="#" className="hover:text-bd-green-600 dark:hover:text-bd-green-400 transition-colors">Terms</a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="#" className="hover:text-bd-green-600 dark:hover:text-bd-green-400 transition-colors">Privacy Policy</a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
              Designed & Developed with <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse shrink-0" /> by{' '}
              <span className="inline-flex items-center gap-1 font-bold text-bd-green-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/80 dark:border-emerald-700/80 shadow-sm">
                Tushar Ahammed
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
