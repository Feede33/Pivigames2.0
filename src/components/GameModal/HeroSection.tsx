import { Play, Download, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import WallpaperImage from '../WallpaperImage';
import type { GameWithSteamData } from '@/lib/supabase';
import type { Locale } from '@/lib/i18n';

const VideoPlayer = dynamic(() => import('../VideoPlayer'), { ssr: false });

type Props = {
  game: GameWithSteamData;
  loadingSteam: boolean;
  showTrailer: boolean;
  hasValidVideo: boolean;
  videoUrl: string;
  currentVideoIndex: number;
  screenSize: 'xs' | 'sm' | 'md' | 'lg';
  styles: any;
  t: any;
  onPlayTrailer: () => void;
  onCloseTrailer: () => void;
};

export default function HeroSection({
  game,
  loadingSteam,
  showTrailer,
  hasValidVideo,
  videoUrl,
  currentVideoIndex,
  screenSize,
  styles,
  t,
  onPlayTrailer,
  onCloseTrailer,
}: Props) {
  return (
    <>
      {/* Hero Image / Trailer */}
      <div style={styles.hero.height} className="relative overflow-hidden">
        {/* Skeleton para el trailer/wallpaper cuando está cargando */}
        {loadingSteam && !showTrailer && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 z-10">
              <div className="h-10 w-3/4 bg-gray-700 animate-pulse rounded mb-3" />
              <div className="flex gap-3">
                <div className="h-11 w-40 bg-gray-700 animate-pulse rounded-full" />
                <div className="h-11 w-32 bg-gray-700 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Wallpaper - siempre presente pero con fade */}
        {!loadingSteam && (
          <WallpaperImage
            src={game.wallpaper}
            alt={game.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              showTrailer ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent transition-opacity duration-500 ${
            showTrailer ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Video Player */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            showTrailer && hasValidVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {showTrailer && hasValidVideo && (
            <VideoPlayer key={`video-${currentVideoIndex}-${videoUrl}`} url={videoUrl} playing={showTrailer} />
          )}
        </div>

        {/* Mensaje de error si no hay video válido */}
        {showTrailer && !hasValidVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white">
              <p className="text-xl mb-2">No hay trailer disponible</p>
              <p className="text-sm text-gray-400">Este juego no tiene un video de trailer</p>
            </div>
          </div>
        )}

        {/* Título y botones sobre el wallpaper */}
        {!loadingSteam && (
          <div
            className="absolute z-10 transition-all duration-500"
            style={{
              ...styles.hero.buttonContainer,
              ...(showTrailer
                ? { opacity: 0, transform: 'translateY(1rem)', pointerEvents: 'none' }
                : { opacity: 1, transform: 'translateY(0)' }),
            }}
          >
            <h2 style={{ ...styles.hero.title, ...styles.hero.titleMargin }} className="font-bold text-white line-clamp-2 drop-shadow-lg">
              {game.title}
            </h2>
            <div style={styles.hero.buttonGap} className="flex flex-wrap">
              {game.links ? (
                <a
                  href={game.links}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.hero.button, ...styles.hero.buttonGap }}
                  className="rounded-full bg-white text-black border-none font-bold cursor-pointer flex items-center hover:bg-gray-200 transition-colors shadow-lg"
                >
                  <Download style={styles.hero.buttonIcon} />
                  <span>{screenSize === 'xs' ? 'Download' : t.modal.downloadFree}</span>
                </a>
              ) : (
                <a
                  href={`https://store.steampowered.com/app/${game.steam_appid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.hero.button, ...styles.hero.buttonGap }}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none font-bold cursor-pointer flex items-center hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  <svg style={styles.hero.buttonIcon} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2m0-2a12 12 0 0 0-12 12 12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.5 14.5-5-2.5V9l5 2.5v3z" />
                  </svg>
                  <span>{screenSize === 'xs' ? 'Steam' : t.modal.viewOnSteam}</span>
                </a>
              )}
              {(hasValidVideo || game.trailer) && (
                <button
                  onClick={onPlayTrailer}
                  style={{ ...styles.hero.button, ...styles.hero.buttonGap }}
                  className="rounded-full bg-gray-500/70 text-white border-none font-bold cursor-pointer flex items-center hover:bg-gray-500/90 transition-colors shadow-lg"
                >
                  <Play style={styles.hero.buttonIcon} />
                  <span>{screenSize === 'xs' ? 'Play' : t.modal.trailer}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Título y botones cuando el trailer está activo */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          showTrailer ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 md:px-6 py-3 md:py-4 bg-[#181818]">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 line-clamp-2">{game.title}</h2>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            {game.links ? (
              <a
                href={game.links}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-2.5 rounded-full bg-white text-black border-none font-bold text-[15px] cursor-pointer flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Download className="w-[18px] h-[18px]" />
                {t.modal.downloadFree}
              </a>
            ) : (
              <a
                href={`https://store.steampowered.com/app/${game.steam_appid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none font-bold text-[15px] cursor-pointer flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2m0-2a12 12 0 0 0-12 12 12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.5 14.5-5-2.5V9l5 2.5v3z" />
                </svg>
                {t.modal.viewOnSteam}
              </a>
            )}
            {(hasValidVideo || game.trailer) && (
              <button
                onClick={onCloseTrailer}
                className="px-4 md:px-7 py-2 md:py-2.5 rounded-full bg-red-600 text-white border-none font-bold text-sm md:text-[15px] cursor-pointer flex items-center gap-2 hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                <span className="hidden sm:inline">{t.modal.closeTrailer}</span>
                <span className="sm:hidden">Close</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
