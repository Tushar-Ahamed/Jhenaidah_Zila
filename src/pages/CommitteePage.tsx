import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { listCommitteeMembers } from '@/services/committeeService';
import { OrgChart } from '@/components/committee/OrgChart';
import {
  COMMITTEE_POSITIONS,
  COMMITTEE_SESSIONS,
  UPAZILA_OPTIONS,
  type CommitteeMemberRecord,
  type UpazilaName,
} from '@/types';
import { Mail, Phone, Search, LayoutGrid, GitFork, BookOpen, Calendar, Printer, Download } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

export function CommitteePage() {
  const [selectedSession, setSelectedSession] = useState(COMMITTEE_SESSIONS[0]);
  const [selectedScope, setSelectedScope] = useState<'district' | 'upazila'>('district');
  const [selectedUpazila, setSelectedUpazila] = useState<UpazilaName>('ঝিনাইদহ সদর');

  // View Mode: 'cards' | 'orgchart' | 'directory'
  const [viewMode, setViewMode] = useState<'cards' | 'orgchart' | 'directory'>('cards');

  // Data & Filter State
  const [members, setMembers] = useState<CommitteeMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'leadership' | 'secretariat' | 'executive'>('all');

  const debouncedQuery = useDebounce(query, 250);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const records = await listCommitteeMembers(
        selectedSession,
        selectedScope,
        selectedScope === 'upazila' ? selectedUpazila : undefined
      );
      setMembers(records);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedSession, selectedScope, selectedUpazila]);

  const filteredMembers = members.filter((m) => {
    const q = debouncedQuery.trim().toLowerCase();
    const haystack = [m.name, m.position, m.department, m.studentSession, m.phone ?? '', m.email ?? ''].join(' ').toLowerCase();
    const matchQuery = !q || haystack.includes(q);

    if (!matchQuery) return false;
    if (categoryFilter === 'all') return true;

    const posConfig = COMMITTEE_POSITIONS.find((p) => p.bnLabel === m.position);
    if (categoryFilter === 'leadership') return posConfig?.category === 'leadership' || m.position.includes('সভাপতি') || m.position.includes('সম্পাদক');
    if (categoryFilter === 'secretariat') return posConfig?.category === 'secretariat' || m.position.includes('সম্পাদক');
    if (categoryFilter === 'executive') return posConfig?.category === 'executive' || m.position.includes('কার্যনির্বাহী');
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (members.length === 0) {
      toast.error('পিডিএফ ডাউনলোড করার জন্য কোনো কমিটি তথ্য নেই');
      return;
    }

    const title = `${selectedScope === 'district' ? 'জেলা কমিটি' : `${selectedUpazila} উপজেলা কমিটি`} (${selectedSession})`;
    const printWin = window.open('', '_blank');
    if (!printWin) {
      toast.error('পপ-আপ ব্লক করা আছে, অনুগ্রহ করে ব্রাউজার থেকে পপ-আপ অনুমতি দিন');
      return;
    }

    const rowsHtml = filteredMembers
      .map(
        (m, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: bold; color: #4b5563;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #047857;">${m.position}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${m.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">${m.department || '-'} (${m.studentSession || '-'})</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">${m.phone || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">${m.email || '-'}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>${title} - ঝিনাইদহ জেলা সমিতি</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
          body { font-family: 'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif; padding: 30px; color: #1f2937; background: #fff; }
          .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 26px; font-weight: bold; color: #059669; }
          .sublogo { font-size: 14px; color: #4b5563; margin-top: 2px; }
          .title { font-size: 20px; font-weight: bold; margin-top: 15px; color: #111827; background: #ecfdf5; padding: 8px 16px; display: inline-block; border-radius: 8px; border: 1px solid #a7f3d0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background-color: #f3f4f6; color: #374151; padding: 12px 10px; font-weight: bold; text-align: left; border-bottom: 2px solid #d1d5db; }
          th.center, td.center { text-align: center; }
          .footer { margin-top: 40px; text-align: right; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ঝিনাইদহ জেলা সমিতি</div>
          <div class="sublogo">রাজশাহী বিশ্ববিদ্যালয়</div>
          <div class="title">${title}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th class="center" style="width: 40px;">#</th>
              <th>পদবি</th>
              <th>নাম</th>
              <th>বিভাগ ও সেশন</th>
              <th>মোবাইল/ফোন</th>
              <th>ইমেইল</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          প্রিন্ট / ডাউনলোড সময়: ${new Date().toLocaleString('bn-BD')}<br>
          © ঝিনাইদহ জেলা সমিতি, রাজশাহী বিশ্ববিদ্যালয়
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
    toast.success('কমিটি তালিকা PDF আকারে ডাউনলোড/প্রিন্ট করতে প্রস্তুত');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEO
        title="কমিটি নির্দেশিকা ও ইতিহাস"
        description="ঝিনাইদহ জেলা সমিতির আহ্বায়ক ও পূর্ণাঙ্গ কমিটি নির্দেশিকা, সাংগঠনিক কাঠামো ও পূর্ববর্তী বছরের ইতিহাস।"
      />

      {/* Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <span className="chip bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">
              ঝিনাইদহ জেলা সমিতি • কমিটি ইতিহাস ও নির্দেশিকা
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3">
              {selectedScope === 'district' ? 'জেলা কমিটি' : `${selectedUpazila} উপজেলা কমিটি`} {selectedSession}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              সমিতির সার্বিক কার্যক্রম পরিচালনার জন্য গঠিত নির্বাচিত ও দায়িত্বপ্রাপ্ত সদস্যবৃন্দ।
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn-ghost !py-2 !px-3 text-xs">
              <Printer className="h-4 w-4" /> প্রিন্ট
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary !py-2 !px-3 text-xs bg-gradient-to-r from-emerald-600 to-teal-600">
              <Download className="h-4 w-4" /> ডাউনলোড (PDF)
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Filter Controls Bar */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Year / Scope Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year/Session Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200">
            <Calendar className="h-4 w-4 text-bd-green-600" />
            <span>সেশন:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              {COMMITTEE_SESSIONS.map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-gray-900">{s}</option>
              ))}
            </select>
          </div>

          {/* Scope Switcher (District vs Upazila) */}
          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setSelectedScope('district')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                selectedScope === 'district' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              জেলা কমিটি
            </button>
            <button
              onClick={() => setSelectedScope('upazila')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                selectedScope === 'upazila' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              উপজেলা কমিটি
            </button>
          </div>

          {/* Upazila Dropdown */}
          {selectedScope === 'upazila' && (
            <select
              value={selectedUpazila || ''}
              onChange={(e) => setSelectedUpazila(e.target.value as UpazilaName)}
              className="input !py-1.5 !px-3 !text-xs !w-auto"
            >
              {UPAZILA_OPTIONS.map((u) => (
                <option key={u} value={u ?? ''}>{u}</option>
              ))}
            </select>
          )}
        </div>

        {/* Right: View Mode Selector */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 self-end md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'cards' ? 'bg-white dark:bg-gray-900 text-bd-green-700 dark:text-bd-green-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> সুন্দর কার্ড (Cards)
          </button>
          <button
            onClick={() => setViewMode('orgchart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'orgchart' ? 'bg-white dark:bg-gray-900 text-bd-green-700 dark:text-bd-green-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <GitFork className="h-3.5 w-3.5" /> অর্গ চার্ট (Org Chart)
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'directory' ? 'bg-white dark:bg-gray-900 text-bd-green-700 dark:text-bd-green-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> ডিরেক্টরি (Directory)
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: BEAUTIFUL CARDS */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
              className="input pl-10"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">লোডিং হচ্ছে...</div>
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              title="কোনো পদবিধারী সদস্য পাওয়া যায়নি"
              description="আপনার নির্বাচিত সেশন বা ফিল্টারের সাথে মিলে যাওয়া কোনো কমিটি সদস্য নেই।"
            />
          ) : (
            <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((m) => (
                <StaggerItem key={m.id}>
                  <div className="card p-5 h-full flex flex-col justify-between border-t-4 border-t-bd-green-600 hover:shadow-lg transition">
                    <div>
                      <div className="flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-bd-green-600 to-teal-800 text-white text-xl font-bold shrink-0 shadow-md overflow-hidden">
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                          ) : (
                            m.name[0]
                          )}
                        </div>
                        <div className="min-w-0">
                          <Badge variant="green" className="mb-1">{m.position}</Badge>
                          <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{m.name}</h3>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                        <p><span className="font-semibold text-gray-400">বিভাগ:</span> {m.department || 'অনুল্লেখিত'}</p>
                        <p><span className="font-semibold text-gray-400">সেশন:</span> {m.studentSession || 'অনুল্লেখিত'}</p>
                        {m.upazila && <p><span className="font-semibold text-gray-400">উপজেলা:</span> {m.upazila}</p>}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                      {m.phone && <Badge variant="gray"><Phone className="h-3 w-3" /> {m.phone}</Badge>}
                      {m.email && <Badge variant="gray"><Mail className="h-3 w-3" /> {m.email}</Badge>}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      )}

      {/* VIEW MODE 2: ORGANIZATION CHART */}
      {viewMode === 'orgchart' && (
        <div className="card p-6 bg-gray-50/50 dark:bg-gray-900/30">
          <OrgChart members={members} title={`${selectedScope === 'district' ? 'জেলা কমিটি' : selectedUpazila} (${selectedSession})`} />
        </div>
      )}

      {/* VIEW MODE 3: COMMITTEE DIRECTORY */}
      {viewMode === 'directory' && (
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ডিরেক্টরি খুঁজুন..."
                  className="input pl-10"
                />
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    { key: 'all', label: 'সকল' },
                    { key: 'leadership', label: 'শীর্ষ নেতৃত্ব' },
                    { key: 'secretariat', label: 'সম্পাদক মণ্ডলী' },
                    { key: 'executive', label: 'কার্যনির্বাহী' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`chip text-xs transition ${
                      categoryFilter === cat.key ? 'bg-bd-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">ক্রমিক</th>
                    <th className="py-3 px-4">পদবি</th>
                    <th className="py-3 px-4">নাম</th>
                    <th className="py-3 px-4">বিভাগ ও সেশন</th>
                    <th className="py-3 px-4">ফোন</th>
                    <th className="py-3 px-4">ইমেইল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">কোনো তথ্য পাওয়া যায়নি</td>
                    </tr>
                  ) : (
                    filteredMembers.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                        <td className="py-3 px-4 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-bd-green-700 dark:text-bd-green-300">{m.position}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{m.name}</td>
                        <td className="py-3 px-4">{m.department} ({m.studentSession})</td>
                        <td className="py-3 px-4">{m.phone || '-'}</td>
                        <td className="py-3 px-4">{m.email || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
