'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  token: z.string().length(6),
});

export async function verifyOtpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;

  // Validate the input
  try {
    schema.parse({ email, token });
  } catch (error) {
    return { error: 'Invalid input' };
  }

  const supabase = createServerSupabaseClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;
    
    if (!session) {
      throw new Error('No session created after verification');
    }

    // Set the auth cookie
    cookies().set('sb-token', session.access_token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    redirect('/');
    
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return { error: error.message || 'Failed to verify OTP' };
  }
}