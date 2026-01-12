'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react';

type UserProfileProps = {
  navOnly?: boolean; // Nueva prop para mostrar solo en nav
};

export default function UserProfile({ navOnly = false }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signInWithDiscord, signOut } = useAuth();

  // Si está cargando, no mostrar nada
  if (loading) {
    return null;
  }

  // Si no hay usuario, mostrar botón de login compacto
  if (!user) {
    return (
      <div className="flex z-50">
        <button
          onClick={signInWithDiscord}
          className="group flex items-center gap-2 md:gap-3 bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 md:px-4 py-1.5 md:py-2 hover:bg-accent transition-all duration-300 shadow-lg w-full justify-center"
        >
          {/* Discord Icon */}
          <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="text-xs md:text-sm font-semibold">Login con Discord</span>
        </button>
      </div>
    );
  }

  // Usuario logueado
  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  const username = user.user_metadata?.custom_claims?.global_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario';

  // Si es navOnly, solo mostrar el avatar con dropdown
  if (navOnly) {
    return (
      <div className="relative group z-50">
        <button className="relative">
          <div className="h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors">
            <img
              src={avatarUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Indicador de estado online */}
          <div className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border-2 border-background" />
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-[280px] md:w-[340px] bg-[#111214] rounded-2xl shadow-2xl overflow-hidden border border-[#1e1f22] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {/* Header con gradiente azul Discord */}
          <div className="relative h-[100px] md:h-[120px] bg-gradient-to-br from-[#5865f2] to-[#7289da] overflow-hidden">
            {/* Patrón de fondo opcional */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            
            {/* Avatar grande */}
            <div className="absolute -bottom-10 md:-bottom-12 left-4">
              <div className="relative">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-[6px] border-[#111214] bg-[#111214]">
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Status badge */}
                <div className="absolute bottom-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-[#3ba55d] rounded-full border-[4px] border-[#111214] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div className="pt-14 md:pt-16 px-4 pb-4">
            {/* Nombre de usuario */}
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white mb-0.5">{username}</h2>
              <p className="text-xs md:text-sm text-[#b5bac1]">{user.user_metadata?.username || 'user1111'}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#3f4147] mb-3"></div>

            {/* Opciones del menú */}
            <div className="space-y-1">
              {/* Editar perfil */}
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#404249] transition-colors group">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#b5bac1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="text-xs md:text-sm font-medium text-[#dbdee1]">Editar perfil</span>
                </div>
                <span className="text-[10px] md:text-xs font-bold text-white bg-[#5865f2] px-2 py-0.5 rounded">NUEVO</span>
              </button>

              {/* Copiar ID del usuario */}
              <button 
                onClick={() => navigator.clipboard.writeText(user.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#404249] transition-colors group"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#b5bac1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs md:text-sm font-medium text-[#dbdee1]">Copiar ID del usuario</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#3f4147] my-3"></div>

            {/* Cerrar sesión */}
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#da373c] transition-colors group"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#f23f43] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs md:text-sm font-medium text-[#f23f43] group-hover:text-white transition-colors">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Versión completa (bottom left) - sin cambios
  return (
    <div className="fixed bottom-4 md:bottom-8 left-4 md:left-12 z-50">
      <div className="w-48 md:w-64 bg-background/95 backdrop-blur-sm border-t border-r border-border rounded-full shadow-xl">
        <div className="flex items-center justify-between p-1.5 md:p-2 gap-1 md:gap-2">
          {/* Avatar y Info del Usuario */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
            <div className="relative">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-border">
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Indicador de estado online */}
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold truncate">{username}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground truncate">Online</p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 md:p-1.5 hover:bg-accent rounded transition-colors"
              title="User Settings"
            >
              <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal estilo Discord */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Menu Modal */}
          <div className="absolute bottom-16 md:bottom-20 left-0 z-50 w-[280px] md:w-[340px] bg-[#111214] rounded-2xl shadow-2xl overflow-hidden border border-[#1e1f22]">
            {/* Header con gradiente azul Discord */}
            <div className="relative h-[100px] md:h-[120px] bg-gradient-to-br from-[#5865f2] to-[#7289da] overflow-hidden">
              {/* Patrón de fondo opcional */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              </div>
              
              {/* Avatar grande */}
              <div className="absolute -bottom-10 md:-bottom-12 left-4">
                <div className="relative">
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-[6px] border-[#111214] bg-[#111214]">
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Status badge */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-[#3ba55d] rounded-full border-[4px] border-[#111214] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del perfil */}
            <div className="pt-14 md:pt-16 px-4 pb-4">
              {/* Nombre de usuario */}
              <div className="mb-4">
                <h2 className="text-lg md:text-xl font-bold text-white mb-0.5">{username}</h2>
                <p className="text-xs md:text-sm text-[#b5bac1]">{user.user_metadata?.username || 'user1111'}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#3f4147] mb-3"></div>

              {/* Opciones del menú */}
              <div className="space-y-1">
                {/* Editar perfil */}
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#404249] transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#b5bac1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-xs md:text-sm font-medium text-[#dbdee1]">Editar perfil</span>
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-white bg-[#5865f2] px-2 py-0.5 rounded">NUEVO</span>
                </button>

                {/* Invisible */}
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#404249] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-[#b5bac1] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#b5bac1] rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-medium text-[#dbdee1]">Invisible</span>
                      <div className="w-4 h-4 md:w-5 md:h-5 bg-[#f0b232] rounded-full flex items-center justify-center">
                        <span className="text-[10px] md:text-xs font-bold text-[#111214]">!</span>
                      </div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#b5bac1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#3f4147] my-3"></div>

              {/* Más opciones */}
              <div className="space-y-1">
                {/* Cambiar de cuenta */}
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#404249] transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#b5bac1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs md:text-sm font-medium text-[#dbdee1]">Cambiar de cuenta</span>
                  </div>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#b5bac1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Copiar ID del usuario */}
                <button 
                  onClick={() => navigator.clipboard.writeText(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#404249] transition-colors group"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#b5bac1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs md:text-sm font-medium text-[#dbdee1]">Copiar ID del usuario</span>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#3f4147] my-3"></div>

              {/* Cerrar sesión */}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#da373c] transition-colors group"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#f23f43] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs md:text-sm font-medium text-[#f23f43] group-hover:text-white transition-colors">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
