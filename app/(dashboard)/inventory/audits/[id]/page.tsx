import { getAuditIds } from '@/lib/server/get-audits';
import AuditPageClient from './audit-page-client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function generateStaticParams() {
  try {
    const auditIds = await getAuditIds();
    return auditIds.map((id) => ({
      id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function AuditPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  // Verify the audit exists
  const { data: audit, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    return <div>Audit not found</div>;
  }

  return <AuditPageClient auditId={params.id} />;
}