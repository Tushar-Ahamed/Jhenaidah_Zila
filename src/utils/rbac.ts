import type { FirestoreUser, UpazilaName, UserRole } from '@/types';
import { ADMIN_ROLES, COMMITTEE_ROLES, SELF_REGISTER_ROLES, normalizeUserRole } from '@/types';

// Permission helpers. These drive UI gating only — Firestore security rules
// are the real enforcement layer (see firestore.rules).

export function isAdmin(role: UserRole | undefined): boolean {
  const normalizedRole = normalizeUserRole(role);
  return ADMIN_ROLES.includes(normalizedRole);
}

export function isDistrictAdmin(role: UserRole | undefined): boolean {
  return normalizeUserRole(role) === 'district_admin';
}

export function isUpazilaAdmin(role: UserRole | undefined): boolean {
  return normalizeUserRole(role) === 'upazila_admin';
}

export function isCommittee(role: UserRole | undefined): boolean {
  const normalizedRole = normalizeUserRole(role);
  return COMMITTEE_ROLES.includes(normalizedRole);
}

export function isSelfRegisterRole(role: UserRole | undefined): boolean {
  const normalizedRole = normalizeUserRole(role);
  return SELF_REGISTER_ROLES.includes(normalizedRole);
}

// Can manage (CRUD) district-wide content: notices, events, gallery.
export function canManageDistrictContent(role: UserRole | undefined): boolean {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === 'district_admin' || normalizedRole === 'district_committee';
}

// Can manage content scoped to their upazila only.
export function canManageUpazilaContent(role: UserRole | undefined): boolean {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === 'upazila_admin' || normalizedRole === 'upazila_committee';
}

// Can edit only their own profile.
export function canEditOwnProfile(role: UserRole | undefined): boolean {
  const normalizedRole = normalizeUserRole(role);
  return SELF_REGISTER_ROLES.includes(normalizedRole);
}

// Can create committee accounts (district admin and upazila admin).
export function canCreateCommitteeAccounts(role: UserRole | undefined): boolean {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === 'district_admin' || normalizedRole === 'upazila_admin';
}

export function countUsersByRole(users: FirestoreUser[], role: UserRole, upazila?: UpazilaName): number {
  return users.filter((u) => u.role === role && (!upazila || u.upazila === upazila)).length;
}

export function getCommitteeCreateError(
  actorRole: UserRole | undefined,
  targetRole: UserRole,
  targetUpazila: UpazilaName,
  users: FirestoreUser[],
  actorUpazila?: UpazilaName
): string | null {
  if (actorRole === 'district_admin') {
    if (targetRole === 'district_admin' && countUsersByRole(users, 'district_admin') >= 5) {
      return 'জেলা প্রশাসক সীমা পূর্ণ হয়েছে।';
    }
    if (targetRole === 'upazila_admin' && targetUpazila && countUsersByRole(users, 'upazila_admin', targetUpazila) >= 3) {
      return `${targetUpazila} উপজেলায় ইতিমধ্যে ৩ জন উপজেলা প্রশাসক নিযুক্ত করা হয়েছে।`;
    }
    return null;
  }

  if (actorRole === 'upazila_admin') {
    if (targetRole !== 'upazila_committee') {
      return 'আপনি শুধু উপজেলা কমিটি সদস্য তৈরি করতে পারবেন।';
    }
    if (!actorUpazila || targetUpazila !== actorUpazila) {
      return 'আপনি কেবল আপনার উপজেলা’র সদস্য তৈরি করতে পারবেন।';
    }
    return null;
  }

  return 'আপনার এই পৃষ্ঠায় অ্যাক্সেস নেই।';
}

// Can manage users (approve, suspend, delete).
export function canManageUsers(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// Full access.
export function hasFullAccess(role: UserRole | undefined): boolean {
  return normalizeUserRole(role) === 'district_admin';
}

export function canViewAuditLogs(role: UserRole | undefined): boolean {
  return isAdmin(role);
}
