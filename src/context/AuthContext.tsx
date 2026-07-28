import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { AppUser, FirestoreUser, UserRole, UpazilaName } from '@/types';

export type AuthErrorCode =
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_PENDING'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_DELETED'
  | 'NO_USER_DOC'
  | 'NOT_ALLOWED'
  | 'AUTH_FAILED';

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'student' | 'teacher' | 'alumni'>;
  upazila: UpazilaName;
}

interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  firestoreUser: FirestoreUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(uid: string): Promise<FirestoreUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return {
    uid: data.id,
    name: data.name,
    email: data.email,
    role: data.role as UserRole,
    committeeType: data.committee_type as FirestoreUser['committeeType'],
    upazila: data.upazila as UpazilaName,
    position: data.position,
    photoUrl: data.photo_url as string | null,
    status: data.status as FirestoreUser['status'],
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
    securityKey: data.security_key,
    committeeCode: data.committee_code,
    approvedBy: data.approved_by,
  };
}

// If the profile row is missing, auto-create it from the authenticated
// user's info so login is never blocked by a missing document.
async function ensureProfile(u: User): Promise<FirestoreUser | null> {
  const existing = await fetchProfile(u.id);
  const meta = u.user_metadata ?? {};
  const role = (meta.role as UserRole) ?? existing?.role ?? 'student';
  const autoApproved = role === 'student' || role === 'alumni';

  // Auto-activate students/alumni whose profile is missing or stuck in pending
  if (existing && autoApproved && existing.status === 'pending') {
    await supabase.from('profiles').update({
      status: 'active',
      approved_by: u.id,
      updated_at: new Date().toISOString(),
    }).eq('id', u.id);
    return fetchProfile(u.id);
  }
  if (existing) return existing;

  const { error } = await supabase.from('profiles').upsert({
    id: u.id,
    name: meta.name ?? (u.email ?? 'ব্যবহারকারী'),
    email: u.email ?? '',
    role,
    committee_type: null,
    upazila: meta.upazila ?? null,
    position: null,
    photo_url: null,
    status: autoApproved ? 'active' : 'pending',
    approved_by: autoApproved ? u.id : null,
  }, { onConflict: 'id' });
  if (error) return null;
  return fetchProfile(u.id);
}

function toAppUser(u: User, fs: FirestoreUser): AppUser {
  return {
    uid: u.id,
    email: u.email ?? null,
    displayName: fs.name ?? u.email ?? null,
    photoURL: fs.photoUrl ?? null,
    role: fs.role,
    status: fs.status,
    upazila: fs.upazila,
    position: fs.position,
    committeeType: fs.committeeType,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      (async () => {
        if (!mounted) return;
        if (!session?.user) {
          setUser(null);
          setFirestoreUser(null);
          setLoading(false);
          return;
        }
        try {
          const fs = await ensureProfile(session.user);
          if (!mounted) return;
          if (!fs) {
            setUser(null);
            setFirestoreUser(null);
          } else {
            setFirestoreUser(fs);
            setUser(toAppUser(session.user, fs));
          }
        } catch {
          if (!mounted) return;
          setUser(null);
          setFirestoreUser(null);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    });

    return () => { mounted = false; };
  }, []);

  const login = async (input: LoginInput) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user) {
      throw new AuthError('AUTH_FAILED', 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
    }

    const fs = await ensureProfile(data.user);
    if (!fs) {
      await supabase.auth.signOut();
      throw new AuthError('NO_USER_DOC', 'ব্যবহারকারীর তথ্য তৈরিতে সমস্যা হয়েছে।');
    }

    if (fs.status === 'pending') {
      // Students/alumni should never be pending — auto-activate as a safety net
      if (fs.role === 'student' || fs.role === 'alumni') {
        await supabase.from('profiles').update({
          status: 'active',
          approved_by: data.user.id,
          updated_at: new Date().toISOString(),
        }).eq('id', data.user.id);
        const refreshed = await fetchProfile(data.user.id);
        if (refreshed) {
          setFirestoreUser(refreshed);
          setUser(toAppUser(data.user, refreshed));
          return;
        }
      }
      await supabase.auth.signOut();
      throw new AuthError('ACCOUNT_PENDING', 'আপনার অ্যাকাউন্ট এখনো অনুমোদিত হয়নি।');
    }
    if (fs.status === 'suspended') {
      await supabase.auth.signOut();
      throw new AuthError('ACCOUNT_SUSPENDED', 'আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।');
    }
    if (fs.status === 'deleted') {
      await supabase.auth.signOut();
      throw new AuthError('ACCOUNT_DELETED', 'এই অ্যাকাউন্টটি মুছে ফেলা হয়েছে।');
    }

    setFirestoreUser(fs);
    setUser(toAppUser(data.user, fs));

    try {
      await supabase.from('audit_logs').insert({
        actor_id: data.user.id,
        actor_email: data.user.email ?? '',
        actor_role: fs.role,
        action: 'login',
        details: 'সফল লগইন',
      });
    } catch {
      // best-effort
    }
  };

  const register = async (input: RegisterInput) => {
    if (!['student', 'teacher', 'alumni'].includes(input.role)) {
      throw new AuthError('NOT_ALLOWED', 'এই ভূমিকার জন্য স্ব-নিবন্ধন অনুমোদিত নয়।');
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.name,
          role: input.role,
          upazila: input.upazila,
        },
      },
    });
    if (error || !data.user) {
      throw new AuthError('AUTH_FAILED', error?.message ?? 'নিবন্ধন ব্যর্থ।');
    }

    const uid = data.user.id;
    const autoApproved = input.role === 'student' || input.role === 'alumni';
    // Use upsert so this doesn't fail if onAuthStateChange's ensureProfile
    // already created the row from the signUp metadata above.
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: uid,
      name: input.name,
      email: input.email,
      role: input.role,
      committee_type: null,
      upazila: input.upazila,
      position: null,
      photo_url: null,
      status: autoApproved ? 'active' : 'pending',
      approved_by: autoApproved ? uid : null,
    }, { onConflict: 'id' });
    if (profileError) {
      await supabase.auth.signOut();
      throw new AuthError('AUTH_FAILED', 'প্রোফাইল তৈরিতে সমস্যা হয়েছে।');
    }

    try {
      await supabase.from('audit_logs').insert({
        actor_id: uid,
        actor_email: input.email,
        actor_role: input.role,
        action: 'register',
        details: `স্ব-নিবন্ধন: ${input.name}`,
      });
    } catch {
      // best-effort
    }

    await supabase.auth.signOut();
  };

  const logout = async () => {
    if (user) {
      try {
        await supabase.from('audit_logs').insert({
          actor_id: user.uid,
          actor_email: user.email ?? '',
          actor_role: user.role,
          action: 'logout',
          details: 'লগআউট',
        });
      } catch {
        // best-effort
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setFirestoreUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new AuthError('AUTH_FAILED', error.message);
  };

  const resendVerification = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email) {
      await supabase.auth.resend({ type: 'signup', email: data.user.email });
    }
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const fs = await fetchProfile(data.user.id);
      if (fs) {
        setFirestoreUser(fs);
        setUser(toAppUser(data.user, fs));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, firestoreUser, loading, login, register, logout, resetPassword, resendVerification, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
