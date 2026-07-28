import { supabase } from '@/lib/supabase';
import type {
  FirestoreUser,
  UserRole,
  UserStatus,
  CommitteeType,
  UpazilaName,
  AuditLog,
  AuditAction,
} from '@/types';

function mapRow(r: Record<string, unknown>): FirestoreUser {
  return {
    uid: r.id as string,
    name: r.name as string,
    email: r.email as string,
    role: r.role as UserRole,
    committeeType: (r.committee_type as CommitteeType) ?? null,
    upazila: (r.upazila as UpazilaName) ?? null,
    position: (r.position as string | null) ?? null,
    photoUrl: (r.photo_url as string | null) ?? null,
    status: r.status as UserStatus,
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
    securityKey: (r.security_key as string | undefined) ?? undefined,
    committeeCode: (r.committee_code as string | undefined) ?? undefined,
    approvedBy: (r.approved_by as string | null) ?? null,
  };
}

export async function getUserDoc(uid: string): Promise<FirestoreUser | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getUserDocSafe(uid: string) {
  const u = await getUserDoc(uid);
  if (!u) return null;
  const { securityKey, committeeCode, approvedBy, ...safe } = u;
  void securityKey; void committeeCode; void approvedBy;
  return safe;
}

export interface CreateSelfUserInput {
  uid: string;
  name: string;
  email: string;
  role: Extract<UserRole, 'student' | 'teacher' | 'alumni'>;
  upazila: UpazilaName;
}

export async function createSelfUser(input: CreateSelfUserInput): Promise<void> {
  const { error } = await supabase.from('profiles').insert({
    id: input.uid,
    name: input.name,
    email: input.email,
    role: input.role,
    committee_type: null,
    upazila: input.upazila,
    position: null,
    status: 'pending',
    approved_by: null,
  });
  if (error) throw error;
}

export interface CreateCommitteeUserInput {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  committeeType: CommitteeType;
  upazila: UpazilaName;
  position: string;
  securityKey: string;
  committeeCode: string;
  approvedBy: string;
}

export async function createCommitteeUser(input: CreateCommitteeUserInput): Promise<void> {
  const { error } = await supabase.from('profiles').insert({
    id: input.uid,
    name: input.name,
    email: input.email,
    role: input.role,
    committee_type: input.committeeType,
    upazila: input.upazila,
    position: input.position,
    status: 'active',
    security_key: input.securityKey,
    committee_code: input.committeeCode,
    approved_by: input.approvedBy,
  });
  if (error) throw error;
}

export interface UpdateProfileInput {
  name?: string;
  upazila?: UpazilaName;
  position?: string | null;
  photoUrl?: string | null;
}

export async function updateOwnProfile(uid: string, patch: UpdateProfileInput): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', uid);
  if (error) throw error;
}

export async function updateUserStatus(
  uid: string,
  status: UserStatus,
  actorId: string
): Promise<void> {
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'active') update.approved_by = actorId;
  const { error } = await supabase.from('profiles').update(update).eq('id', uid);
  if (error) throw error;
}

export async function softDeleteUser(uid: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'deleted', updated_at: new Date().toISOString() })
    .eq('id', uid);
  if (error) throw error;
}

export async function listUsersByRole(role: UserRole): Promise<FirestoreUser[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', role);
  if (error || !data) return [];
  return data.map((r) => mapRow(r as Record<string, unknown>));
}

export async function listPendingUsers(): Promise<FirestoreUser[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('status', 'pending');
  if (error || !data) return [];
  return data.map((r) => mapRow(r as Record<string, unknown>));
}

export async function listAllUsers(): Promise<FirestoreUser[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => mapRow(r as Record<string, unknown>));
}

export async function listUsersByUpazila(upazila: UpazilaName): Promise<FirestoreUser[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('upazila', upazila);
  if (error || !data) return [];
  return data.map((r) => mapRow(r as Record<string, unknown>));
}

// ===== Audit Logs =====

export async function writeAuditLog(entry: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    actor_role: entry.actorRole,
    action: entry.action,
    target_id: entry.targetId ?? null,
    target_email: entry.targetEmail ?? null,
    details: entry.details ?? null,
  });
  if (error) throw error;
}

export async function listAuditLogs(limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    actorId: r.actor_id as string,
    actorEmail: r.actor_email as string,
    actorRole: r.actor_role as UserRole,
    action: r.action as AuditAction,
    targetId: r.target_id ?? undefined,
    targetEmail: r.target_email ?? undefined,
    details: r.details ?? undefined,
    createdAt: new Date(r.created_at as string).getTime(),
  }));
}

export function describeAction(action: AuditAction): string {
  const map: Record<AuditAction, string> = {
    login: 'লগইন',
    logout: 'লগআউট',
    register: 'নিবন্ধন',
    profile_update: 'প্রোফাইল হালনাগাদ',
    status_change: 'স্ট্যাটাস পরিবর্তন',
    role_change: 'ভূমিকা পরিবর্তন',
    account_created: 'অ্যাকাউন্ট তৈরি',
    account_deleted: 'অ্যাকাউন্ট মুছে ফেলা হয়েছে',
    account_approved: 'অ্যাকাউন্ট অনুমোদিত',
    password_reset: 'পাসওয়ার্ড পুনঃনির্ধারণ',
    email_verified: 'ইমেইল যাচাই',
  };
  return map[action];
}
