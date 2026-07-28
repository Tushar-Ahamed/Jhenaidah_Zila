import { supabase } from '@/lib/supabase';
import type { MemberProfile, MemberStatus, UpazilaName } from '@/types';
import { MEMBERS } from '@/data/membersData';

const COL = 'members';

function mapRow(r: Record<string, unknown>): MemberProfile {
  return {
    id: r.id as string,
    uid: (r.uid as string | null) ?? undefined,
    name: r.name as string,
    photo: r.photo as string,
    department: r.department as string,
    session: r.session as string,
    hall: r.hall as string,
    upazila: r.upazila as UpazilaName,
    phone: r.phone as string,
    email: r.email as string,
    bloodGroup: (r.blood_group as MemberProfile['bloodGroup']) ?? null,
    facebook: (r.facebook as string | null) ?? undefined,
    linkedin: (r.linkedin as string | null) ?? undefined,
    bio: r.bio as string,
    status: r.status as MemberStatus,
    createdAt: new Date(r.created_at as string).getTime(),
    updatedAt: new Date(r.updated_at as string).getTime(),
  };
}

export async function getMember(id: string): Promise<MemberProfile | null> {
  try {
    const { data, error } = await supabase.from(COL).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return MEMBERS.find((m) => m.id === id) ?? null;
    return mapRow(data);
  } catch {
    return MEMBERS.find((m) => m.id === id) ?? null;
  }
}

export async function listMembers(status?: MemberStatus): Promise<MemberProfile[]> {
  try {
    let q = supabase.from(COL).select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) {
      return status ? MEMBERS.filter((m) => m.status === status) : MEMBERS;
    }
    return data.map((r) => mapRow(r as Record<string, unknown>));
  } catch {
    return status ? MEMBERS.filter((m) => m.status === status) : MEMBERS;
  }
}

export async function listApprovedMembers(): Promise<MemberProfile[]> {
  return listMembers('approved');
}

export async function listPendingMembers(): Promise<MemberProfile[]> {
  return listMembers('pending');
}

export async function listRejectedMembers(): Promise<MemberProfile[]> {
  return listMembers('rejected');
}

export interface PagedResult {
  items: MemberProfile[];
  hasMore: boolean;
}

export async function listMembersPaged(
  pageSize: number,
  _cursor: unknown
): Promise<PagedResult> {
  try {
    const { data, error } = await supabase
      .from(COL)
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(pageSize);
    if (error) throw error;
    const items = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
    return { items, hasMore: items.length === pageSize };
  } catch {
    return { items: MEMBERS.filter((m) => m.status === 'approved').slice(0, pageSize), hasMore: false };
  }
}

export interface CreateMemberInput {
  id: string;
  name: string;
  photo: string;
  department: string;
  session: string;
  hall: string;
  upazila: UpazilaName;
  phone: string;
  email: string;
  bloodGroup: MemberProfile['bloodGroup'];
  facebook?: string;
  linkedin?: string;
  bio: string;
}

export async function createMember(input: CreateMemberInput): Promise<void> {
  const { error } = await supabase.from(COL).insert({
    id: input.id,
    name: input.name,
    photo: input.photo,
    department: input.department,
    session: input.session,
    hall: input.hall,
    upazila: input.upazila,
    phone: input.phone,
    email: input.email,
    blood_group: input.bloodGroup,
    facebook: input.facebook ?? null,
    linkedin: input.linkedin ?? null,
    bio: input.bio,
    status: 'pending',
  });
  if (error) throw error;
}

export interface UpdateMemberInput {
  name?: string;
  photo?: string;
  department?: string;
  session?: string;
  hall?: string;
  upazila?: UpazilaName;
  phone?: string;
  email?: string;
  bloodGroup?: MemberProfile['bloodGroup'];
  facebook?: string;
  linkedin?: string;
  bio?: string;
}

export async function updateMember(id: string, patch: UpdateMemberInput): Promise<void> {
  const { error } = await supabase
    .from(COL)
    .update({
      ...(patch.name && { name: patch.name }),
      ...(patch.photo && { photo: patch.photo }),
      ...(patch.department && { department: patch.department }),
      ...(patch.session && { session: patch.session }),
      ...(patch.hall && { hall: patch.hall }),
      ...(patch.upazila && { upazila: patch.upazila }),
      ...(patch.phone && { phone: patch.phone }),
      ...(patch.email && { email: patch.email }),
      ...(patch.bloodGroup !== undefined && { blood_group: patch.bloodGroup }),
      ...(patch.facebook !== undefined && { facebook: patch.facebook }),
      ...(patch.linkedin !== undefined && { linkedin: patch.linkedin }),
      ...(patch.bio !== undefined && { bio: patch.bio }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function setMemberStatus(id: string, status: MemberStatus): Promise<void> {
  const { error } = await supabase
    .from(COL)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function approveMember(id: string): Promise<void> {
  await setMemberStatus(id, 'approved');
}

export async function rejectMember(id: string): Promise<void> {
  await setMemberStatus(id, 'rejected');
}

export interface MemberFilters {
  query?: string;
  department?: string;
  session?: string;
  upazila?: UpazilaName | 'all';
  bloodGroup?: MemberProfile['bloodGroup'] | 'all';
}

export function filterMembers(members: MemberProfile[], f: MemberFilters): MemberProfile[] {
  const q = (f.query ?? '').trim().toLowerCase();
  return members.filter((m) => {
    if (m.status !== 'approved') return false;
    if (q && !(`${m.name} ${m.email} ${m.department} ${m.upazila ?? ''}`.toLowerCase().includes(q))) return false;
    if (f.department && f.department !== 'all' && m.department !== f.department) return false;
    if (f.session && f.session !== 'all' && m.session !== f.session) return false;
    if (f.upazila && f.upazila !== 'all' && m.upazila !== f.upazila) return false;
    if (f.bloodGroup && f.bloodGroup !== 'all' && m.bloodGroup !== f.bloodGroup) return false;
    return true;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
