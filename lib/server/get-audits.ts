import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getAuditIds(): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data: audits, error } = await supabase
    .from('audits')
    .select('id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audit IDs:', error);
    return [];
  }

  return audits.map(audit => audit.id);
}