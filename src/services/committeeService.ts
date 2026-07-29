import { supabase } from '@/lib/supabase';
import type { CommitteeMemberRecord, UpazilaName } from '@/types';
import { COMMITTEE_POSITIONS } from '@/types';

const STORAGE_KEY = 'jhenaidah_committee_records_v1';

// Seed demo committee data for history viewing
const INITIAL_DEMO_RECORDS: CommitteeMemberRecord[] = [
  // 2026-27 District Committee
  { id: 'cm-2026-1', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'মোঃ রফিকুল ইসলাম', position: 'সভাপতি', positionOrder: 1, department: 'ইতিহাস', studentSession: '২০২০-২১', phone: '০১৭১১-১২৩৪৫৬', email: 'rafiqul@ru.ac.bd', createdAt: Date.now() - 800000 },
  { id: 'cm-2026-2', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'তানিয়া সুলতানা', position: 'সিনিয়র সহ-সভাপতি', positionOrder: 2, department: 'সমাজবিজ্ঞান', studentSession: '২০২০-২১', phone: '০১৮১২-৩৪৫৬৭৮', email: 'tania@ru.ac.bd', createdAt: Date.now() - 750000 },
  { id: 'cm-2026-3', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'মোঃ আশরাফুল আলম', position: 'সহ-সভাপতি', positionOrder: 3, department: 'পদার্থবিজ্ঞান', studentSession: '২০১৯-২০', phone: '০১৯১১-২২৩৩৪৪', email: 'ashraful@ru.ac.bd', createdAt: Date.now() - 700000 },
  { id: 'cm-2026-4', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'আব্দুল্লাহ আল মামুন', position: 'সাধারণ সম্পাদক', positionOrder: 4, department: 'রাষ্ট্রবিজ্ঞান', studentSession: '২০২০-২১', phone: '০১৫১১-৯৮৭৬৫৪', email: 'mamun@ru.ac.bd', createdAt: Date.now() - 650000 },
  { id: 'cm-2026-5', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'ইমরান হোসেন', position: 'যুগ্ম সাধারণ সম্পাদক', positionOrder: 5, department: 'ফিন্যান্স', studentSession: '২০২১-২২', phone: '০১৭২২-৩৩৪৪৫৫', email: 'imran@ru.ac.bd', createdAt: Date.now() - 600000 },
  { id: 'cm-2026-6', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'ফারজানা ইয়াসমিন', position: 'সাংগঠনিক সম্পাদক', positionOrder: 6, department: 'দর্শন', studentSession: '২০২০-২১', phone: '০১৮৩৩-৪৪৫৫৬৬', email: 'farzana@ru.ac.bd', createdAt: Date.now() - 550000 },
  { id: 'cm-2026-7', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'নুসরাত জাহান', position: 'অর্থ সম্পাদক', positionOrder: 8, department: 'গণিত', studentSession: '২০২০-২১', phone: '০১৬৪৪-৫৫৬৬৭৭', email: 'nusrat@ru.ac.bd', createdAt: Date.now() - 500000 },
  { id: 'cm-2026-8', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'সাব্বির আহমেদ', position: 'প্রচার সম্পাদক', positionOrder: 11, department: 'ইংরেজি', studentSession: '২০২১-২২', phone: '০১৫৫৫-৬৬৭৭৮৮', email: 'sabbir@ru.ac.bd', createdAt: Date.now() - 450000 },
  { id: 'cm-2026-9', session: '২০২৬-২৭', scope: 'district', upazila: null, name: 'সুমাইয়া আক্তার', position: 'কার্যনির্বাহী সদস্য', positionOrder: 12, department: 'বাংলা', studentSession: '২০১৯-২০', phone: '০১৬৬৬-৭৭৮৮৯৯', email: 'sumaiya@ru.ac.bd', createdAt: Date.now() - 400000 },

  // 2025-26 Previous District Committee
  { id: 'cm-2025-1', session: '২০২৫-২৬', scope: 'district', upazila: null, name: 'সুমাইয়া আক্তার', position: 'সভাপতি', positionOrder: 1, department: 'বাংলা', studentSession: '২০১৯-২০', phone: '০১৬৬৬-৭৭৮৮৯৯', email: 'sumaiya@ru.ac.bd', createdAt: Date.now() - 30000000 },
  { id: 'cm-2025-2', session: '২০২৫-২৬', scope: 'district', upazila: null, name: 'মোঃ রফিকুল ইসলাম', position: 'সাধারণ সম্পাদক', positionOrder: 4, department: 'ইতিহাস', studentSession: '২০২০-২১', phone: '০১৭১১-১২৩৪৫৬', email: 'rafiqul@ru.ac.bd', createdAt: Date.now() - 30000000 },
  { id: 'cm-2025-3', session: '২০২৫-২৬', scope: 'district', upazila: null, name: 'নুসরাত জাহান', position: 'অর্থ সম্পাদক', positionOrder: 8, department: 'গণিত', studentSession: '২০২০-২১', phone: '০১৬৪৪-৫৫৬৬৭৭', email: 'nusrat@ru.ac.bd', createdAt: Date.now() - 30000000 },

  // 2026-27 Upazila Committees
  { id: 'cm-up-1', session: '২০২৬-২৭', scope: 'upazila', upazila: 'ঝিনাইদহ সদর', name: 'মোঃ রফিকুল ইসলাম', position: 'সভাপতি', positionOrder: 1, department: 'ইতিহাস', studentSession: '২০২০-২১', phone: '০১৭১১-১২৩৪৫৬', email: 'rafiqul@ru.ac.bd', createdAt: Date.now() - 100000 },
  { id: 'cm-up-2', session: '২০২৬-২৭', scope: 'upazila', upazila: 'ঝিনাইদহ সদর', name: 'আব্দুল্লাহ আল মামুন', position: 'সাধারণ সম্পাদক', positionOrder: 4, department: 'রাষ্ট্রবিজ্ঞান', studentSession: '২০২০-২১', phone: '০১৫১১-৯৮৭৬৫৪', email: 'mamun@ru.ac.bd', createdAt: Date.now() - 100000 },
  { id: 'cm-up-3', session: '২০২৬-২৭', scope: 'upazila', upazila: 'কালীগঞ্জ', name: 'সাব্বির আহমেদ', position: 'সভাপতি', positionOrder: 1, department: 'ইংরেজি', studentSession: '২০২১-২২', phone: '০১৫৫৫-৬৬৭৭৮৮', email: 'sabbir@ru.ac.bd', createdAt: Date.now() - 100000 },
  { id: 'cm-up-4', session: '২০২৬-২৭', scope: 'upazila', upazila: 'কালীগঞ্জ', name: 'তানিয়া সুলতানা', position: 'সাধারণ সম্পাদক', positionOrder: 4, department: 'সমাজবিজ্ঞান', studentSession: '২০২০-২১', phone: '০১৮১২-৩৪৫৬৭৮', email: 'tania@ru.ac.bd', createdAt: Date.now() - 100000 },
];

