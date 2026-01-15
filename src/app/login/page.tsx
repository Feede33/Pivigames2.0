'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('🔐 [Login] Starting email/password login...', { email });

    try {
      // Primero intentamos iniciar sesión
      console.log('🔐 [Login] Attempting sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 [Login] Sign in response:', {
        hasData: !!signInData,
        hasSession: !!signInData?.session,
        hasUser: !!signInData?.user,
        error: signInError?.message
      });

      // Si el error es que el usuario no existe o credenciales inválidas, intentamos registrarlo
      if (signInError) {
        console.log('❌ [Login] Sign in failed, checking if we should register...');
        
        if (signInError.message.includes('Invalid login credentials') || 
            signInError.message.includes('Email not confirmed')) {
          
          console.log('🔐 [Login] Attempting sign up...');
          
          // Intentamos registrar al usuario
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
          });

          console.log('🔐 [Login] Sign up response:', {
            hasData: !!signUpData,
            hasSession: !!signUpData?.session,
            hasUser: !!signUpData?.user,
            error: signUpError?.message
          });

          if (signUpError) {
            console.error('❌ [Login] Sign up failed:', signUpError);
            throw signUpError;
          }

          // Registro exitoso
          console.log('✅ [Login] Sign up successful!');
          setError('');
          alert('¡Cuenta creada exitosamente! Por favor revisa tu email para confirmar tu cuenta.');
          return;
        }
        
        // Si es otro tipo de error, lo lanzamos
        console.error('❌ [Login] Other error:', signInError);
        throw signInError;
      }

      // Login exitoso
      console.log('✅ [Login] Sign in successful! Redirecting...');
      router.push('/');
    } catch (error: any) {
      console.error('❌ [Login] Error:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setIsLoading(true);
    setError('');

    console.log(`🔐 [Login] Starting ${provider} OAuth...`);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      console.log(`🔐 [Login] ${provider} OAuth response:`, { data, error });

      if (error) {
        console.error(`❌ [Login] ${provider} OAuth error:`, error);
        throw error;
      }
      
      console.log(`✅ [Login] ${provider} OAuth initiated successfully`);
    } catch (error: any) {
      console.error(`❌ [Login] ${provider} OAuth failed:`, error);
      setError(error.message || 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A0A]"
    >


      {/* Card de Login */}
      <Card className="w-full max-w-sm relative z-10 border-[#212121]/30 bg-[#171717] backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">
            Iniciar Sesión o Registrarse
          </CardTitle>
          <CardDescription className="text-center text-[#A1A1A1]">
            Ingresa tu email y contraseña. Si no tienes cuenta, se creará automáticamente.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleEmailLogin}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="p-3 text-sm rounded bg-red-500/20 border border-red-500/50 text-red-200">
                  {error}
                </div>
              )}

              <div className="grid gap-2 bg text-white">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#212121] border-[#424242]/30 text-white focus:ring-[#00ff88] focus:border-white"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between text-white">
                  <Label htmlFor="password">Contraseña</Label>
                  <a
                    href="#"
                    className="text-sm underline text-white hover:text-[#00ff88]/80"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#212121] border-[#424242]/30 text-white focus:ring-[#00ff88] focus:border-[#00ff88]"
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            type="submit"
            onClick={handleEmailLogin}
            disabled={isLoading}
            className="w-full bg-white text-[#171717] hover:bg-[#D1D1D1]/90 font-semibold"
          >
            {isLoading ? 'Procesando...' : 'Continuar'}
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#171717] text-[#6B6B6B] px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('discord')}
            disabled={isLoading}
            className="w-full relative overflow-hidden animate-fade-in animate-duration-1000 animate-delay-100 group border-2 border-[#5865F2] hover:border-[#4752C4] transition-all duration-300"
            style={{
              backgroundImage: 'url(/discordwallpaper/bannerdiscord.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay oscuro para contraste */}
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-300" />

            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

            {/* Logotipo de discord */}
            <svg
              className="w-5 h-5 mr-2 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white group-hover:scale-110 transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>

            {/* Texto */}
            <span className="relative z-10 font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:drop-shadow-[0_2px_12px_rgba(0,0,0,1)] transition-all duration-300">
              Continuar con Discord
            </span>
          </Button>

          <div className="text-center text-sm text-[#A1A1A1] mt-2">
            Al continuar, aceptas nuestros términos y condiciones
          </div>
        </CardFooter>
      </Card>

    </div>
  );
}
