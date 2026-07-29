import { supabase } from '@/lib/supabase';
import { NOTICES, EVENTS, GALLERY } from '@/data/sampleData';
import type { Notice, OrgEvent, GalleryItem, UpazilaName } from '@/types';

const NOTICES_KEY = 'jhenaidah_local_notices_v1';
const EVENTS_KEY = 'jhenaidah_local_events_v1';
const GALLERY_KEY = 'jhenaidah_local_gallery_v1';

// Local storage helpers
function getLocalNotices(): Notice[] {
  try {
    const raw = localStorage.getItem(NOTICES_KEY);
    if (!raw) {
      localStorage.setItem(NOTICES_KEY, JSON.stringify(NOTICES));
      return NOTICES;
    }
    return JSON.parse(raw);
  } catch {
    return NOTICES;
  }
}

function saveLocalNotices(items: Notice[]) {
  try {
    localStorage.setItem(NOTICES_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function getLocalEvents(): OrgEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(EVENTS));
      return EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return EVENTS;
  }
}

function saveLocalEvents(items: OrgEvent[]) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function getLocalGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(GALLERY));
      return GALLERY;
    }
    return JSON.parse(raw);
  } catch {
    return GALLERY;
  }
}

function saveLocalGallery(items: GalleryItem[]) {
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// ===== Notices =====
export async function listNotices(scope?: 'district' | 'upazila', upazila?: UpazilaName): Promise<Notice[]> {
  try {
    let q = supabase.from('notices').select('*').order('date', { ascending: false });
    if (scope) q = q.eq('scope', scope);
    if (upazila) q = q.eq('upazila', upazila);
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      const mapped = data.map((d) => ({
        id: d.id,
        title: d.title,
        body: d.body,
        category: d.category,
        date: d.date,
        pinned: d.pinned,
        scope: d.scope,
        upazila: d.upazila,
        authorId: d.author_id,
      })) as Notice[];
      return mapped;
    }
  } catch {
    // fallback
  }

  const local = getLocalNotices();
  return scope === 'upazila' && upazila
    ? local.filter((n) => n.scope === 'upazila' && n.upazila === upazila)
    : scope === 'district'
    ? local.filter((n) => n.scope === 'district' || !n.scope)
    : local;
}

export interface NoticeInput {
  title: string;
  body: string;
  category: Notice['category'];
  date: string;
  pinned?: boolean;
  scope: 'district' | 'upazila';
  upazila?: UpazilaName;
  authorId: string;
}

export async function createNotice(input: NoticeInput): Promise<string> {
  const newId = `notice-${Date.now()}`;
  const newNotice: Notice = {
    id: newId,
    title: input.title,
    body: input.body,
    category: input.category,
    date: input.date,
    pinned: input.pinned ?? false,
    scope: input.scope,
    upazila: input.scope === 'upazila' ? input.upazila : undefined,
    authorId: input.authorId,
  };

  try {
    const { data, error } = await supabase
      .from('notices')
      .insert({
        title: input.title,
        body: input.body,
        category: input.category,
        date: input.date,
        pinned: input.pinned ?? false,
        scope: input.scope,
        upazila: input.upazila ?? null,
        author_id: input.authorId,
      })
      .select()
      .single();

    if (!error && data) {
      const local = getLocalNotices();
      saveLocalNotices([{ ...newNotice, id: data.id }, ...local]);
      return data.id;
    }
  } catch {
    // fallback
  }

  const local = getLocalNotices();
  saveLocalNotices([newNotice, ...local]);
  return newId;
}

export async function updateNotice(id: string, patch: Partial<NoticeInput>): Promise<void> {
  try {
    await supabase
      .from('notices')
      .update({
        ...(patch.title && { title: patch.title }),
        ...(patch.body && { body: patch.body }),
        ...(patch.category && { category: patch.category }),
        ...(patch.date && { date: patch.date }),
        ...(patch.pinned !== undefined && { pinned: patch.pinned }),
        ...(patch.scope && { scope: patch.scope }),
        ...(patch.upazila !== undefined && { upazila: patch.upazila }),
      })
      .eq('id', id);
  } catch {
    // fallback
  }

  const local = getLocalNotices().map((n) => {
    if (n.id === id) {
      return {
        ...n,
        ...(patch.title && { title: patch.title }),
        ...(patch.body && { body: patch.body }),
        ...(patch.category && { category: patch.category }),
        ...(patch.date && { date: patch.date }),
        ...(patch.pinned !== undefined && { pinned: patch.pinned }),
        ...(patch.scope && { scope: patch.scope }),
        ...(patch.upazila !== undefined && { upazila: patch.upazila }),
      };
    }
    return n;
  });
  saveLocalNotices(local);
}

