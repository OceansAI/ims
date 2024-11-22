import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore,
      });
      
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Exchange error:', error);
        return NextResponse.redirect(new URL('/login', requestUrl.origin));
      }

      // Successful auth, redirect to home
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    }

    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  } catch (error) {
    const requestUrl = new URL(request.url);
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }
}