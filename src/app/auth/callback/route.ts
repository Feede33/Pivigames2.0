import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  console.log('🔄 [Callback] Starting auth callback...');
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔄 [Callback] URL params:', {
    hasCode: !!code,
    error,
    errorDescription,
    fullUrl: requestUrl.toString()
  });

  if (error) {
    console.error('❌ [Callback] OAuth error:', { error, errorDescription });
    return NextResponse.redirect(new URL(`/?error=${error}&error_description=${errorDescription}`, requestUrl.origin));
  }

  if (!code) {
    console.error('❌ [Callback] No code provided');
    return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin));
  }

  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    console.log('🔄 [Callback] Exchanging code for session...');
    
    // Intercambiar código por sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error('❌ [Callback] Error exchanging code:', sessionError);
      return NextResponse.redirect(new URL(`/?error=session_error&error_description=${sessionError.message}`, requestUrl.origin));
    }
    
    console.log('✅ [Callback] Session exchanged successfully:', {
      hasSession: !!sessionData.session,
      hasUser: !!sessionData.user,
      userId: sessionData.user?.id,
      userEmail: sessionData.user?.email
    });
    
    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ [Callback] Error getting user:', userError);
      return NextResponse.redirect(new URL(`/?error=user_error&error_description=${userError.message}`, requestUrl.origin));
    }
    
    if (!user) {
      console.error('❌ [Callback] No user found after session exchange');
      return NextResponse.redirect(new URL('/?error=no_user', requestUrl.origin));
    }
    
    console.log('✅ [Callback] User retrieved:', {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
      metadata: user.user_metadata
    });
    
    console.log('🔄 [Callback] Profile should be created automatically by trigger');
    
    // El perfil se crea automáticamente mediante el trigger on_auth_user_created
    // No necesitamos crear el perfil manualmente aquí
    
    // Esperar un momento para que el trigger termine
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar que el perfil se creó correctamente
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ [Callback] Profile not found after trigger:', profileError);
    } else {
      console.log('✅ [Callback] Profile created by trigger:', profile);
    }
    
    console.log('✅ [Callback] Redirecting to home page...');
    
    // Redirigir a la página principal
    return NextResponse.redirect(new URL('/', requestUrl.origin));
    
  } catch (error) {
    console.error('❌ [Callback] Unexpected error:', error);
    return NextResponse.redirect(new URL(`/?error=unexpected&error_description=${error}`, requestUrl.origin));
  }
}
