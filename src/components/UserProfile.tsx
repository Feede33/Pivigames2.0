'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react';

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signInWithDiscord, signOut } = useAuth();

  // Si está cargando, no mostrar nada
  if (loading) {
    return null;
  }

  // Si no hay usuario, mostrar botón de login compacto
  if (!user) {
    return (
      <div className="fixed bottom-8 left-12 z-50">
        <button
          onClick={signInWithDiscord}
          className="group flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 hover:bg-accent transition-all duration-300 shadow-lg"
        >
          {/* Discord Icon */}
          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="text-sm font-semibold">Login con Discord</span>
        </button>
      </div>
    );
  }

  // Usuario logueado - estilo Discord horizontal
  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  const username = user.user_metadata?.custom_claims?.global_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario';

  return (
    <div className="fixed bottom-8 left-12 z-50">
      <div className="w-64 bg-background/95 backdrop-blur-sm border-t border-r border-border rounded-full shadow-xl">
        <div className="flex items-center justify-between p-2 gap-2">
          {/* Avatar y Info del Usuario */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-border">
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Indicador de estado online */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{username}</p>
              <p className="text-xs text-muted-foreground truncate">Online</p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 hover:bg-accent rounded transition-colors"
              title="User Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Menu */}
          <div className="absolute bottom-16 left-0 z-50 w-64 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-border">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{username}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 group text-sm">
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Mi Perfil</span>
              </button>

              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 group text-sm">
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Favoritos</span>
              </button>

              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 group text-sm">
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Historial</span>
              </button>

              <div className="my-2 border-t border-border"></div>

              <button
                onClick={signOut}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2 group text-red-400 hover:text-red-300 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
