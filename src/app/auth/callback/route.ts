import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
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
    
    // Intercambiar código por sesión
    await supabase.auth.exchangeCodeForSession(code);
    
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('User metadata:', JSON.stringify(user.user_metadata, null, 2));
      console.log('User identities:', JSON.stringify(user.identities, null, 2));
      
      // Verificar si ya existe un perfil
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Si no existe perfil, crearlo automáticamente
      if (!existingProfile) {
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
        
        console.log('Creating profile with:', { nickname, avatarUrl, email: user.email });
        
        const { error: insertError } = await supabase.from('user_profiles').insert({
          user_id: user.id,
          nickname: nickname,
          avatar_url: avatarUrl,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully');
        }
      } else {
        console.log('Profile already exists:', existingProfile);
      }
    }
  }

  // Redirigir a la página principal
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
