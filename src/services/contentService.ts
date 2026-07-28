import { supabase } from '@/lib/supabase';
import { NOTICES, EVENTS, GALLERY } from '@/data/sampleData';
import type { Notice, OrgEvent, GalleryItem, UpazilaName } from '@/types';

// ===== Notices =====
export async function listNotices(scope?: 'district' | 'upazila', upazila?: UpazilaName): Promise<Notice[]> {
  try {
    let q = supabase.from('notices').select('*').order('date', { ascending: false });
    if (scope) q = q.eq('scope', scope);
    if (upazila) q = q.eq('upazila', upazila);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) {
      return scope === 'upazila' && upazila
        ? NOTICES.filter((n) => n.scope === 'upazila' && n.upazila === upazila)
        : NOTICES;
    }
    return data.map((d) => ({
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
  } catch {
    return scope === 'upazila' && upazila
      ? NOTICES.filter((n) => n.scope === 'upazila' && n.upazila === upazila)
      : NOTICES;
  }
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
  if (error) throw error;
  return data.id;
}

export async function updateNotice(id: string, patch: Partial<NoticeInput>): Promise<void> {
  const { error } = await supabase
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
  if (error) throw error;
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) throw error;
}

// ===== Events =====
export async function listEvents(scope?: 'district' | 'upazila', upazila?: UpazilaName): Promise<OrgEvent[]> {
  try {
    let q = supabase.from('events').select('*').order('date', { ascending: false });
    if (scope) q = q.eq('scope', scope);
    if (upazila) q = q.eq('upazila', upazila);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) {
      return scope === 'upazila' && upazila
        ? EVENTS.filter((e) => e.scope === 'upazila' && e.upazila === upazila)
        : EVENTS;
    }
    return data.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      date: d.date,
      location: d.location,
      coverImage: d.cover_image,
      status: d.status,
      scope: d.scope,
      upazila: d.upazila,
      authorId: d.author_id,
    })) as OrgEvent[];
  } catch {
    return scope === 'upazila' && upazila
      ? EVENTS.filter((e) => e.scope === 'upazila' && e.upazila === upazila)
      : EVENTS;
  }
}

export interface EventInput {
  title: string;
  description: string;
  date: string;
  location: string;
  coverImage?: string;
  status: OrgEvent['status'];
  scope: 'district' | 'upazila';
  upazila?: UpazilaName;
  authorId: string;
}

export async function createEvent(input: EventInput): Promise<string> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: input.title,
      description: input.description,
      date: input.date,
      location: input.location,
      cover_image: input.coverImage ?? null,
      status: input.status,
      scope: input.scope,
      upazila: input.upazila ?? null,
      author_id: input.authorId,
    })
    .select()
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateEvent(id: string, patch: Partial<EventInput>): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({
      ...(patch.title && { title: patch.title }),
      ...(patch.description && { description: patch.description }),
      ...(patch.date && { date: patch.date }),
      ...(patch.location && { location: patch.location }),
      ...(patch.coverImage !== undefined && { cover_image: patch.coverImage }),
      ...(patch.status && { status: patch.status }),
      ...(patch.scope && { scope: patch.scope }),
      ...(patch.upazila !== undefined && { upazila: patch.upazila }),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

// ===== Gallery =====
export async function listGallery(scope?: 'district' | 'upazila', upazila?: UpazilaName): Promise<GalleryItem[]> {
  try {
    let q = supabase.from('gallery').select('*').order('date', { ascending: false });
    if (scope) q = q.eq('scope', scope);
    if (upazila) q = q.eq('upazila', upazila);
    const { data, error } = await q;
    if (error) throw error;
    if (!data || data.length === 0) {
      return scope === 'upazila' && upazila
        ? GALLERY.filter((g) => g.scope === 'upazila' && g.upazila === upazila)
        : GALLERY;
    }
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
  } catch {
    return scope === 'upazila' && upazila
      ? GALLERY.filter((g) => g.scope === 'upazila' && g.upazila === upazila)
      : GALLERY;
  }
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
  if (error) throw error;
  return data.id;
}

export async function updateGalleryItem(id: string, patch: Partial<GalleryInput>): Promise<void> {
  const { error } = await supabase
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
  if (error) throw error;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
}
