'use client';

import Link from 'next/link';

// Versión compacta del botón para usar en navegación (desktop)
export function FuturisticLoginButtonCompact() {
  return (
    <Link
      href="/login"
      className="relative group px-3 py-1.5 text-xs font-bold text-[#00ff88] uppercase tracking-wide bg-transparent border-2 border-[#00ff88] rounded-md overflow-hidden transition-all duration-300 hover:text-[#0a0e27] hover:shadow-[0_0_20px_rgba(0,255,136,0.6)] active:scale-95 items-center gap-1.5 hidden md:flex"
      style={{
        boxShadow: '0 0 10px rgba(0, 255, 136, 0.3), inset 0 0 10px rgba(0, 255, 136, 0.1)',
      }}
    >
      {/* Fondo de hover */}
      <span className="absolute top-0 left-0 w-full h-full bg-[#00ff88] scale-x-0 origin-left transition-transform duration-300 -z-10 group-hover:scale-x-100" />
      
      {/* Esquinas decorativas pequeñas */}
      <span className="absolute w-1.5 h-1.5 border border-[#ff0088] border-r-0 border-b-0 -top-[2px] -left-[2px] group-hover:animate-pulse" />
      <span className="absolute w-1.5 h-1.5 border border-[#ff0088] border-l-0 border-b-0 -top-[2px] -right-[2px] group-hover:animate-pulse" />
      <span className="absolute w-1.5 h-1.5 border border-[#ff0088] border-r-0 border-t-0 -bottom-[2px] -left-[2px] group-hover:animate-pulse" />
      <span className="absolute w-1.5 h-1.5 border border-[#ff0088] border-l-0 border-t-0 -bottom-[2px] -right-[2px] group-hover:animate-pulse" />
      
      <svg className="w-3.5 h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      <span className="relative z-10">Login</span>
    </Link>
  );
}

// Versión para menú móvil (dentro del hamburger)
export function FuturisticLoginButtonMobile({ onClickAction }: { onClickAction?: () => void }) {
  return (
    <Link
      href="/login"
      onClick={onClickAction}
      className="relative group w-full px-4 py-3 text-sm font-bold text-[#00ff88] uppercase tracking-wide bg-transparent border-2 border-[#00ff88] rounded-lg overflow-hidden transition-all duration-300 hover:text-[#0a0e27] hover:shadow-[0_0_20px_rgba(0,255,136,0.6)] active:scale-95 flex items-center justify-center gap-2"
      style={{
        boxShadow: '0 0 10px rgba(0, 255, 136, 0.3), inset 0 0 10px rgba(0, 255, 136, 0.1)',
      }}
    >
      {/* Fondo de hover */}
      <span className="absolute top-0 left-0 w-full h-full bg-[#00ff88] scale-x-0 origin-left transition-transform duration-300 -z-10 group-hover:scale-x-100" />
      
      {/* Esquinas decorativas */}
      <span className="absolute w-2 h-2 border border-[#ff0088] border-r-0 border-b-0 -top-[3px] -left-[3px] group-hover:animate-pulse" />
      <span className="absolute w-2 h-2 border border-[#ff0088] border-l-0 border-b-0 -top-[3px] -right-[3px] group-hover:animate-pulse" />
      <span className="absolute w-2 h-2 border border-[#ff0088] border-r-0 border-t-0 -bottom-[3px] -left-[3px] group-hover:animate-pulse" />
      <span className="absolute w-2 h-2 border border-[#ff0088] border-l-0 border-t-0 -bottom-[3px] -right-[3px] group-hover:animate-pulse" />
      
      <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      <span className="relative z-10">Login</span>
    </Link>
  );
}

// Versión completa para la página de login (no se usa actualmente)
export default function FuturisticLoginButton() {
  return (
    <div className="relative inline-block">
      <Link
        href="/login"
        className="login-btn relative inline-block px-12 py-5 text-2xl font-bold text-[#00ff88] uppercase tracking-[3px] bg-transparent border-[3px] border-[#00ff88] cursor-pointer overflow-hidden transition-all duration-300 hover:text-[#0a0e27] hover:shadow-[0_0_40px_rgba(0,255,136,0.6),0_0_60px_rgba(0,255,136,0.4),inset_0_0_30px_rgba(0,255,136,0.2)] active:scale-95"
        style={{
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1)',
        }}
      >
        {/* Fondo de hover */}
        <span className="absolute top-0 left-0 w-full h-full bg-[#00ff88] scale-x-0 origin-left transition-transform duration-300 -z-10 group-hover:scale-x-100" />
        
        {/* Esquinas decorativas */}
        <span className="corner absolute w-5 h-5 border-2 border-[#ff0088] border-r-0 border-b-0 -top-[10px] -left-[10px]" />
        <span className="corner absolute w-5 h-5 border-2 border-[#ff0088] border-l-0 border-b-0 -top-[10px] -right-[10px]" />
        <span className="corner absolute w-5 h-5 border-2 border-[#ff0088] border-r-0 border-t-0 -bottom-[10px] -left-[10px]" />
        <span className="corner absolute w-5 h-5 border-2 border-[#ff0088] border-l-0 border-t-0 -bottom-[10px] -right-[10px]" />
        
        {/* Línea de escaneo */}
        <span className="scan-line absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent top-0 opacity-50" />
        
        <span className="relative z-10">Login</span>
      </Link>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .login-btn:hover .corner {
          animation: pulse 1s infinite;
        }

        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }

        .scan-line {
          animation: scan 3s infinite linear;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .login-btn:hover::before {
          left: 100%;
        }

        .login-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #00ff88;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          z-index: -1;
        }

        .login-btn:hover::after {
          transform: scaleX(1);
        }
      `}</style>
    </div>
  );
}
