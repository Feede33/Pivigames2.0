'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener el hash de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Establecer la sesión con los tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            router.push('/?error=auth_failed');
            return;
          }

          console.log('Session established successfully');
        }

        // Redirigir a la página principal
        router.push('/');
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/?error=auth_failed');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-white text-lg">Iniciando sesión con Discord...</p>
        <p className="text-muted-foreground text-sm mt-2">Serás redirigido en un momento</p>
      </div>
    </div>
  );
}