export async function deleteNotice(id: string): Promise<void> {
  try {
    await supabase.from('notices').delete().eq('id', id);
  } catch {
    // fallback
  }

  const local = getLocalNotices().filter((n) => n.id !== id);
  saveLocalNotices(local);
}

// ===== Events =====
export async function listEvents(scope?: 'district' | 'upazila', upazila?: UpazilaName): Promise<OrgEvent[]> {
  try {
    let q = supabase.from('events').select('*').order('date', { ascending: false });
    if (scope) q = q.eq('scope', scope);
    if (upazila) q = q.eq('upazila', upazila);
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        date: d.date,
        time: d.time,
        location: d.location,
        chiefGuest: d.chief_guest,
        coverImage: d.cover_image,
        status: d.status,
        registrationOpen: d.registration_open,
        registrationFee: d.registration_fee,
        photos: d.photos,
        videoUrl: d.video_url,
        scope: d.scope,
        upazila: d.upazila,
        authorId: d.author_id,
      })) as OrgEvent[];
    }
  } catch {
    // fallback
  }

  const local = getLocalEvents();
  return scope === 'upazila' && upazila
    ? local.filter((e) => e.scope === 'upazila' && e.upazila === upazila)
    : scope === 'district'
    ? local.filter((e) => e.scope === 'district' || !e.scope)
    : local;
}

export interface EventInput {
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  chiefGuest?: string;
  coverImage?: string;
  status: OrgEvent['status'];
  registrationOpen?: boolean;
  registrationFee?: number;
  photos?: string[];
  videoUrl?: string;
  scope: 'district' | 'upazila';
  upazila?: UpazilaName;
  authorId: string;
}

export async function createEvent(input: EventInput): Promise<string> {
  const newId = `event-${Date.now()}`;
  const newEvent: OrgEvent = {
    id: newId,
    title: input.title,
    description: input.description,
    date: input.date,
    time: input.time,
    location: input.location,
    chiefGuest: input.chiefGuest,
    coverImage: input.coverImage,
    status: input.status,
    registrationOpen: input.registrationOpen,
    registrationFee: input.registrationFee,
    videoUrl: input.videoUrl,
    scope: input.scope,
    upazila: input.scope === 'upazila' ? input.upazila : undefined,
    authorId: input.authorId,
  };

  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: input.title,
        description: input.description,
        date: input.date,
        time: input.time ?? null,
        location: input.location,
        chief_guest: input.chiefGuest ?? null,
        cover_image: input.coverImage ?? null,
        status: input.status,
        registration_open: input.registrationOpen ?? true,
        registration_fee: input.registrationFee ?? 0,
        video_url: input.videoUrl ?? null,
        scope: input.scope,
        upazila: input.upazila ?? null,
        author_id: input.authorId,
      })
      .select()
      .single();

    if (!error && data) {
      const local = getLocalEvents();
      saveLocalEvents([{ ...newEvent, id: data.id }, ...local]);
      return data.id;
    }
  } catch {
    // fallback
  }

  const local = getLocalEvents();
  saveLocalEvents([newEvent, ...local]);
  return newId;
}

