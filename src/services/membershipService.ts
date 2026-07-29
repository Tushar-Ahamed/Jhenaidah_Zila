import { supabase } from '@/lib/supabase';
import type { MembershipPayment, EventRegistrationRecord, MembershipPaymentStatus, UpazilaName } from '@/types';

const PAYMENTS_KEY = 'jhenaidah_membership_payments_v1';
const REGISTRATIONS_KEY = 'jhenaidah_event_registrations_v1';

const INITIAL_DEMO_PAYMENTS: MembershipPayment[] = [
  {
    id: 'pay-101',
    memberName: 'মোঃ রফিকুল ইসলাম',
    email: 'rafiqul@ru.ac.bd',
    phone: '০১৭১১-১২৩৪৫৬',
    upazila: 'ঝিনাইদহ সদর',
    department: 'ইতিহাস',
    session: '২০২০-২১',
    amount: 500,
    paymentMethod: 'bKash',
    trxId: 'BK9X77A12',
    status: 'paid',
    paidDate: '2026-01-15',
    expiryDate: '2027-01-15',
    createdAt: Date.now() - 100000000,
  },
  {
    id: 'pay-102',
    memberName: 'সুমাইয়া আক্তার',
    email: 'sumaiya@ru.ac.bd',
    phone: '০১৬৬৬-৭৭৮৮৯৯',
    upazila: 'কালীগঞ্জ',
    department: 'বাংলা',
    session: '২০১৯-২০',
    amount: 500,
    paymentMethod: 'Nagad',
    trxId: 'NG8821B09',
    status: 'paid',
    paidDate: '2026-02-10',
    expiryDate: '2027-02-10',
    createdAt: Date.now() - 80000000,
  },
  {
    id: 'pay-103',
    memberName: 'আব্দুল্লাহ আল মামুন',
    email: 'mamun@ru.ac.bd',
    phone: '০১৫১১-৯৮৭৬৫৪',
    upazila: 'ঝিনাইদহ সদর',
    department: 'রাষ্ট্রবিজ্ঞান',
    session: '২০২০-২১',
    amount: 500,
    paymentMethod: 'bKash',
    trxId: 'BK110293X',
    status: 'pending',
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'pay-104',
    memberName: 'তানিয়া সুলতানা',
    email: 'tania@ru.ac.bd',
    phone: '০১৮১২-৩৪৫৬৭৮',
    upazila: 'কোটচাঁদপুর',
    department: 'সমাজবিজ্ঞান',
    session: '২০২০-২১',
    amount: 500,
    paymentMethod: 'Rocket',
    trxId: 'RK900112A',
    status: 'expired',
    paidDate: '2025-01-10',
    expiryDate: '2026-01-10',
    createdAt: Date.now() - 400000000,
  },
];

function getLocalPayments(): MembershipPayment[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(INITIAL_DEMO_PAYMENTS));
      return INITIAL_DEMO_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_PAYMENTS;
  }
}

function saveLocalPayments(payments: MembershipPayment[]) {
  try {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch {
    // ignore
  }
}

export async function listMembershipPayments(): Promise<MembershipPayment[]> {
  try {
    const { data, error } = await supabase
      .from('membership_payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((r) => ({
        id: r.id,
        userId: r.user_id ?? undefined,
        memberName: r.member_name,
        email: r.email,
        phone: r.phone,
        upazila: r.upazila as UpazilaName,
        department: r.department,
        session: r.session,
        amount: Number(r.amount),
        paymentMethod: r.payment_method as MembershipPayment['paymentMethod'],
        trxId: r.trx_id,
        status: r.status as MembershipPaymentStatus,
        paidDate: r.paid_date ?? undefined,
        expiryDate: r.expiry_date ?? undefined,
        createdAt: new Date(r.created_at).getTime(),
      }));
    }
  } catch {
    // fallback
  }

  return getLocalPayments();
}

export interface SubmitPaymentInput {
  userId?: string;
  memberName: string;
  email: string;
  phone: string;
  upazila: UpazilaName;
  department: string;
  session: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
  trxId: string;
}

