import { supabase } from '@/lib/supabase';
import type { MemoryAlbum, UpazilaName } from '@/types';

const STORAGE_KEY = 'jhenaidah_memory_albums_v1';

const INITIAL_DEMO_ALBUMS: MemoryAlbum[] = [
  {
    id: 'album-1',
    title: 'বার্ষিক সাংস্কৃতিক উৎসব ও নবীন বরণ ২০২৫',
    description: 'রাজশাহী বিশ্ববিদ্যালয় টিটিসি মিলনায়তনে ঝিনাইদহ জেলা সমিতির উদ্যোগে বর্ণাঢ্য বর্ষবরণ ও সাংস্কৃতিক সন্ধ্যা ২০২৫ সফলভাবে অনুষ্ঠিত হয়েছে। অনুষ্ঠানে শতাধিক শিক্ষার্থী ও সুধীবৃন্দ উপস্থিত ছিলেন।',
    date: '2025-04-14',
    location: 'টিএসসিসি মিলনায়তন, রাজশাহী বিশ্ববিদ্যালয়',
    photos: [
      'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2566581/pexels-photo-2566581.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'সাংস্কৃতিক',
    authorName: 'মোঃ রফিকুল ইসলাম',
    authorPhoto: '',
    authorRole: 'সভাপতি, জেলা কমিটি',
    scope: 'district',
    upazila: null,
    createdAt: Date.now() - 50000000,
  },
  {
    id: 'album-2',
    title: 'স্বেচ্ছায় রক্তদান ও বিনামূল্যে স্বাস্থ্য ক্যাম্প',
    description: 'ঝিনাইদহ জেলার দুস্থ মানুষের সেবায় বিনামূল্যে রক্তের গ্রুপ নির্ণয় ও চিকিৎসা ক্যাম্প পরিচালনা। প্রায় ২৫০ জন সদস্য ও স্থানীয় জনসাধারণ সেবা গ্রহণ করেন।',
    date: '2025-06-02',
    location: 'ঝিনাইদহ সদর হাসপাতাল প্রাঙ্গণ',
    photos: [
      'https://images.pexels.com/photos/3992866/pexels-photo-3992866.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    category: 'সমাজসেবা',
    authorName: 'আব্দুল্লাহ আল মামুন',
    authorPhoto: '',
    authorRole: 'সাধারণ সম্পাদক, জেলা কমিটি',
    scope: 'district',
    upazila: null,
    createdAt: Date.now() - 40000000,
  },
  {
    id: 'album-3',
    title: 'কালীগঞ্জ উপজেলা শাখার বার্ষিক পিকনিক ও শিক্ষা সফর',
    description: 'পাহাড়পুর বৌদ্ধ বিহার ও ঐতিহাসিক স্থান পরিদর্শনের কিছু স্মরণীয় আলোকচিত্র। প্রকৃতি ও ইতিহাসের মেলবন্ধনে দারুণ একটি দিন।',
    date: '2025-03-10',
    location: 'পাহাড়পুর, নওগাঁ',
    photos: [
      'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    category: 'শিক্ষা সফর',
    authorName: 'সাব্বির আহমেদ',
    authorPhoto: '',
    authorRole: 'উপজেলা কমিটি, কালীগঞ্জ',
    scope: 'upazila',
    upazila: 'কালীগঞ্জ',
    createdAt: Date.now() - 30000000,
  },
];

function getLocalAlbums(): MemoryAlbum[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ALBUMS));
      return INITIAL_DEMO_ALBUMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ALBUMS;
  }
}

function saveLocalAlbums(albums: MemoryAlbum[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
  } catch {
    // ignore
  }
}

export async function listAlbums(
  scope?: 'district' | 'upazila',
  upazila?: UpazilaName
): Promise<MemoryAlbum[]> {
  try {
    let q = supabase.from('albums').select('*').order('created_at', { ascending: false });
    if (scope) q = q.eq('scope', scope);
    if (scope === 'upazila' && upazila) q = q.eq('upazila', upazila);

    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      return data.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? '',
        date: r.date,
        location: r.location ?? '',
        photos: r.photos || [],
        videoUrl: r.video_url ?? undefined,
        category: r.category ?? 'সাধারণ',
        authorId: r.author_id ?? undefined,
        authorName: r.author_name ?? '',
        authorPhoto: r.author_photo ?? undefined,
        authorRole: r.author_role ?? '',
        scope: r.scope as 'district' | 'upazila',
        upazila: r.upazila as UpazilaName,
        createdAt: new Date(r.created_at).getTime(),
      }));
    }
  } catch {
    // fallback
  }

  const local = getLocalAlbums();
  return local.filter((a) => {
    if (scope && a.scope !== scope) return false;
    if (scope === 'upazila' && upazila && a.upazila !== upazila) return false;
    return true;
  });
}

export interface CreateAlbumInput {
  title: string;
  description: string;
  date: string;
  location: string;
  photos: string[];
  videoUrl?: string;
  category: string;
  authorId?: string;
  authorName: string;
  authorPhoto?: string;
  authorRole: string;
  scope: 'district' | 'upazila';
  upazila?: UpazilaName;
}

export async function createAlbum(input: CreateAlbumInput): Promise<MemoryAlbum> {
  try {
    const { data, error } = await supabase
      .from('albums')
      .insert({
        title: input.title,
        description: input.description,
        date: input.date,
        location: input.location,
        photos: input.photos,
        video_url: input.videoUrl ?? null,
        category: input.category,
        author_id: input.authorId ?? null,
        author_name: input.authorName,
        author_photo: input.authorPhoto ?? null,
        author_role: input.authorRole,
        scope: input.scope,
        upazila: input.scope === 'upazila' ? (input.upazila ?? null) : null,
      })
      .select('*')
      .single();

    if (!error && data) {
      const album: MemoryAlbum = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        photos: data.photos,
        videoUrl: data.video_url,
        category: data.category,
        authorId: data.author_id,
        authorName: data.author_name,
        authorPhoto: data.author_photo,
        authorRole: data.author_role,
        scope: data.scope,
        upazila: data.upazila,
        createdAt: new Date(data.created_at).getTime(),
      };
      const local = getLocalAlbums();
      saveLocalAlbums([album, ...local]);
      return album;
    }
  } catch {
    // fallback
  }

  const newAlbum: MemoryAlbum = {
    id: `album-${Date.now()}`,
    title: input.title,
    description: input.description,
    date: input.date,
    location: input.location,
    photos: input.photos,
    videoUrl: input.videoUrl,
    category: input.category,
    authorId: input.authorId,
    authorName: input.authorName,
    authorPhoto: input.authorPhoto,
    authorRole: input.authorRole,
    scope: input.scope,
    upazila: input.scope === 'upazila' ? input.upazila : undefined,
    createdAt: Date.now(),
  };

  const local = getLocalAlbums();
  saveLocalAlbums([newAlbum, ...local]);
  return newAlbum;
}

export async function deleteAlbum(id: string): Promise<void> {
  try {
    await supabase.from('albums').delete().eq('id', id);
  } catch {
    // ignore
  }
  const local = getLocalAlbums().filter((a) => a.id !== id);
  saveLocalAlbums(local);
}
