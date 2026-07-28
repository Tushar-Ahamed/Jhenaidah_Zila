import { FadeIn } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/types';
import { STATS, NOTICES, EVENTS, ACTIVITIES, UPAZILAS } from '@/data/sampleData';
import { toBnNumber, formatBnDate, isUpcoming } from '@/utils/format';
import {
  Users, FileText, CalendarDays, Activity, TrendingUp, ArrowUpRight, Pin,
  GraduationCap, BookOpen, Award, MapPin, ShieldCheck, UserCog, ScrollText,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { canManageUsers, canCreateCommitteeAccounts, canViewAuditLogs, canManageUpazilaContent, canManageDistrictContent } from '@/utils/rbac';

const growthData = [
  { month: 'জানু', members: 12 },
  { month: 'ফেব্রু', members: 18 },
  { month: 'মার্চ', members: 25 },
  { month: 'এপ্রিল', members: 32 },
  { month: 'মে', members: 40 },
  { month: 'জুন', members: 52 },
  { month: 'জুলাই', members: 68 },
];

const upazilaData = [
  { name: 'সদর', value: 120 },
  { name: 'কালীগঞ্জ', value: 68 },
  { name: 'কোটচাঁদপুর', value: 54 },
  { name: 'মহেশপুর', value: 42 },
  { name: 'শৈলকূপা', value: 38 },
  { name: 'হরিণাকুণ্ডু', value: 20 },
];

const activityData = [
  { name: 'অনুষ্ঠান', value: 18 },
  { name: 'সমাজসেবা', value: 12 },
  { name: 'শিক্ষা', value: 9 },
  { name: 'ক্রীড়া', value: 6 },
];

const PIE_COLORS = ['#059669', '#dc2626', '#f97316', '#0ea5e9', '#8b5cf6', '#facc15'];

const roleIcon: Record<string, typeof GraduationCap> = {
  student: GraduationCap,
  teacher: BookOpen,
  alumni: Award,
  upazila_committee: MapPin,
  district_committee: ShieldCheck,
  upazila_admin: UserCog,
  district_admin: ShieldCheck,
};

const roleGreeting: Record<string, string> = {
  student: 'শিক্ষার্থী ড্যাশবোর্ডে স্বাগতম',
  teacher: 'শিক্ষক ড্যাশবোর্ডে স্বাগতম',
  alumni: 'প্রাক্তন ছাত্র ড্যাশবোর্ডে স্বাগতম',
  upazila_committee: 'উপজেলা কমিটি ড্যাশবোর্ডে স্বাগতম',
  district_committee: 'জেলা কমিটি ড্যাশবোর্ডে স্বাগতম',
  upazila_admin: 'উপজেলা প্রশাসক ড্যাশবোর্ডে স্বাগতম',
  district_admin: 'জেলা প্রশাসক ড্যাশবোর্ডে স্বাগতম',
};

export function DashboardHome() {
  const { user } = useAuth();
  const role = user?.role;
  const RoleIcon = role ? roleIcon[role] : Users;
  const upcomingEvents = EVENTS.filter((e) => isUpcoming(e.date)).slice(0, 3);
  const recentNotices = [...NOTICES].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).slice(0, 4);

  const statCards = [
    { label: 'মোট সদস্য', value: STATS[0].value, suffix: '+', icon: Users, color: 'bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300' },
    { label: 'নোটিশ', value: NOTICES.length, suffix: '', icon: FileText, color: 'bg-bd-red-50 text-bd-red-600 dark:bg-bd-red-900/30 dark:text-bd-red-300' },
    { label: 'আয়োজন', value: EVENTS.length, suffix: '', icon: CalendarDays, color: 'bg-accent-50 text-accent-600' },
    { label: 'কার্যক্রম', value: ACTIVITIES.length, suffix: '', icon: Activity, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
  ];

  const isContentManager = canManageDistrictContent(role) || canManageUpazilaContent(role);
  const canManage = canManageUsers(role);
  const canCreateCommittee = canCreateCommitteeAccounts(role);
  const canSeeAudit = canViewAuditLogs(role);

  return (
    <div className="space-y-6">
      {/* Role-aware greeting */}
      <FadeIn>
        <div className="rounded-3xl bg-bd-gradient p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-bd-radial opacity-40" />
          <div className="relative flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur border border-white/20">
              <RoleIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{role ? roleGreeting[role] : 'ড্যাশবোর্ড'}</h1>
              <p className="mt-1 text-sm text-white/80">
                {user?.displayName ?? 'সদস্য'} · {role ? ROLE_LABELS[role] : ''} {user?.upazila ? `· ${user.upazila}` : ''}
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Admin quick actions */}
      {(canManage || canCreateCommittee || canSeeAudit) && (
        <FadeIn delay={0.05}>
          <div className="grid gap-3 sm:grid-cols-3">
            {canManage && (
              <Link to="/dashboard/users" className="card p-4 flex items-center gap-3 hover:shadow-glass transition group">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300"><UserCog className="h-5 w-5" /></div>
                <div className="flex-1"><p className="text-sm font-semibold text-gray-900 dark:text-white">ব্যবহারকারী ব্যবস্থাপনা</p><p className="text-xs text-gray-400">অনুমোদন, স্থগিত, মুছুন</p></div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-bd-green-600" />
              </Link>
            )}
            {canCreateCommittee && (
              <Link to="/dashboard/create-committee" className="card p-4 flex items-center gap-3 hover:shadow-glass transition group">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-bd-red-50 text-bd-red-600 dark:bg-bd-red-900/30 dark:text-bd-red-300"><ShieldCheck className="h-5 w-5" /></div>
                <div className="flex-1"><p className="text-sm font-semibold text-gray-900 dark:text-white">কমিটি অ্যাকাউন্ট</p><p className="text-xs text-gray-400">নতুন কমিটি তৈরি করুন</p></div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-bd-red-600" />
              </Link>
            )}
            {canSeeAudit && (
              <Link to="/dashboard/audit" className="card p-4 flex items-center gap-3 hover:shadow-glass transition group">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"><ScrollText className="h-5 w-5" /></div>
                <div className="flex-1"><p className="text-sm font-semibold text-gray-900 dark:text-white">অডিট লগ</p><p className="text-xs text-gray-400">কার্যক্রমের ইতিহাস</p></div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </Link>
            )}
          </div>
        </FadeIn>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.05}>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-bd-green-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{toBnNumber(s.value)}{s.suffix}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">সদস্য বৃদ্ধি</h3>
                <p className="text-xs text-gray-400">গত ৭ মাস</p>
              </div>
              <Badge variant="green"><TrendingUp className="h-3 w-3" /> +২৪%</Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={growthData} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Hind Siliguri' }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ fontFamily: 'Hind Siliguri', borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                <Area type="monotone" dataKey="members" stroke="#059669" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="card p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">উপজেলাভিত্তিক সদস্য</h3>
              <p className="text-xs text-gray-400">শাখা অনুযায়ী</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={upazilaData} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Hind Siliguri' }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ fontFamily: 'Hind Siliguri', borderRadius: 12, border: 'none' }} />
                <Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">কার্যক্রম বিতরণ</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={activityData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {activityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontFamily: 'Hind Siliguri', fontSize: 12 }} />
                <Tooltip contentStyle={{ fontFamily: 'Hind Siliguri', borderRadius: 12, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">সাম্প্রতিক নোটিশ</h3>
              {isContentManager && <Link to="/dashboard/notices" className="text-xs font-semibold text-bd-green-700 dark:text-bd-green-300 hover:underline">সব দেখুন</Link>}
            </div>
            <div className="space-y-3">
              {recentNotices.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300 shrink-0">
                    {n.pinned ? <Pin className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatBnDate(n.date)}</p>
                  </div>
                  <Badge variant="green">{n.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Upcoming events */}
      <FadeIn>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">আসন্ন আয়োজন</h3>
            {isContentManager && <Link to="/dashboard/events" className="text-xs font-semibold text-bd-green-700 dark:text-bd-green-300 hover:underline">সব দেখুন</Link>}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <img src={e.coverImage} alt={e.title} className="h-24 w-full object-cover" loading="lazy" />
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatBnDate(e.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Upazila list for committee/admin */}
      {(isContentManager || canManage) && (
        <FadeIn>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">উপজেলা শাখা</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {UPAZILAS.map((u) => (
                <div key={u.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{toBnNumber(u.memberCount)} জন সদস্য</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
