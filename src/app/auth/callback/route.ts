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
    
    console.log('🔄 [Callback] Checking for existing profile...');
    
    // Verificar si ya existe un perfil
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)  // ← CORRECTO: usar 'id' no 'user_id'
      .single();
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ [Callback] Error checking profile:', profileCheckError);
    }
    
    console.log('🔄 [Callback] Profile check result:', {
      hasProfile: !!existingProfile,
      profileId: existingProfile?.id,
      error: profileCheckError?.code
    });
    
    // Si no existe perfil, crearlo automáticamente
    if (!existingProfile) {
      console.log('🔄 [Callback] Creating new profile...');
      
      // Extraer datos según el proveedor
      const metadata = user.user_metadata;
      const identity = user.identities?.[0];
      
      // Para Google: full_name, avatar_url, picture
      // Para Discord: full_name, avatar_url
      const nickname = metadata?.full_name || 
                      metadata?.name || 
                      metadata?.user_name ||
                      user.email?.split('@')[0] || 
                      'Usuario';
      
      // Google usa 'picture', Discord usa 'avatar_url'
      const avatarUrl = metadata?.avatar_url || 
                       metadata?.picture ||
                       identity?.identity_data?.avatar_url ||
                       identity?.identity_data?.picture ||
                       `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
      
      console.log('🔄 [Callback] Profile data:', { 
        nickname, 
        avatarUrl, 
        email: user.email,
        provider: user.app_metadata?.provider
      });
      
      const { data: newProfile, error: insertError } = await supabase.from('user_profiles').insert({
        id: user.id,
        nickname: nickname,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).select().single();
      
      if (insertError) {
        console.error('❌ [Callback] Error creating profile:', insertError);
      } else {
        console.log('✅ [Callback] Profile created successfully:', newProfile);
      }
    } else {
      console.log('✅ [Callback] Profile already exists:', existingProfile);
    }
    
    console.log('✅ [Callback] Redirecting to home page...');
    
    // Redirigir a la página principal
    return NextResponse.redirect(new URL('/', requestUrl.origin));
    
  } catch (error) {
    console.error('❌ [Callback] Unexpected error:', error);
    return NextResponse.redirect(new URL(`/?error=unexpected&error_description=${error}`, requestUrl.origin));
  }
}