export async function createMembershipPayment(input: SubmitPaymentInput): Promise<MembershipPayment> {
  try {
    const { data, error } = await supabase
      .from('membership_payments')
      .insert({
        user_id: input.userId ?? null,
        member_name: input.memberName,
        email: input.email,
        phone: input.phone,
        upazila: input.upazila,
        department: input.department,
        session: input.session,
        amount: input.amount,
        payment_method: input.paymentMethod,
        trx_id: input.trxId,
        status: 'pending',
      })
      .select('*')
      .single();

    if (!error && data) {
      const record: MembershipPayment = {
        id: data.id,
        userId: data.user_id,
        memberName: data.member_name,
        email: data.email,
        phone: data.phone,
        upazila: data.upazila,
        department: data.department,
        session: data.session,
        amount: Number(data.amount),
        paymentMethod: data.payment_method,
        trxId: data.trx_id,
        status: data.status,
        createdAt: new Date(data.created_at).getTime(),
      };
      const local = getLocalPayments();
      saveLocalPayments([record, ...local]);
      return record;
    }
  } catch {
    // fallback
  }

  const newPayment: MembershipPayment = {
    id: `pay-${Date.now()}`,
    userId: input.userId,
    memberName: input.memberName,
    email: input.email,
    phone: input.phone,
    upazila: input.upazila,
    department: input.department,
    session: input.session,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    trxId: input.trxId,
    status: 'pending',
    createdAt: Date.now(),
  };

  const local = getLocalPayments();
  saveLocalPayments([newPayment, ...local]);
  return newPayment;
}

export async function updatePaymentStatus(id: string, status: MembershipPaymentStatus): Promise<void> {
  const nowStr = new Date().toISOString();
  const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  try {
    await supabase
      .from('membership_payments')
      .update({
        status,
        ...(status === 'paid' && { paid_date: nowStr, expiry_date: nextYearStr }),
      })
      .eq('id', id);
  } catch {
    // ignore
  }

  const local = getLocalPayments().map((p) => {
    if (p.id === id) {
      return {
        ...p,
        status,
        ...(status === 'paid' && { paidDate: nowStr, expiryDate: nextYearStr }),
      };
    }
    return p;
  });
  saveLocalPayments(local);
}

// ===== Event Online Registration Services =====

export async function listEventRegistrations(eventId?: string): Promise<EventRegistrationRecord[]> {
  try {
    let q = supabase.from('event_registrations').select('*').order('created_at', { ascending: false });
    if (eventId) q = q.eq('event_id', eventId);
    const { data, error } = await q;

    if (!error && data) {
      return data.map((r) => ({
        id: r.id,
        eventId: r.event_id,
        eventTitle: r.event_title,
        userId: r.user_id ?? undefined,
        name: r.name,
        email: r.email,
        phone: r.phone,
        department: r.department,
        session: r.session,
        paymentTrx: r.payment_trx ?? undefined,
        status: r.status as 'confirmed' | 'pending',
        createdAt: new Date(r.created_at).getTime(),
      }));
    }
  } catch {
    // fallback
  }

  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (raw) {
      const records: EventRegistrationRecord[] = JSON.parse(raw);
      return eventId ? records.filter((r) => r.eventId === eventId) : records;
    }
  } catch {
    // ignore
  }
  return [];
}

export async function registerForEvent(input: {
  eventId: string;
  eventTitle: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  session: string;
  paymentTrx?: string;
}): Promise<EventRegistrationRecord> {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: input.eventId,
        event_title: input.eventTitle,
        user_id: input.userId ?? null,
        name: input.name,
        email: input.email,
        phone: input.phone,
        department: input.department,
        session: input.session,
        payment_trx: input.paymentTrx ?? null,
        status: 'confirmed',
      })
      .select('*')
      .single();

    if (!error && data) {
      return {
        id: data.id,
        eventId: data.event_id,
        eventTitle: data.event_title,
        userId: data.user_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        session: data.session,
        paymentTrx: data.payment_trx,
        status: data.status,
        createdAt: new Date(data.created_at).getTime(),
      };
    }
  } catch {
    // fallback
  }

  const newReg: EventRegistrationRecord = {
    id: `reg-${Date.now()}`,
    eventId: input.eventId,
    eventTitle: input.eventTitle,
    userId: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    department: input.department,
    session: input.session,
    paymentTrx: input.paymentTrx,
    status: 'confirmed',
    createdAt: Date.now(),
  };

  try {
    const existing = await listEventRegistrations();
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([newReg, ...existing]));
  } catch {
    // ignore
  }

  return newReg;
}
