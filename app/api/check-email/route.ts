import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ exists: false });
  }
}