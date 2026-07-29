import type { CommitteeMemberRecord } from '@/types';
import { Mail, Phone, UserCheck, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface OrgChartProps {
  members: CommitteeMemberRecord[];
  title?: string;
}

export function OrgChart({ members, title }: OrgChartProps) {
  // Group members into hierarchy levels
  const president = members.find((m) => m.position === 'সভাপতি' || m.position === 'President');
  const vicePresidents = members.filter(
    (m) =>
      m.position.includes('সহ-সভাপতি') ||
      m.position === 'Senior Vice President' ||
      m.position === 'Vice President'
  );
  const generalSecretary = members.find(
    (m) => m.position === 'সাধারণ সম্পাদক' || m.position === 'General Secretary'
  );
  const secretaries = members.filter(
    (m) =>
      m.id !== president?.id &&
      m.id !== generalSecretary?.id &&
      !vicePresidents.some((vp) => vp.id === m.id) &&
      !m.position.includes('কার্যনির্বাহী') &&
      m.position !== 'Executive Member'
  );
  const executiveMembers = members.filter(
    (m) => m.position.includes('কার্যনির্বাহী') || m.position === 'Executive Member'
  );

  return (
    <div className="py-6 overflow-x-auto">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-bd-green-600" />
            {title} — সাংগঠনিক অবকাঠামো (Org Chart)
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            কমিটির নেতৃত্ব ও প্রশাসনিক ক্ষমতার ক্রমবিন্যাস
          </p>
        </div>
      )}

      <div className="min-w-[750px] max-w-5xl mx-auto space-y-8 flex flex-col items-center">
        {/* LEVEL 1: PRESIDENT */}
        {president ? (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-700 via-bd-green-600 to-teal-800 text-white shadow-xl max-w-sm w-72 text-center border-2 border-emerald-400/40"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-bold text-xs shadow-md uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> {president.position}
              </div>
              <div className="mt-2 grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-white/20 text-white text-2xl font-bold border border-white/30 shadow-inner overflow-hidden">
                {president.photoUrl ? (
                  <img src={president.photoUrl} alt={president.name} className="h-full w-full object-cover" />
                ) : (
                  president.name[0]
                )}
              </div>
              <h3 className="mt-3 font-bold text-lg leading-snug">{president.name}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">{president.department} • {president.studentSession}</p>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-center gap-3 text-xs text-emerald-100">
                {president.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {president.phone}</span>}
                {president.email && <span className="flex items-center gap-1 truncate max-w-[130px]"><Mail className="h-3 w-3" /> {president.email}</span>}
              </div>
            </motion.div>
            {/* Connecting Vertical Line */}
            <div className="h-8 w-0.5 bg-emerald-500/50 my-1"></div>
          </div>
        ) : (
          <div className="text-xs text-gray-400">সভাপতি পদবী খালি</div>
        )}

        {/* LEVEL 2: VICE PRESIDENTS */}
        {vicePresidents.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="relative flex justify-center gap-6 flex-wrap">
              {/* Connector line behind cards */}
              {vicePresidents.length > 1 && (
                <div className="absolute -top-4 left-1/4 right-1/4 h-0.5 bg-emerald-500/50"></div>
              )}
              {vicePresidents.map((vp) => (
                <div key={vp.id} className="flex flex-col items-center">
                  <div className="h-4 w-0.5 bg-emerald-500/50 -mt-4"></div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-emerald-500/30 shadow-md text-center w-64"
                  >
                    <Badge variant="green" className="mb-2">{vp.position}</Badge>
                    <div className="grid h-12 w-12 mx-auto place-items-center rounded-xl bg-bd-green-100 text-bd-green-800 font-bold text-lg">
                      {vp.photoUrl ? (
                        <img src={vp.photoUrl} alt={vp.name} className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        vp.name[0]
                      )}
                    </div>
                    <h4 className="mt-2 font-semibold text-sm text-gray-900 dark:text-white">{vp.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{vp.department} • {vp.studentSession}</p>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="h-8 w-0.5 bg-emerald-500/50 my-1"></div>
          </div>
        )}

        {/* LEVEL 3: GENERAL SECRETARY */}
        {generalSecretary && (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative p-4 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-900 text-white shadow-lg w-72 text-center border border-teal-400/40"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-300 text-teal-950 font-bold text-xs shadow-md">
                {generalSecretary.position}
              </div>
              <div className="mt-2 grid h-14 w-14 mx-auto place-items-center rounded-xl bg-white/20 text-white text-xl font-bold overflow-hidden">
                {generalSecretary.photoUrl ? (
                  <img src={generalSecretary.photoUrl} alt={generalSecretary.name} className="h-full w-full object-cover" />
                ) : (
                  generalSecretary.name[0]
                )}
              </div>
              <h3 className="mt-2 font-bold text-base">{generalSecretary.name}</h3>
              <p className="text-xs text-teal-100">{generalSecretary.department} • {generalSecretary.studentSession}</p>
            </motion.div>
            <div className="h-8 w-0.5 bg-teal-500/50 my-1"></div>
          </div>
        )}

        {/* LEVEL 4: SECRETARIES */}
        {secretaries.length > 0 && (
          <div className="w-full">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                সম্পাদক মণ্ডলী ({secretaries.length} জন)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {secretaries.map((sec) => (
                <motion.div
                  key={sec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-3 text-center border-l-4 border-l-bd-green-500 hover:shadow-md transition"
                >
                  <span className="text-[11px] font-medium text-bd-green-700 dark:text-bd-green-300 block truncate">
                    {sec.position}
                  </span>
                  <p className="font-semibold text-xs text-gray-900 dark:text-white mt-1 truncate">
                    {sec.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {sec.department}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* LEVEL 5: EXECUTIVE MEMBERS */}
        {executiveMembers.length > 0 && (
          <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                কার্যনির্বাহী সদস্যবৃন্দ ({executiveMembers.length} জন)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {executiveMembers.map((m) => (
                <div key={m.id} className="card p-3 text-center bg-gray-50/50 dark:bg-gray-900/50">
                  <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-[10px] text-gray-500">{m.department} • {m.studentSession}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
