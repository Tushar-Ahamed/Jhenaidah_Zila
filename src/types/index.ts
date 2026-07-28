// ===== Authentication & User Schema =====

export type UserRole =
  | 'student'
  | 'teacher'
  | 'alumni'
  | 'upazila_committee'
  | 'district_committee'
  | 'upazila_admin'
  | 'district_admin';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export type CommitteeType = 'upazila' | 'district' | null;

export type UpazilaName =
  | 'ঝিনাইদহ সদর'
  | 'কালীগঞ্জ'
  | 'কোটচাঁদপুর'
  | 'মহেশপুর'
  | 'শৈলকূপা'
  | 'হরিণাকুণ্ডু'
  | null;

// Full Firestore user document. Hidden fields (securityKey, committeeCode,
// approvedBy) are stored but never surfaced to the UI.
export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  committeeType: CommitteeType;
  upazila: UpazilaName;
  position: string | null;
  photoUrl: string | null;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  // Hidden — never expose in UI
  securityKey?: string;
  committeeCode?: string;
  approvedBy?: string | null;
}

// Safe projection for client-side use (hidden fields stripped).
export type SafeUser = Omit<FirestoreUser, 'securityKey' | 'committeeCode' | 'approvedBy'>;

// AppUser kept for backward-compat with existing components.
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  upazila?: UpazilaName;
  position?: string | null;
  committeeType?: CommitteeType;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'শিক্ষার্থী',
  teacher: 'শিক্ষক',
  alumni: 'প্রাক্তন ছাত্র',
  upazila_committee: 'উপজেলা কমিটি',
  district_committee: 'জেলা কমিটি',
  upazila_admin: 'উপজেলা প্রশাসক',
  district_admin: 'জেলা প্রশাসক',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'অনুমোদন বিচারাধীন',
  active: 'সক্রিয়',
  suspended: 'স্থগিত',
  deleted: 'মুছে ফেলা হয়েছে',
};

// Roles that may self-register.
export const SELF_REGISTER_ROLES: UserRole[] = ['student', 'teacher', 'alumni'];

// Roles that are committee/admin (cannot self-register).
export const COMMITTEE_ROLES: UserRole[] = [
  'upazila_committee',
  'district_committee',
  'upazila_admin',
  'district_admin',
];

// Admin roles.
export const ADMIN_ROLES: UserRole[] = ['upazila_admin', 'district_admin'];

export const UPAZILA_OPTIONS: UpazilaName[] = [
  'ঝিনাইদহ সদর',
  'কালীগঞ্জ',
  'কোটচাঁদপুর',
  'মহেশপুর',
  'শৈলকূপা',
  'হরিণাকুণ্ডু',
];

// ===== Content types (unchanged) =====

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: 'জরুরি' | 'সাধারণ' | 'অনুষ্ঠান' | 'নির্বাচন';
  date: string;
  attachmentUrl?: string;
  pinned?: boolean;
  authorId?: string;
  scope?: 'district' | 'upazila';
  upazila?: UpazilaName;
}

export interface OrgEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  coverImage?: string;
  status: 'upcoming' | 'ongoing' | 'past';
  authorId?: string;
  scope?: 'district' | 'upazila';
  upazila?: UpazilaName;
}

export interface Member {
  id: string;
  name: string;
  designation: string;
  organization: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  upazila?: string;
  order?: number;
}

// ===== Member Management =====

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;

export type MemberStatus = 'pending' | 'approved' | 'rejected';

export interface MemberProfile {
  id: string;
  uid?: string;
  name: string;
  photo: string;
  department: string;
  session: string;
  hall: string;
  upazila: UpazilaName;
  phone: string;
  email: string;
  bloodGroup: BloodGroup;
  facebook?: string;
  linkedin?: string;
  bio: string;
  status: MemberStatus;
  createdAt: number;
  updatedAt: number;
}

export const DEPARTMENTS = [
  'বাংলা',
  'ইংরেজি',
  'ইতিহাস',
  'দর্শন',
  'রাষ্ট্রবিজ্ঞান',
  'সমাজবিজ্ঞান',
  'অর্থনীতি',
  'গণিত',
  'পদার্থবিজ্ঞান',
  'রসায়ন',
  'প্রাণীবিজ্ঞান',
  'উদ্ভিদবিজ্ঞান',
  'ভূগোল',
  'মনোবিজ্ঞান',
  'শিক্ষা',
  'আইন',
  'ব্যবস্থাপনা',
  'ফিন্যান্স',
  'মার্কেটিং',
  'হিসাববিজ্ঞান',
  'কম্পিউটার সায়েন্স',
  'পরিসংখ্যান',
  'গ্রন্থাগার বিজ্ঞান',
];

export const SESSIONS = [
  '২০১৮-১৯',
  '২০১৯-২০',
  '২০২০-২১',
  '২০২১-২২',
  '২০২২-২৩',
  '২০২৩-২৪',
  '২০২৪-২৫',
  '২০২৫-২৬',
];

export const HALLS = [
  'শহীদ জহুরুল হক হল',
  'শহীদ সালাম বরকত হল',
  'শহীদ আবু সামাদ হল',
  'শহীদ হবিবুর রহমান হল',
  'বঙ্গবন্ধু শেখ মুজিব হল',
  'মাদার ভাসানি হল',
  'নবাব আব্দুল্লাহ হল',
  'শামসুজ্জোহা হল',
];

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export interface Upazila {
  id: string;
  name: string;
  description: string;
  president: string;
  secretary: string;
  memberCount: number;
  highlights: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  category: string;
  date: string;
  authorId?: string;
  scope?: 'district' | 'upazila';
  upazila?: UpazilaName;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: number;
}

// ===== Audit Logs =====

export type AuditAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'profile_update'
  | 'status_change'
  | 'role_change'
  | 'account_created'
  | 'account_deleted'
  | 'account_approved'
  | 'password_reset'
  | 'email_verified';

export interface AuditLog {
  id?: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: AuditAction;
  targetId?: string;
  targetEmail?: string;
  details?: string;
  createdAt: number;
}
