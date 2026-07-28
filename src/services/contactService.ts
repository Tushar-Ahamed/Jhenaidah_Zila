import { supabase } from '@/lib/supabase';
import type { ContactMessage } from '@/types';

export async function submitContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
  });
  if (error) throw error;
}

export async function listContactMessages(limit = 50): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    email: d.email,
    subject: d.subject,
    message: d.message,
    createdAt: new Date(d.created_at).getTime(),
  }));
}
