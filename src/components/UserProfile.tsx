'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react';

type UserProfileProps = {
  navOnly?: boolean;
};

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg';

export default function UserProfile({ navOnly = false }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>('md');
  const { user, loading, signInWithDiscord, signOut } = useAuth();

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      // iPhone SE (1st gen): 320px
      // iPhone SE (2nd/3rd gen), iPhone 12/13 mini: 375px
      // iPhone 12/13/14/15 Pro: 390px
      // iPhone 12/13/14/15 Plus/Pro Max: 428px
      if (width <= 375) setScreenSize('xs' as ScreenSize); // iPhone SE y mini
      else if (width <= 430) setScreenSize('sm' as ScreenSize); // iPhone estándar y Plus
      else if (width < 768) setScreenSize('md' as ScreenSize); // Tablets pequeñas
      else setScreenSize('lg' as ScreenSize); // Desktop
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getResponsiveStyles = () => {
    const styles = {
      xs: { // iPhone SE, mini (≤375px)
        button: {
          padding: '6px 10px',
          gap: '6px',
          minHeight: '32px',
          minWidth: '140px'
        },
        icon: { width: '16px', height: '16px' },
        text: { fontSize: '10px' },
        avatar: {
          size: '32px',
          statusDot: '8px',
          statusDotBorder: '2px'
        },
        dropdown: {
          width: '280px',
          headerHeight: '90px',
          avatarSize: '64px',
          avatarBottom: '-32px'
        }
      },
      sm: { // iPhone estándar, Plus (376-430px)
        button: {
          padding: '7px 12px',
          gap: '7px',
          minHeight: '36px',
          minWidth: '150px'
        },
        icon: { width: '18px', height: '18px' },
        text: { fontSize: '11px' },
        avatar: {
          size: '36px',
          statusDot: '10px',
          statusDotBorder: '2px'
        },
        dropdown: {
          width: '300px',
          headerHeight: '100px',
          avatarSize: '72px',
          avatarBottom: '-36px'
        }
      },
      md: { // Tablets (431-767px)
        button: {
          padding: '8px 14px',
          gap: '8px',
          minHeight: '38px',
          minWidth: '160px'
        },
        icon: { width: '18px', height: '18px' },
        text: { fontSize: '13px' },
        avatar: {
          size: '38px',
          statusDot: '10px',
          statusDotBorder: '2px'
        },
        dropdown: {
          width: '320px',
          headerHeight: '110px',
          avatarSize: '80px',
          avatarBottom: '-40px'
        }
      },
      lg: { // Desktop (≥768px)
        button: {
          padding: '8px 16px',
          gap: '8px',
          minHeight: '40px',
          minWidth: '170px'
        },
        icon: { width: '20px', height: '20px' },
        text: { fontSize: '14px' },
        avatar: {
          size: '40px',
          statusDot: '12px',
          statusDotBorder: '2px'
        },
        dropdown: {
          width: '340px',
          headerHeight: '120px',
          avatarSize: '96px',
          avatarBottom: '-48px'
        }
      }
    };
    return styles[screenSize];
  };

  const styles = getResponsiveStyles();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex z-50">
        <button
          onClick={signInWithDiscord}
          style={{
            padding: styles.button.padding,
            gap: styles.button.gap,
            minHeight: styles.button.minHeight,
            minWidth: styles.button.minWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="group bg-background/95 backdrop-blur-sm border border-border rounded-full hover:bg-accent transition-all duration-300 shadow-lg"
        >
          <svg
            style={{
              width: styles.icon.width,
              height: styles.icon.height
            }}
            className="text-indigo-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span
            style={{ fontSize: styles.text.fontSize }}
            className="font-semibold whitespace-nowrap"
          >
            Login con Discord
          </span>
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
        {/* Mobile: Solo avatar */}
        <button 
          className="relative md:hidden"
          style={{
            width: styles.avatar.size,
            height: styles.avatar.size
          }}
        >
          <div 
            style={{
              width: styles.avatar.size,
              height: styles.avatar.size
            }}
            className="rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors"
          >
            <img
              src={avatarUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Indicador de estado online */}
          <div 
            style={{
              width: styles.avatar.statusDot,
              height: styles.avatar.statusDot,
              borderWidth: styles.avatar.statusDotBorder
            }}
            className="absolute bottom-0 right-0 bg-green-500 rounded-full border-background"
          />
        </button>

        {/* Desktop: Versión completa horizontal */}
        <button 
          style={{
            padding: '6px 12px',
            gap: '8px'
          }}
          className="hidden md:flex items-center bg-background/95 backdrop-blur-sm border border-border rounded-full hover:bg-accent transition-all duration-300 shadow-lg"
        >
          <div className="relative">
            <div 
              style={{
                width: styles.avatar.size,
                height: styles.avatar.size
              }}
              className="rounded-full overflow-hidden border-2 border-border"
            >
              <img
                src={avatarUrl}
                alt={username}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Indicador de estado online */}
            <div 
              style={{
                width: styles.avatar.statusDot,
                height: styles.avatar.statusDot,
                borderWidth: styles.avatar.statusDotBorder
              }}
              className="absolute bottom-0 right-0 bg-green-500 rounded-full border-background"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p 
              style={{ fontSize: styles.text.fontSize }}
              className="font-semibold truncate"
            >
              {username}
            </p>
            <p 
              style={{ fontSize: `${parseFloat(styles.text.fontSize) * 0.85}px` }}
              className="text-muted-foreground truncate"
            >
              Online
            </p>
          </div>
        </button>

        {/* Dropdown Menu */}
        <div 
          style={{
            width: styles.dropdown.width
          }}
          className="absolute right-0 mt-2 bg-[#111214] rounded-2xl shadow-2xl overflow-hidden border border-[#1e1f22] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
        >
          {/* Header con gradiente azul Discord */}
          <div 
            style={{
              height: styles.dropdown.headerHeight
            }}
            className="relative bg-gradient-to-br from-[#5865f2] to-[#7289da] overflow-hidden"
          >
            {/* Patrón de fondo opcional */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Avatar grande */}
            <div 
              style={{
                bottom: styles.dropdown.avatarBottom,
                left: screenSize === 'xs' ? '12px' : '16px'
              }}
              className="absolute"
            >
              <div className="relative">
                <div 
                  style={{
                    width: styles.dropdown.avatarSize,
                    height: styles.dropdown.avatarSize,
                    borderWidth: screenSize === 'xs' ? '4px' : '6px'
                  }}
                  className="rounded-full overflow-hidden border-[#111214] bg-[#111214]"
                >
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Status badge */}
                <div 
                  style={{
                    width: screenSize === 'xs' ? '18px' : screenSize === 'sm' ? '20px' : '24px',
                    height: screenSize === 'xs' ? '18px' : screenSize === 'sm' ? '20px' : '24px',
                    borderWidth: screenSize === 'xs' ? '3px' : '4px'
                  }}
                  className="absolute bottom-1 right-1 bg-[#3ba55d] rounded-full border-[#111214] flex items-center justify-center"
                >
                  <div 
                    style={{
                      width: screenSize === 'xs' ? '6px' : '8px',
                      height: screenSize === 'xs' ? '6px' : '8px'
                    }}
                    className="bg-white rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div 
            style={{
              paddingTop: screenSize === 'xs' ? '40px' : screenSize === 'sm' ? '44px' : screenSize === 'md' ? '48px' : '64px'
            }}
            className="px-3 md:px-4 pb-3 md:pb-4"
          >
            {/* Nombre de usuario */}
            <div className="mb-3 md:mb-4">
              <h2 
                style={{
                  fontSize: screenSize === 'xs' ? '16px' : screenSize === 'sm' ? '18px' : '20px'
                }}
                className="font-bold text-white mb-0.5"
              >
                {username}
              </h2>
              <p 
                style={{
                  fontSize: screenSize === 'xs' ? '11px' : '13px'
                }}
                className="text-[#b5bac1]"
              >
                {user.user_metadata?.username || 'user1111'}
              </p>
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
