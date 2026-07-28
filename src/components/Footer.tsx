import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { NAV_LINKS, ORG_INFO } from '@/data/sampleData';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-bd-gradient text-white font-bold">
                ঝি
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{ORG_INFO.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ORG_INFO.tagline}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {ORG_INFO.about.slice(0, 180)}...
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href={ORG_INFO.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 dark:bg-gray-800 text-bd-green-700 dark:text-bd-green-300 hover:bg-bd-green-600 hover:text-white transition">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={`mailto:${ORG_INFO.email}`} aria-label="Email" className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 dark:bg-gray-800 text-bd-green-700 dark:text-bd-green-300 hover:bg-bd-green-600 hover:text-white transition">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">দ্রুত লিংক</h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-bd-green-700 dark:hover:text-bd-green-300 transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">যোগাযোগ</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-bd-green-600" />
                <span>{ORG_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-bd-green-600" />
                <span>{ORG_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-bd-green-600" />
                <span className="break-all">{ORG_INFO.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {ORG_INFO.fullName}। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            ভালোবাসায় তৈরি <Heart className="h-3.5 w-3.5 text-bd-red-500 fill-bd-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
