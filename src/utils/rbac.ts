import type { UserRole } from '@/types';
import { ADMIN_ROLES, COMMITTEE_ROLES, SELF_REGISTER_ROLES } from '@/types';

// Permission helpers. These drive UI gating only — Firestore security rules
// are the real enforcement layer (see firestore.rules).

export function isAdmin(role: UserRole | undefined): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function isDistrictAdmin(role: UserRole | undefined): boolean {
  return role === 'district_admin';
}

export function isUpazilaAdmin(role: UserRole | undefined): boolean {
  return role === 'upazila_admin';
}

export function isCommittee(role: UserRole | undefined): boolean {
  return !!role && COMMITTEE_ROLES.includes(role);
}

export function isSelfRegisterRole(role: UserRole | undefined): boolean {
  return !!role && SELF_REGISTER_ROLES.includes(role);
}

// Can manage (CRUD) district-wide content: notices, events, gallery.
export function canManageDistrictContent(role: UserRole | undefined): boolean {
  return role === 'district_admin' || role === 'district_committee';
}

// Can manage content scoped to their upazila only.
export function canManageUpazilaContent(role: UserRole | undefined): boolean {
  return role === 'upazila_admin' || role === 'upazila_committee';
}

// Can edit only their own profile.
export function canEditOwnProfile(role: UserRole | undefined): boolean {
  return !!role && SELF_REGISTER_ROLES.includes(role);
}

// Can create committee accounts (district admin only).
export function canCreateCommitteeAccounts(role: UserRole | undefined): boolean {
  return role === 'district_admin';
}

// Can manage users (approve, suspend, delete).
export function canManageUsers(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// Full access.
export function hasFullAccess(role: UserRole | undefined): boolean {
  return role === 'district_admin';
}

export function canViewAuditLogs(role: UserRole | undefined): boolean {
  return isAdmin(role);
}
