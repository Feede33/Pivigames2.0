'use client';

import { useRouter } from 'next/navigation';

export default function FuturisticLoginButton() {
  const router = useRouter();

  return (
    <>
      {/* Partículas de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-[3px] h-[3px] bg-[#00ff88] rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Botón de Login */}
      <div className="relative z-10">
        <button
          onClick={() => router.push('/login')}
          className="login-btn relative px-12 py-5 text-2xl font-bold text-[#00ff88] uppercase tracking-[3px] bg-transparent border-[3px] border-[#00ff88] cursor-pointer overflow-hidden transition-all duration-300 hover:text-[#0a0e27] hover:shadow-[0_0_40px_rgba(0,255,136,0.6),0_0_60px_rgba(0,255,136,0.4),inset_0_0_30px_rgba(0,255,136,0.2)] active:scale-95"
          style={{
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1)',
          }}
        >
          {/* Efecto de brillo deslizante */}
          <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-[rgba(0,255,136,0.3)] to-transparent transition-all duration-500 hover:left-[100%]" />
          
          {/* Fondo de hover */}
          <span className="absolute top-0 left-0 w-full h-full bg-[#00ff88] scale-x-0 origin-left transition-transform duration-300 -z-10 hover:scale-x-100" />
          
          {/* Esquinas decorativas */}
          <span className="corner corner-tl absolute w-5 h-5 border-2 border-[#ff0088] border-r-0 border-b-0 -top-[10px] -left-[10px]" />
          <span className="corner corner-tr absolute w-5 h-5 border-2 border-[#ff0088] border-l-0 border-b-0 -top-[10px] -right-[10px]" />
          <span className="corner corner-bl absolute w-5 h-5 border-2 border-[#ff0088] border-r-0 border-t-0 -bottom-[10px] -left-[10px]" />
          <span className="corner corner-br absolute w-5 h-5 border-2 border-[#ff0088] border-l-0 border-t-0 -bottom-[10px] -right-[10px]" />
          
          {/* Línea de escaneo */}
          <span className="scan-line absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent top-0 opacity-50" />
          
          Login
        </button>
        
        <p className="text-center mt-5 text-[#00ff88] text-xs tracking-[2px] opacity-70 uppercase">
          Access Granted
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          50% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0.3;
          }
          90% {
            opacity: 0.5;
          }
        }

        .particle {
          animation: float 8s infinite ease-in-out;
        }

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
    </>
  );
}
