import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Home, LogOut, User, Settings, FileText, Calendar, Image, Users, ShieldCheck, ScrollText, UserCog } from 'lucide-react';
import { classNames } from '@/utils/format';
import { canManageUsers, canViewAuditLogs, canCreateCommitteeAccounts, canManageDistrictContent, canManageUpazilaContent } from '@/utils/rbac';
import { ROLE_LABELS, type UserRole } from '@/types';
import toast from 'react-hot-toast';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

function buildNavLinks(role: UserRole | undefined): NavItem[] {
  const links: NavItem[] = [{ to: '/dashboard', label: 'ওভারভিউ', icon: LayoutDashboard, end: true }];

  // Content management — committee/admin
  if (canManageDistrictContent(role) || canManageUpazilaContent(role)) {
    links.push({ to: '/dashboard/notices', label: 'নোটিশ', icon: FileText });
    links.push({ to: '/dashboard/events', label: 'আয়োজন', icon: Calendar });
    links.push({ to: '/dashboard/gallery', label: 'গ্যালারি', icon: Image });
  }

  // User management — admins only
  if (canManageUsers(role)) {
    links.push({ to: '/dashboard/users', label: 'ব্যবহারকারী', icon: UserCog });
  }

  // Committee account creation — district admin only
  if (canCreateCommitteeAccounts(role)) {
    links.push({ to: '/dashboard/create-committee', label: 'কমিটি অ্যাকাউন্ট', icon: ShieldCheck });
  }

  // Audit logs — admins only
  if (canViewAuditLogs(role)) {
    links.push({ to: '/dashboard/audit', label: 'অডিট লগ', icon: ScrollText });
  }

  // Members directory — everyone
  links.push({ to: '/dashboard/members', label: 'সদস্য', icon: Users });

  links.push({ to: '/dashboard/profile', label: 'প্রোফাইল', icon: User });
  links.push({ to: '/dashboard/settings', label: 'সেটিংস', icon: Settings });

  return links;
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('সফলভাবে লগআউট হয়েছে');
      navigate('/');
    } catch {
      toast.error('লগআউটে সমস্যা হয়েছে');
    }
  };

  const navLinks = buildNavLinks(user?.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 h-fit">
            <div className="card p-4">
              <div className="flex items-center gap-3 px-2 pb-4 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-bd-green-600 text-white font-semibold">
                  {user?.displayName?.[0] ?? user?.email?.[0] ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.displayName ?? 'সদস্য'}
                  </p>
                  <p className="text-xs text-bd-green-700 dark:text-bd-green-300 truncate">
                    {user ? ROLE_LABELS[user.role] : ''}
                  </p>
                </div>
              </div>
              <nav className="space-y-1">
                {navLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      classNames(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                        isActive
                          ? 'bg-bd-green-600 text-white shadow-soft'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )
                    }
                  >
                    <l.icon className="h-4 w-4" />
                    {l.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Home className="h-4 w-4" /> ওয়েবসাইটে ফিরুন
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-bd-red-600 hover:bg-bd-red-50 dark:hover:bg-bd-red-900/30 transition">
                  <LogOut className="h-4 w-4" /> লগআউট
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
