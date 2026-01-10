import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Si hay un error, redirigir con el error
  if (error) {
    console.error('Auth error:', error, errorDescription);
    return NextResponse.redirect(`${requestUrl.origin}?error=${error}`);
  }

  // Si hay código, intercambiarlo por sesión
  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code:', exchangeError);
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`);
    }
  }

  // Redirigir de vuelta a la página principal
  return NextResponse.redirect(requestUrl.origin);
}