function getLocalRecords(): CommitteeMemberRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_RECORDS));
      return INITIAL_DEMO_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_RECORDS;
  }
}

function saveLocalRecords(records: CommitteeMemberRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function getPositionOrder(positionName: string): number {
  const matched = COMMITTEE_POSITIONS.find(
    (p) => p.bnLabel === positionName || p.key === positionName
  );
  return matched ? matched.order : 99;
}

export async function listCommitteeMembers(
  session: string,
  scope: 'district' | 'upazila',
  upazila?: UpazilaName
): Promise<CommitteeMemberRecord[]> {
  try {
    let query = supabase
      .from('committee_members')
      .select('*')
      .eq('session', session)
      .eq('scope', scope);

    if (scope === 'upazila' && upazila) {
      query = query.eq('upazila', upazila);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const records: CommitteeMemberRecord[] = data.map((r) => ({
        id: r.id,
        session: r.session,
        scope: r.scope as 'district' | 'upazila',
        upazila: r.upazila as UpazilaName,
        userId: r.user_id ?? undefined,
        memberId: r.member_id ?? undefined,
        name: r.name,
        photoUrl: r.photo_url ?? undefined,
        position: r.position,
        positionOrder: r.position_order ?? getPositionOrder(r.position),
        department: r.department ?? '',
        studentSession: r.student_session ?? '',
        phone: r.phone ?? undefined,
        email: r.email ?? undefined,
        assignedBy: r.assigned_by ?? undefined,
        createdAt: new Date(r.created_at).getTime(),
      }));
      return records.sort((a, b) => a.positionOrder - b.positionOrder);
    }
  } catch {
    // fallback to localStorage
  }

  const local = getLocalRecords();
  return local
    .filter(
      (r) =>
        r.session === session &&
        r.scope === scope &&
        (scope === 'district' || !upazila || r.upazila === upazila)
    )
    .sort((a, b) => a.positionOrder - b.positionOrder);
}

export interface AssignCommitteeInput {
  session: string;
  scope: 'district' | 'upazila';
  upazila?: UpazilaName;
  userId?: string;
  memberId?: string;
  name: string;
  photoUrl?: string;
  position: string;
  department: string;
  studentSession: string;
  phone?: string;
  email?: string;
  assignedBy?: string;
}

export async function assignCommitteeMember(
  input: AssignCommitteeInput
): Promise<CommitteeMemberRecord> {
  const positionOrder = getPositionOrder(input.position);

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('committee_members')
      .insert({
        session: input.session,
        scope: input.scope,
        upazila: input.scope === 'upazila' ? input.upazila : null,
        user_id: input.userId ?? null,
        member_id: input.memberId ?? null,
        name: input.name,
        photo_url: input.photoUrl ?? null,
        position: input.position,
        position_order: positionOrder,
        department: input.department,
        student_session: input.studentSession,
        phone: input.phone ?? '',
        email: input.email ?? '',
        assigned_by: input.assignedBy ?? null,
      })
      .select('*')
      .single();

    if (!error && data) {
      const record: CommitteeMemberRecord = {
        id: data.id,
        session: data.session,
        scope: data.scope,
        upazila: data.upazila,
        userId: data.user_id,
        memberId: data.member_id,
        name: data.name,
        photoUrl: data.photo_url,
        position: data.position,
        positionOrder: data.position_order,
        department: data.department,
        studentSession: data.student_session,
        phone: data.phone,
        email: data.email,
        assignedBy: data.assigned_by,
        createdAt: new Date(data.created_at).getTime(),
      };
      // Keep local sync
      const local = getLocalRecords();
      saveLocalRecords([record, ...local]);
      return record;
    }
  } catch {
    // fallback
  }

  // Local fallback
  const newRecord: CommitteeMemberRecord = {
    id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    session: input.session,
    scope: input.scope,
    upazila: input.scope === 'upazila' ? (input.upazila ?? null) : null,
    userId: input.userId,
    memberId: input.memberId,
    name: input.name,
    photoUrl: input.photoUrl,
    position: input.position,
    positionOrder,
    department: input.department,
    studentSession: input.studentSession,
    phone: input.phone,
    email: input.email,
    assignedBy: input.assignedBy,
    createdAt: Date.now(),
  };

  const local = getLocalRecords();
  saveLocalRecords([newRecord, ...local]);

  // Sync profile if userId/email is available
  if (input.email) {
    try {
      supabase.from('profiles').update({
        position: input.position,
        ...(input.scope === 'upazila' && input.upazila && { upazila: input.upazila }),
      }).eq('email', input.email);
    } catch {
      // ignore
    }
  }

  return newRecord;
}

export async function removeCommitteeMember(id: string): Promise<void> {
  try {
    await supabase.from('committee_members').delete().eq('id', id);
  } catch {
    // ignore
  }
  const local = getLocalRecords().filter((r) => r.id !== id);
  saveLocalRecords(local);
}

export const assignCommitteePosition = assignCommitteeMember;
