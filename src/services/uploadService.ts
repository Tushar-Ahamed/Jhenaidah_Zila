import { supabase } from '@/lib/supabase';

const BUCKET = 'uploads';

// Upload an image to Supabase Storage and return its public URL.
// Falls back to a local object URL when Storage is unreachable so the
// UI remains functional in the demo environment.
export async function uploadImage(
  file: File,
  path: string
): Promise<{ url: string; path: string }> {
  const filePath = `${path}/${Date.now()}-${file.name}`;
  try {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: false });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return { url: data.publicUrl, path: filePath };
  } catch {
    // Fallback: local object URL (demo only — not persisted)
    const url = URL.createObjectURL(file);
    return { url, path: filePath };
  }
}

export async function deleteImage(path: string): Promise<void> {
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // best-effort
  }
}

// ===== Avatar upload =====

const AVATAR_BUCKET = 'avatars';

export async function uploadAvatar(
  file: File,
  uid: string
): Promise<{ url: string; path: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const filePath = `${uid}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  return { url: data.publicUrl, path: filePath };
}
