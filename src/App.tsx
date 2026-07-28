import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLoader } from '@/components/ui/PageLoader';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const CommitteePage = lazy(() => import('@/pages/CommitteePage').then((m) => ({ default: m.CommitteePage })));
const UpazilasPage = lazy(() => import('@/pages/UpazilasPage').then((m) => ({ default: m.UpazilasPage })));
const UpazilaDetailPage = lazy(() => import('@/pages/UpazilaDetailPage').then((m) => ({ default: m.UpazilaDetailPage })));
const GalleryPage = lazy(() => import('@/pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const EventsPage = lazy(() => import('@/pages/EventsPage').then((m) => ({ default: m.EventsPage })));
const NoticesPage = lazy(() => import('@/pages/NoticesPage').then((m) => ({ default: m.NoticesPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const MembersPage = lazy(() => import('@/pages/MembersPage').then((m) => ({ default: m.MembersPage })));
const MemberProfilePage = lazy(() => import('@/pages/MemberProfilePage').then((m) => ({ default: m.MemberProfilePage })));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const PendingApprovalPage = lazy(() => import('@/pages/auth/PendingApprovalPage').then((m) => ({ default: m.PendingApprovalPage })));
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })));
const AdminSetupPage = lazy(() => import('@/pages/auth/AdminSetupPage').then((m) => ({ default: m.AdminSetupPage })));

const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome').then((m) => ({ default: m.DashboardHome })));
const DashboardNotices = lazy(() => import('@/pages/dashboard/DashboardNotices').then((m) => ({ default: m.DashboardNotices })));
const DashboardEvents = lazy(() => import('@/pages/dashboard/DashboardEvents').then((m) => ({ default: m.DashboardEvents })));
const DashboardGallery = lazy(() => import('@/pages/dashboard/DashboardGallery').then((m) => ({ default: m.DashboardGallery })));
const DashboardProfile = lazy(() => import('@/pages/dashboard/DashboardProfile').then((m) => ({ default: m.DashboardProfile })));
const DashboardSettings = lazy(() => import('@/pages/dashboard/DashboardSettings').then((m) => ({ default: m.DashboardSettings })));
const DashboardUsers = lazy(() => import('@/pages/dashboard/DashboardUsers').then((m) => ({ default: m.DashboardUsers })));
const DashboardCreateCommittee = lazy(() => import('@/pages/dashboard/DashboardCreateCommittee').then((m) => ({ default: m.DashboardCreateCommittee })));
const DashboardAudit = lazy(() => import('@/pages/dashboard/DashboardAudit').then((m) => ({ default: m.DashboardAudit })));
const DashboardMembers = lazy(() => import('@/pages/dashboard/DashboardMembers').then((m) => ({ default: m.DashboardMembers })));
const DashboardMemberEdit = lazy(() => import('@/pages/dashboard/DashboardMemberEdit').then((m) => ({ default: m.DashboardMemberEdit })));

const COMMITTEE_ROLES = ['upazila_committee', 'district_committee', 'upazila_admin', 'district_admin'] as const;
const ADMIN_ROLES = ['upazila_admin', 'district_admin'] as const;

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/committee" element={<CommitteePage />} />
            <Route path="/upazilas" element={<UpazilasPage />} />
            <Route path="/upazilas/:id" element={<UpazilaDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/members/:id" element={<MemberProfilePage />} />
          </Route>

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/admin-setup" element={<AdminSetupPage />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="notices" element={<ProtectedRoute roles={[...COMMITTEE_ROLES]}><DashboardNotices /></ProtectedRoute>} />
            <Route path="events" element={<ProtectedRoute roles={[...COMMITTEE_ROLES]}><DashboardEvents /></ProtectedRoute>} />
            <Route path="gallery" element={<ProtectedRoute roles={[...COMMITTEE_ROLES]}><DashboardGallery /></ProtectedRoute>} />
            <Route path="members" element={<DashboardMembers />} />
            <Route path="members/:id/edit" element={<ProtectedRoute roles={[...ADMIN_ROLES]}><DashboardMemberEdit /></ProtectedRoute>} />
            <Route path="profile" element={<DashboardProfile />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="users" element={<ProtectedRoute roles={[...ADMIN_ROLES]}><DashboardUsers /></ProtectedRoute>} />
            <Route path="create-committee" element={<ProtectedRoute roles={['district_admin']}><DashboardCreateCommittee /></ProtectedRoute>} />
            <Route path="audit" element={<ProtectedRoute roles={[...ADMIN_ROLES]}><DashboardAudit /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