export async function updateEvent(id: string, patch: Partial<EventInput>): Promise<void> {
  try {
    await supabase
      .from('events')
      .update({
        ...(patch.title && { title: patch.title }),
        ...(patch.description && { description: patch.description }),
        ...(patch.date && { date: patch.date }),
        ...(patch.time && { time: patch.time }),
        ...(patch.location && { location: patch.location }),
        ...(patch.chiefGuest !== undefined && { chief_guest: patch.chiefGuest }),
        ...(patch.coverImage !== undefined && { cover_image: patch.coverImage }),
        ...(patch.status && { status: patch.status }),
        ...(patch.registrationOpen !== undefined && { registration_open: patch.registrationOpen }),
        ...(patch.registrationFee !== undefined && { registration_fee: patch.registrationFee }),
        ...(patch.videoUrl !== undefined && { video_url: patch.videoUrl }),
        ...(patch.scope && { scope: patch.scope }),
        ...(patch.upazila !== undefined && { upazila: patch.upazila }),
      })
      .eq('id', id);
  } catch {
    // fallback
  }

  const local = getLocalEvents().map((e) => {
    if (e.id === id) {
      return {
        ...e,
        ...(patch.title && { title: patch.title }),
        ...(patch.description && { description: patch.description }),
        ...(patch.date && { date: patch.date }),
        ...(patch.time && { time: patch.time }),
        ...(patch.location && { location: patch.location }),
        ...(patch.chiefGuest !== undefined && { chiefGuest: patch.chiefGuest }),
        ...(patch.coverImage !== undefined && { coverImage: patch.coverImage }),
        ...(patch.status && { status: patch.status }),
        ...(patch.registrationOpen !== undefined && { registrationOpen: patch.registrationOpen }),
        ...(patch.registrationFee !== undefined && { registrationFee: patch.registrationFee }),
        ...(patch.videoUrl !== undefined && { videoUrl: patch.videoUrl }),
        ...(patch.scope && { scope: patch.scope }),
        ...(patch.upazila !== undefined && { upazila: patch.upazila }),
      };
    }
    return e;
  });
  saveLocalEvents(local);
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    await supabase.from('events').delete().eq('id', id);
  } catch {
    // fallback
  }

  const local = getLocalEvents().filter((e) => e.id !== id);
  saveLocalEvents(local);
}

// ===== Gallery =====
export async function listGallery(scope?: 'district' | 'upazila', upazila?: UpazilaName): Promise<GalleryItem[]> {
  try {
    let q = supabase.from('gallery').select('*').order('date', { ascending: false });
    if (scope) q = q.eq('scope', scope);
    if (upazila) q = q.eq('upazila', upazila);
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        title: d.title,
        url: d.url,
        category: d.category,
        date: d.date,
        scope: d.scope,
        upazila: d.upazila,
        authorId: d.author_id,
      })) as GalleryItem[];
    }
  } catch {
    // fallback
  }

  const local = getLocalGallery();
  return scope === 'upazila' && upazila
    ? local.filter((g) => g.scope === 'upazila' && g.upazila === upazila)
    : scope === 'district'
    ? local.filter((g) => g.scope === 'district' || !g.scope)
    : local;
}

export interface GalleryInput {
  title: string;
  url: string;
  category: string;
  date: string;
  scope: 'district' | 'upazila';
  upazila?: UpazilaName;
  authorId: string;
}

export async function createGalleryItem(input: GalleryInput): Promise<string> {
  const newId = `gal-${Date.now()}`;
  const newItem: GalleryItem = {
    id: newId,
    title: input.title,
    url: input.url,
    category: input.category,
    date: input.date,
    scope: input.scope,
    upazila: input.scope === 'upazila' ? input.upazila : undefined,
    authorId: input.authorId,
  };

  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert({
        title: input.title,
        url: input.url,
        category: input.category,
        date: input.date,
        scope: input.scope,
        upazila: input.upazila ?? null,
        author_id: input.authorId,
      })
      .select()
      .single();

    if (!error && data) {
      const local = getLocalGallery();
      saveLocalGallery([{ ...newItem, id: data.id }, ...local]);
      return data.id;
    }
  } catch {
    // fallback
  }

  const local = getLocalGallery();
  saveLocalGallery([newItem, ...local]);
  return newId;
}

export async function updateGalleryItem(id: string, patch: Partial<GalleryInput>): Promise<void> {
  try {
    await supabase
      .from('gallery')
      .update({
        ...(patch.title && { title: patch.title }),
        ...(patch.url && { url: patch.url }),
        ...(patch.category && { category: patch.category }),
        ...(patch.date && { date: patch.date }),
        ...(patch.scope && { scope: patch.scope }),
        ...(patch.upazila !== undefined && { upazila: patch.upazila }),
      })
      .eq('id', id);
  } catch {
    // fallback
  }

  const local = getLocalGallery().map((g) => {
    if (g.id === id) {
      return {
        ...g,
        ...(patch.title && { title: patch.title }),
        ...(patch.url && { url: patch.url }),
        ...(patch.category && { category: patch.category }),
        ...(patch.date && { date: patch.date }),
        ...(patch.scope && { scope: patch.scope }),
        ...(patch.upazila !== undefined && { upazila: patch.upazila }),
      };
    }
    return g;
  });
  saveLocalGallery(local);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await supabase.from('gallery').delete().eq('id', id);
  } catch {
    // fallback
  }

  const local = getLocalGallery().filter((g) => g.id !== id);
  saveLocalGallery(local);
}
