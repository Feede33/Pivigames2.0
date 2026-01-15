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
      // Verificar si ya existe un perfil
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Si no existe perfil, crearlo automáticamente
      if (!existingProfile) {
        const nickname = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'Usuario';
        
        const avatarUrl = user.user_metadata?.avatar_url || 
                         user.user_metadata?.picture || 
                         `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
        
        await supabase.from('user_profiles').insert({
          user_id: user.id,
          nickname: nickname,
          avatar_url: avatarUrl,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
  }

  // Redirigir a la página principal
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
