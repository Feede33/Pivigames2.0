'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X, Play, ChevronLeft, ChevronRight, Download, Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { GameWithSteamData } from '@/lib/supabase';
import { MapPinCheck } from 'lucide-react';
import Snowfall from 'react-snowfall';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';
import WallpaperImage from './WallpaperImage';
import { proxySteamImage } from '@/lib/image-proxy';
import { useTranslations, type Locale } from '@/lib/i18n';
import { getSteamLanguage } from '@/lib/steam-languages';


const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg';

// Hook para detectar el tamaño de pantalla
const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 475) setScreenSize('xs');
      else if (width < 640) setScreenSize('sm');
      else if (width < 1280) setScreenSize('md'); // Aumentado de 1024 a 1280
      else setScreenSize('lg');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Función para obtener estilos responsive
const getResponsiveStyles = (screenSize: ScreenSize) => {
  const styles = {
    xs: {
      modal: {
        container: 'w-full mx-3 min-h-[65vh]',
        closeButton: 'w-8 h-8',
        closeIcon: 'w-4 h-4',
      },
      hero: {
        height: 'h-[200px]',
        title: 'text-lg',
        titleMargin: 'mb-2',
        buttonContainer: 'bottom-2 left-3 right-3',
        button: 'px-3 py-1.5 text-xs',
        buttonIcon: 'w-3.5 h-3.5',
        buttonGap: 'gap-1.5',
      },
      content: {
        padding: 'p-3',
        gap: 'gap-1.5',
        spacing: 'mb-2.5',
        spacingLarge: 'mb-3',
      },
      text: {
        xs: 'text-[10px]',
        sm: 'text-xs',
        base: 'text-sm',
        heading: 'text-xs',
      },
      grid: {
        features: 'grid-cols-1 gap-1.5',
        requirements: 'grid-cols-1 gap-3',
        main: 'grid-cols-1 gap-4',
      },
      sidebar: {
        spacing: 'space-y-3',
        priceCard: 'rounded-xl p-3',
        priceTitle: 'text-[9px]',
        priceAmount: 'text-xl',
        priceDiscount: 'text-[10px]',
        info: 'text-[10px]',
        tag: 'px-1 py-0.5 text-[9px]',
        button: 'px-1.5 py-0.5 text-[10px]',
      },
      viewer: {
        padding: 'p-1',
        closeButton: 'top-2 right-2 w-7 h-7',
        closeIcon: 'w-4 h-4',
        counter: 'top-2 left-2 text-[10px]',
        image: 'max-w-[98vw] max-h-[75vh]',
        arrow: 'w-7 h-7',
        arrowIcon: 'w-4 h-4',
        arrowLeft: 'left-1',
        arrowRight: 'right-1',
        thumbnails: 'bottom-2 gap-1',
        thumbnail: 'w-10 h-7',
      },
      widget: {
        container: 'mt-3 px-2',
        skeleton: 'h-[140px]',
        scale: 'scale-75',
      },
    },
    sm: {
      modal: {
        container: 'w-full mx-4 min-h-[70vh]',
        closeButton: 'w-9 h-9',
        closeIcon: 'w-5 h-5',
      },
      hero: {
        height: 'h-[250px]',
        title: 'text-xl',
        titleMargin: 'mb-2',
        buttonContainer: 'bottom-3 left-4 right-4',
        button: 'px-4 py-2 text-sm',
        buttonIcon: 'w-4 h-4',
        buttonGap: 'gap-2',
      },
      content: {
        padding: 'p-4',
        gap: 'gap-2',
        spacing: 'mb-3',
        spacingLarge: 'mb-4',
      },
      text: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        heading: 'text-sm',
      },
      grid: {
        features: 'grid-cols-2 gap-2',
        requirements: 'grid-cols-1 gap-4',
        main: 'grid-cols-1 gap-5',
      },
      sidebar: {
        spacing: 'space-y-4',
        priceCard: 'rounded-2xl p-4',
        priceTitle: 'text-[10px]',
        priceAmount: 'text-2xl',
        priceDiscount: 'text-xs',
        info: 'text-xs',
        tag: 'px-1.5 py-0.5 text-[10px]',
        button: 'px-2 py-1 text-xs',
      },
      viewer: {
        padding: 'p-2',
        closeButton: 'top-3 right-3 w-8 h-8',
        closeIcon: 'w-5 h-5',
        counter: 'top-3 left-3 text-xs',
        image: 'max-w-[95vw] max-h-[80vh]',
        arrow: 'w-9 h-9',
        arrowIcon: 'w-5 h-5',
        arrowLeft: 'left-2',
        arrowRight: 'right-2',
        thumbnails: 'bottom-3 gap-1.5',
        thumbnail: 'w-12 h-8',
      },
      widget: {
        container: 'mt-4 px-3',
        skeleton: 'h-[160px]',
        scale: 'scale-90',
      },
    },
    md: {
      modal: {
        container: 'w-[90vw] mx-0 min-h-[80vh]',
        closeButton: 'w-10 h-10',
        closeIcon: 'w-6 h-6',
      },
      hero: {
        height: 'h-[350px]',
        title: 'text-3xl',
        titleMargin: 'mb-3',
        buttonContainer: 'bottom-5 left-6 right-6',
        button: 'px-7 py-2.5 text-[15px]',
        buttonIcon: 'w-[18px] h-[18px]',
        buttonGap: 'gap-2',
      },
      content: {
        padding: 'p-6',
        gap: 'gap-3',
        spacing: 'mb-4',
        spacingLarge: 'mb-6',
      },
      text: {
        xs: 'text-sm',
        sm: 'text-base',
        base: 'text-lg',
        heading: 'text-base',
      },
      grid: {
        features: 'grid-cols-2 gap-3',
        requirements: 'grid-cols-2 gap-8',
        main: 'grid-cols-[2fr_1fr] gap-7',
      },
      sidebar: {
        spacing: 'space-y-6',
        priceCard: 'rounded-3xl p-7',
        priceTitle: 'text-xs',
        priceAmount: 'text-3xl',
        priceDiscount: 'text-sm',
        info: 'text-sm',
        tag: 'px-2 py-1 text-xs',
        button: 'px-3 py-1.5 text-sm',
      },
      viewer: {
        padding: 'p-4',
        closeButton: 'top-4 right-4 w-10 h-10',
        closeIcon: 'w-6 h-6',
        counter: 'top-4 left-4 text-sm',
        image: 'max-w-[90vw] max-h-[85vh]',
        arrow: 'w-12 h-12',
        arrowIcon: 'w-8 h-8',
        arrowLeft: 'left-4',
        arrowRight: 'right-4',
        thumbnails: 'bottom-4 gap-2',
        thumbnail: 'w-16 h-10',
      },
      widget: {
        container: 'mt-7 px-6',
        skeleton: 'h-[190px]',
        scale: 'scale-100',
      },
    },
    lg: {
      modal: {
        container: 'w-[1100px] max-w-[1100px] mx-0 min-h-[600px]',
        closeButton: 'w-10 h-10',
        closeIcon: 'w-6 h-6',
      },
      hero: {
        height: 'h-[380px]',
        title: 'text-4xl',
        titleMargin: 'mb-3',
        buttonContainer: 'bottom-5 left-6 right-6',
        button: 'px-7 py-2.5 text-[15px]',
        buttonIcon: 'w-[18px] h-[18px]',
        buttonGap: 'gap-2',
      },
      content: {
        padding: 'p-6',
        gap: 'gap-3',
        spacing: 'mb-4',
        spacingLarge: 'mb-6',
      },
      text: {
        xs: 'text-sm',
        sm: 'text-base',
        base: 'text-lg',
        heading: 'text-base',
      },
      grid: {
        features: 'grid-cols-2 gap-3',
        requirements: 'grid-cols-2 gap-8',
        main: 'grid-cols-[2fr_1fr] gap-8',
      },
      sidebar: {
        spacing: 'space-y-6',
        priceCard: 'rounded-3xl p-8',
        priceTitle: 'text-xs',
        priceAmount: 'text-3xl',
        priceDiscount: 'text-sm',
        info: 'text-sm',
        tag: 'px-2 py-1 text-xs',
        button: 'px-3 py-1.5 text-sm',
      },
      viewer: {
        padding: 'p-4',
        closeButton: 'top-4 right-4 w-10 h-10',
        closeIcon: 'w-6 h-6',
        counter: 'top-4 left-4 text-sm',
        image: 'max-w-[90vw] max-h-[85vh]',
        arrow: 'w-12 h-12',
        arrowIcon: 'w-8 h-8',
        arrowLeft: 'left-4',
        arrowRight: 'right-4',
        thumbnails: 'bottom-4 gap-2',
        thumbnail: 'w-16 h-10',
      },
      widget: {
        container: 'mt-8 px-6',
        skeleton: 'h-[190px]',
        scale: 'scale-100',
      },
    },
  };

  return styles[screenSize] || styles.md;
};

type SteamData = {
  screenshots: Array<{ id: number; thumbnail: string; full: string }>;
  videos: Array<{
    id: number;
    name: string;
    thumbnail: string;
    webm: { 480?: string; max?: string };
    mp4: { 480?: string; max?: string };
  }>;
  genres: string[];
  categories: string[];
  languages: string[];
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  developers: string[];
  publishers: string[];
  release_date: string | null;
  release_year: number | null;
  metacritic: number | null;
  required_age: number;
  short_description: string | null;
  detailed_description: string | null;
  pc_requirements: {
    minimum: string | null;
    recommended: string | null;
  };
  price: string | null;
  price_info: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string | null;
    final_formatted: string | null;
  } | null;
  current_price: string | null;
  lowest_recorded_price: string | null;
  is_free: boolean;
  steam_appid: number;
};

type Props = {
  game: GameWithSteamData | null;
  origin?: { x: number; y: number; width: number; height: number } | null;
  onCloseAction: () => void;
  locale?: string; // Agregar locale como prop opcional
};

export default function GameModal({ game, onCloseAction, locale = 'es' }: Props) {
  const t = useTranslations(locale as Locale);
  const screenSize = useScreenSize();
  const styles = getResponsiveStyles(screenSize);
  
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [steamData, setSteamData] = useState<SteamData | null>(null);
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    country: string;
    country_code: string;
    steam_country_code: string;
    currency?: string;
  } | null>(null);

  // Obtener ubicación del usuario
  useEffect(() => {
    fetch('/api/geolocation')
      .then((res) => {
        if (!res.ok) throw new Error('Geolocation failed');
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          console.warn('Geolocation error:', data.error);
          return;
        }
        console.log('User location:', data);
        setUserLocation(data);
      })
      .catch((err) => console.error('Error loading location:', err));
  }, []);

  // Cargar datos de Steam si existe steam_appid y tenemos la ubicación
  useEffect(() => {
    if (game?.steam_appid && userLocation) {
      setLoadingSteam(true);
      setSteamError(null);
      
      // Intentar cargar datos de Steam con manejo robusto de errores
      fetch(`/api/steam/${game.steam_appid}?cc=${userLocation.steam_country_code}&l=${locale}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          
          // Verificar si es un fallback
          if (data._fallback) {
            console.warn(`Steam API returned fallback data for ${game.steam_appid}:`, data._error);
            setSteamError(data._error || 'Unable to load Steam data');
            // No establecer steamData para usar datos del juego
            return;
          }
          
          if (!res.ok) {
            // Si la API falla, registrar el error pero continuar sin datos de Steam
            console.warn(`Steam API returned ${res.status} for ${game.steam_appid}, using fallback data`);
            setSteamError(`Steam API error: ${res.status}`);
            return;
          }
          
          if (data.error) {
            console.warn('Steam API error:', data.error, data.details);
            setSteamError(data.details || data.error);
            return;
          }
          
          console.log('Steam data loaded:', data);
          console.log('Price info:', data.price_info);
          setSteamData(data);
        })
        .catch((err) => {
          // Error de red o parsing, usar fallback
          console.error(`Error loading Steam data for ${game.steam_appid}:`, err);
          setSteamError('Network error loading Steam data');
        })
        .finally(() => setLoadingSteam(false));
    }
  }, [game?.steam_appid, userLocation, locale]); // Agregar locale para recargar cuando cambie

  // Screenshots - prioriza los de steamData, luego los del game
  const screenshots = steamData?.screenshots?.length
    ? steamData.screenshots.map(s => s.full)
    : game?.screenshots?.length
      ? game.screenshots
      : game?.wallpaper ? [game.wallpaper] : [];

  // Videos - prioriza los de steamData, luego el trailer del game
  const videos = steamData?.videos?.length
    ? steamData.videos
    : game?.trailer
      ? [{ name: 'Trailer', mp4: { max: game.trailer } as { max: string } }]
      : [];

  const currentVideo = videos[currentVideoIndex] as any;

  // Combinar screenshots con thumbnails de videos para el slider
  const mediaItems = [
    ...screenshots.map((src, index) => ({ type: 'image' as const, src, index })),
    ...videos.map((video: any, index) => ({
      type: 'video' as const,
      src: video.thumbnail,
      videoUrl: video.hls || video.dash || video.mp4?.max || video.mp4?.['480'] || video.webm?.max || video.webm?.['480'] || '',
      videoIndex: index,
      index: screenshots.length + index
    }))
  ];

  // Obtener la URL del video actual
  const getVideoUrl = () => {
    if (!currentVideo) {
      console.log('No currentVideo');
      return '';
    }

    console.log('currentVideo structure:', JSON.stringify(currentVideo, null, 2));

    // Steam ahora usa HLS (M3U8) y DASH (MPD) en lugar de MP4/WebM directo
    // Prioridad: HLS > DASH > MP4 > WebM > trailer del juego
    const hlsUrl = currentVideo.hls;
    const dashUrl = currentVideo.dash;
    const mp4Max = currentVideo.mp4?.max;
    const mp4_480 = currentVideo.mp4?.['480'];
    const webmMax = currentVideo.webm?.max;
    const webm480 = currentVideo.webm?.['480'];
    const trailerUrl = game?.trailer;

    console.log('hlsUrl:', hlsUrl);
    console.log('dashUrl:', dashUrl);
    console.log('mp4Max:', mp4Max);
    console.log('mp4_480:', mp4_480);
    console.log('webmMax:', webmMax);
    console.log('webm480:', webm480);
    console.log('trailerUrl:', trailerUrl);

    // HLS es el formato más compatible con navegadores modernos
    return hlsUrl || dashUrl || mp4Max || mp4_480 || webmMax || webm480 || trailerUrl || '';
  };

  const videoUrl = getVideoUrl();
  const hasValidVideo = videoUrl && videoUrl.trim() !== '';

  // Debug: Log video info
  useEffect(() => {
    if (steamData?.videos?.length) {
      console.log('Steam videos loaded:', steamData.videos);
      console.log('Current video index:', currentVideoIndex);
      console.log('Current video:', currentVideo);
      console.log('Video URL:', videoUrl);
      console.log('Has valid video:', hasValidVideo);
    }
  }, [steamData, currentVideoIndex, currentVideo, videoUrl, hasValidVideo]);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (game) {
      requestAnimationFrame(() => setVisible(true));
      setCurrentVideoIndex(0); // Reset video index when game changes
    } else {
      setVisible(false);
    }
  }, [game]);

  if (!game || !ready) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onCloseAction, 200);
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewerOpen(false);
  };

  const nextScreenshot = () => {
    setScreenshotIndex((prev) => (prev + 1) % Math.max(1, mediaItems.length - 2));
  };

  const prevScreenshot = () => {
    setScreenshotIndex((prev) => (prev - 1 + Math.max(1, mediaItems.length - 2)) % Math.max(1, mediaItems.length - 2));
  };

  const nextViewerImage = () => {
    setViewerIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevViewerImage = () => {
    setViewerIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return createPortal(
    <div
      onClick={handleClose}
      className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-200 ${visible ? 'bg-black/85' : 'bg-black/0'
        }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${styles.modal.container} bg-[#181818] rounded-lg overflow-hidden transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className={`absolute top-3 right-3 ${styles.modal.closeButton} bg-black/70 hover:bg-black/90 border-none rounded-full flex items-center justify-center cursor-pointer z-50 transition-colors shadow-lg`}
        >
          <X className={`text-white ${styles.modal.closeIcon}`} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto overflow-x-hidden">
          {/* Hero Image / Trailer */}
          <div className={`${styles.hero.height} relative overflow-hidden`}>
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
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showTrailer ? 'opacity-0' : 'opacity-100'
                  }`}
              />
            )}
            <div className={`absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent transition-opacity duration-500 ${showTrailer ? 'opacity-0' : 'opacity-100'
              }`} />

            {/* Video Player */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${showTrailer && hasValidVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
              {showTrailer && hasValidVideo && (
                <VideoPlayer
                  key={`video-${currentVideoIndex}-${videoUrl}`}
                  url={videoUrl}
                  playing={showTrailer}
                />
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
              <div className={`absolute ${styles.hero.buttonContainer} z-10 transition-all duration-500 ${showTrailer ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
                }`}>
                <h2 className={`${styles.hero.title} ${styles.hero.titleMargin} font-bold text-white line-clamp-2 drop-shadow-lg`}>{game.title}</h2>
                <div className={`flex ${styles.hero.buttonGap} flex-wrap`}>
                  {game.links ? (
                    <a
                      href={game.links}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.hero.button} rounded-full bg-white text-black border-none font-bold cursor-pointer flex items-center ${styles.hero.buttonGap} hover:bg-gray-200 transition-colors shadow-lg`}
                    >
                      <Download className={styles.hero.buttonIcon} />
                      <span>{screenSize === 'xs' ? 'Download' : t.modal.downloadFree}</span>
                    </a>
                  ) : (
                    <a
                      href={`https://store.steampowered.com/app/${game.steam_appid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.hero.button} rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none font-bold cursor-pointer flex items-center ${styles.hero.buttonGap} hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg`}
                    >
                      <svg className={styles.hero.buttonIcon} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2m0-2a12 12 0 0 0-12 12 12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.5 14.5-5-2.5V9l5 2.5v3z"/>
                      </svg>
                      <span>{screenSize === 'xs' ? 'Steam' : t.modal.viewOnSteam}</span>
                    </a>
                  )}
                  {(hasValidVideo || game.trailer) && (
                    <button
                      onClick={() => {
                        setCurrentVideoIndex(0);
                        setShowTrailer(true);
                      }}
                      className={`${styles.hero.button} rounded-full bg-gray-500/70 text-white border-none font-bold cursor-pointer flex items-center ${styles.hero.buttonGap} hover:bg-gray-500/90 transition-colors shadow-lg`}
                    >
                      <Play className={styles.hero.buttonIcon} />
                      <span>{screenSize === 'xs' ? 'Play' : t.modal.trailer}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Título y botones cuando el trailer está activo */}
          <div className={`overflow-hidden transition-all duration-500 ease-out ${showTrailer ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
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
                      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2m0-2a12 12 0 0 0-12 12 12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.5 14.5-5-2.5V9l5 2.5v3z"/>
                    </svg>
                    {t.modal.viewOnSteam}
                  </a>
                )}
                {(hasValidVideo || game.trailer) && (
                  <button
                    onClick={() => {
                      setShowTrailer(false);
                      setCurrentVideoIndex(0);
                    }}
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


          {/* Detalles */}
          <div className={styles.content.padding}>
            {/* Info badges */}
            <div className={`flex ${styles.content.gap} items-center ${styles.content.spacing} flex-wrap`}>
              {loadingSteam ? (
                <>
                  <div className="h-5 w-20 bg-gray-700 animate-pulse rounded" />
                  <div className="h-4 w-12 bg-gray-700 animate-pulse rounded" />
                  <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
                  <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
                  <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
                </>
                ) : (
                  <span className="text-green-500 font-bold text-sm md:text-[15px]">
                    {steamData?.metacritic
                      ? `${steamData.metacritic}% Rating`
                      : `${Math.round(game.rating * 10)}% Rating`}
                  </span>
                )}
                <span className="text-gray-400 text-xs md:text-sm">
                  {steamData?.release_year || 'Error'}
                </span>
                <span className="border border-gray-500 px-1 md:px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300">
                  {steamData?.required_age ? `${steamData.required_age}+` : 'Error'}
                </span>
                <span className="border border-gray-500 px-1 md:px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300">
                  HD
                </span>
                <span className="border border-gray-500 px-1 md:px-1.5 py-0.5 text-[10px] md:text-xs text-gray-300">
                  5.1
                </span>
                {steamError && (
                  <span className="text-yellow-500 text-[10px] md:text-xs ml-2" title={steamError}>
                    ⚠ {t.modal.limitedInfo || 'Info limitada'}
                  </span>
                )}
            </div>

            {/* Main content grid */}
            <div className={`grid ${styles.grid.main}`}>
              {/* Left column */}
              <div>
                {loadingSteam ? (
                  <div className={`space-y-2 ${styles.content.spacingLarge}`}>
                    <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-full" />
                    <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-full" />
                    <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-3/4" />
                  </div>
                ) : (
                  <p className={`${styles.text.sm} text-gray-200 leading-relaxed ${styles.content.spacingLarge}`}>
                    {steamData?.short_description || game.description}
                  </p>
                )}

                {/* Features section */}
                <div className={styles.content.spacingLarge}>
                  <h3 className={`text-white font-semibold mb-2 md:mb-3 ${styles.text.heading}`}>{t.modal.gameFeatures}</h3>
                  {loadingSteam ? (
                    <div className={`grid ${styles.grid.features}`}>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-4 md:h-5 bg-gray-700 animate-pulse rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className={`grid ${styles.grid.features}`}>
                      {steamData?.categories?.length ? (
                        steamData.categories.slice(0, 6).map((category, index) => (
                          <div key={index} className="flex items-center gap-1.5 md:gap-2 text-gray-300 text-xs md:text-sm">
                            <span className="text-green-500">✓</span> {category}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 md:gap-2 text-gray-300 text-xs md:text-sm">
                            <span className="text-green-500">✓</span> Single Player Campaign
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 text-gray-300 text-xs md:text-sm">
                            <span className="text-green-500">✓</span> Online Multiplayer
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 text-gray-300 text-xs md:text-sm">
                            <span className="text-green-500">✓</span> Cross-Platform Play
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 text-gray-300 text-xs md:text-sm">
                            <span className="text-green-500">✓</span> Cloud Saves
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 text-gray-300 text-xs md:text-sm">
                            <span className="text-green-500">✓</span> Controller Support
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 text-gray-300 text-xs md:text-sm">
                            <span className="text-green-500">✓</span> Achievements
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Screenshots section with slider */}
                <div className={styles.content.spacingLarge}>
                  <h3 className={`text-white font-semibold mb-2 md:mb-3 ${styles.text.heading}`}>
                    {t.modal.screenshotsVideos}
                    {loadingSteam && <span className="text-gray-500 text-sm ml-2">({t.common.loading})</span>}
                    {steamData && <span className="text-green-500 text-sm ml-2">✓ Steam</span>}
                  </h3>
                  {loadingSteam ? (
                    <div className="relative">
                      <div className="overflow-hidden rounded-lg">
                        <div className="flex gap-1.5 md:gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="flex-shrink-0 w-[calc(33.33%-4px)] md:w-[calc(33.33%-5px)] aspect-video bg-gray-700 animate-pulse rounded"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-center gap-1 md:gap-1.5 mt-2 md:mt-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-700 animate-pulse" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Slider container */}
                      <div className="overflow-hidden rounded-lg">
                        <div
                          className="flex gap-1.5 md:gap-2 transition-transform duration-300"
                          style={{ transform: `translateX(-${screenshotIndex * 33.33}%)` }}
                        >
                          {mediaItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex-shrink-0 w-[calc(33.33%-4px)] md:w-[calc(33.33%-5px)] aspect-video bg-gray-700 rounded overflow-hidden cursor-pointer relative group"
                              onClick={() => {
                                if (item.type === 'video' && item.videoUrl) {
                                  // Reproducir el video específico clickeado
                                  setCurrentVideoIndex(item.videoIndex || 0);
                                  setShowTrailer(true);
                                } else {
                                  openViewer(item.index);
                                }
                              }}
                            >
                              <div
                                className="w-full h-full bg-cover bg-center hover:scale-110 transition-transform duration-300"
                                style={{ backgroundImage: `url(${proxySteamImage(item.src)})` }}
                              />
                              {/* Indicador de video */}
                              {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                                  <div className="bg-white/90 rounded-full p-2 md:p-3 group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 md:w-6 md:h-6 text-black" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Navigation arrows */}
                      {mediaItems.length > 3 && (
                        <>
                          <button
                            onClick={prevScreenshot}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-3 bg-black/80 hover:bg-black text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          <button
                            onClick={nextScreenshot}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-3 bg-black/80 hover:bg-black text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </>
                      )}

                      {/* Dots indicator */}
                      <div className="flex justify-center gap-1 md:gap-1.5 mt-2 md:mt-3">
                        {Array.from({ length: Math.max(1, mediaItems.length - 2) }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setScreenshotIndex(index)}
                            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${index === screenshotIndex ? 'bg-white' : 'bg-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* System Requirements */}
                <div>
                  <h3 className={`text-white font-semibold mb-3 md:mb-4 ${styles.text.base}`}>{t.modal.systemRequirements}</h3>
                  {loadingSteam ? (
                    <div className="grid grid-cols-2 gap-8">
                      {/* MÍNIMO Skeleton */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">{t.modal.minimum}</h4>
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-700 animate-pulse rounded w-full" />
                          ))}
                        </div>
                      </div>
                      {/* RECOMENDADO Skeleton */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">{t.modal.recommended}</h4>
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-700 animate-pulse rounded w-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`grid ${styles.grid.requirements}`}>
                      {/* MÍNIMO */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">{t.modal.minimum}</h4>
                        {steamData?.pc_requirements?.minimum ? (
                          <div className="space-y-2 text-sm text-gray-300">
                            {steamData.pc_requirements.minimum.split('\n').filter(Boolean).map((line, index) => (
                              <p key={index} className="leading-relaxed">{line}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-300">
                            <p className="text-gray-500">{t.modal.noMinimum}</p>
                          </div>
                        )}
                      </div>

                      {/* RECOMENDADO */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">{t.modal.recommended}</h4>
                        {steamData?.pc_requirements?.recommended ? (
                          <div className="space-y-2 text-sm text-gray-300">
                            {steamData.pc_requirements.recommended.split('\n').filter(Boolean).map((line, index) => (
                              <p key={index} className="leading-relaxed">{line}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-300">
                            <p className="text-gray-500">{t.modal.noRecommended}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Sidebar */}
              <div className={styles.sidebar.spacing}>
                {/* Price Card - Destacado */}
                {loadingSteam ? (
                  <div className={`relative overflow-hidden bg-gradient-to-br from-gray-700/20 via-gray-600/10 to-gray-700/20 border border-gray-600/30 ${styles.sidebar.priceCard}`}>
                    <div className="flex items-center justify-between gap-2 xs:gap-3 sm:gap-4 md:gap-6 mb-2 xs:mb-3 sm:mb-3.5 md:mb-4">
                      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
                        <div className="w-0.5 xs:w-0.5 sm:w-0.5 md:w-1 h-5 xs:h-6 sm:h-7 md:h-8 bg-gray-600 animate-pulse rounded-full"></div>
                        <div className="h-2.5 xs:h-3 sm:h-3.5 md:h-4 w-10 xs:w-12 sm:w-14 md:w-16 bg-gray-600 animate-pulse rounded"></div>
                      </div>
                      <div className="h-5 xs:h-6 sm:h-7 md:h-8 w-16 xs:w-20 sm:w-22 md:w-24 bg-gray-600 animate-pulse rounded-full"></div>
                    </div>
                    <div className="h-7 xs:h-8 sm:h-9 md:h-10 w-20 xs:w-24 sm:w-28 md:w-32 bg-gray-600 animate-pulse rounded mb-1 xs:mb-1.5 sm:mb-1.5 md:mb-2"></div>
                    <div className="h-2 xs:h-2.5 sm:h-2.5 md:h-3 w-14 xs:w-16 sm:w-18 md:w-20 bg-gray-600 animate-pulse rounded"></div>
                  </div>
                ) : steamData?.price ? (
                  <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-green-400/30 ${styles.sidebar.priceCard} backdrop-blur-sm`}>
                    <Snowfall
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0
                      }} />

                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent"></div>
                    <div className={`relative flex items-center justify-between ${styles.content.gap}`}>
                      <div className={`flex items-center ${styles.content.gap}`}>
                        <div className="w-0.5 md:w-1 h-6 md:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
                        <h4 className={`text-gray-300 ${styles.sidebar.priceTitle} font-bold tracking-wider uppercase`}>{t.modal.price}</h4>
                      </div>
                      {userLocation && (
                        <span className={`flex items-center gap-1 md:gap-2 ${styles.sidebar.priceTitle} text-emerald-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-2 md:px-4 py-1 md:py-2 rounded-full border border-green-400/20 backdrop-blur-sm shadow-lg shadow-green-500/10`}>
                          <MapPinCheck className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                          <span className="font-medium hidden sm:inline">{userLocation.country}</span>
                        </span>
                      )}
                    </div>

                    {steamData.is_free ? (
                      <div className={`${styles.sidebar.priceAmount} font-bold text-green-400 mt-2`}>
                        {t.modal.free}
                      </div>
                    ) : steamData.price_info ? (
                      <div>
                        {steamData.price_info.discount_percent > 0 ? (
                          <div className="mt-1.5 md:mt-2 space-y-1.5 md:space-y-2">
                            <div className={`flex items-center ${styles.content.gap}`}>
                              <span className={`bg-green-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded font-bold ${styles.sidebar.priceDiscount}`}>
                                -{steamData.price_info.discount_percent}%
                              </span>
                              <span className={`text-gray-400 line-through ${styles.text.sm}`}>
                                {steamData.price_info.initial_formatted}
                              </span>
                            </div>
                            <div className={`${styles.sidebar.priceAmount} font-bold text-green-400`}>
                              {steamData.price_info.final_formatted}
                            </div>
                          </div>
                        ) : (
                          <div className={`${styles.sidebar.priceAmount} font-bold text-white mt-2`}>
                            {steamData.price_info.final_formatted || steamData.price}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`text-xl md:text-2xl font-bold text-white mt-2`}>
                        {steamData.price}
                      </div>
                    )}

                    {steamData.price_info && (
                      <p className={`${styles.sidebar.priceTitle} text-gray-400 mt-1.5 md:mt-2`}>
                        {t.modal.priceIn} {steamData.price_info.currency}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Game info */}
                {loadingSteam ? (
                  <div className="space-y-2 md:space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 md:h-5 bg-gray-700 animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    <p className={`text-gray-500 ${styles.sidebar.info}`}>
                      <span>{t.modal.genre} </span>
                      <span className="text-white">
                        {steamData?.genres?.length
                          ? steamData.genres.join(', ')
                          : game.genre}
                      </span>
                    </p>
                    <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
                      <span>{t.modal.rating} </span>
                      <span className="text-white flex items-center gap-1">
                        <Star fill="yellow" stroke="yellow" strokeWidth={0.5} size={12} className="xs:w-3.5 xs:h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        {steamData?.metacritic
                          ? `${steamData.metacritic}/100 (Metacritic)`
                          : `${game.rating}/10`}
                      </span>
                    </p>
                    <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
                      <span>{t.modal.developer} </span>
                      <span className="text-white">
                        {steamData?.developers?.length
                          ? steamData.developers.join(', ')
                          : 'Error'}
                      </span>
                    </p>
                    <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
                      <span>{t.modal.publisher} </span>
                      <span className="text-white">
                        {steamData?.publishers?.length
                          ? steamData.publishers.join(', ')
                          : 'Error'}
                      </span>
                    </p>
                    <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
                      <span>{t.modal.release} </span>
                      <span className="text-white">
                        {steamData?.release_date || 'Dec 15, 2024'}
                      </span>
                    </p>
                    <p className="text-gray-500 text-[10px] xs:text-xs sm:text-xs md:text-sm">
                      <span>{t.modal.priceHistory} </span>
                      {steamData?.current_price && steamData?.lowest_recorded_price ? (
                        <span className="text-white text-[10px] xs:text-xs sm:text-xs md:text-sm">
                          <a 
                            href={`https://steamdb.info/app/${steamData.steam_appid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-400 transition-colors cursor-pointer underline decoration-dotted"
                          >
                            {t.modal.currentPrice} {steamData.current_price}
                          </a>
                          {' | '}
                          <a 
                            href={`https://steamdb.info/app/${steamData.steam_appid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-400 transition-colors cursor-pointer underline decoration-dotted"
                          >
                            {t.modal.lowestPrice} {steamData.lowest_recorded_price}
                          </a>
                        </span>
                      ) : (
                        <span className="text-white">{t.modal.notAvailable}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Platforms */}
                <div>
                  <h4 className="text-gray-400 text-[10px] xs:text-xs sm:text-xs md:text-sm mb-1 xs:mb-1.5 sm:mb-1.5 md:mb-2">{t.modal.availableOn}</h4>
                  {loadingSteam ? (
                    <div className="h-3.5 xs:h-4 sm:h-4 md:h-5 w-16 xs:w-20 sm:w-22 md:w-24 bg-gray-700 animate-pulse rounded" />
                  ) : (
                    <div className="flex gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-300">
                      {steamData?.platforms ? (
                        <>
                          {steamData.platforms.windows && <span title="Windows">Windows</span>}
                          {steamData.platforms.mac && <span title="Mac">Mac</span>}
                          {steamData.platforms.linux && <span title="Linux">Linux</span>}
                        </>
                      ) : (
                        <span>PC</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-gray-400 text-[10px] xs:text-xs sm:text-xs md:text-sm mb-1 xs:mb-1.5 sm:mb-1.5 md:mb-2">{t.modal.tags}</h4>
                  {loadingSteam ? (
                    <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-1.5 md:gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-4 xs:h-5 sm:h-5 md:h-6 w-10 xs:w-12 sm:w-14 md:w-16 bg-gray-700 animate-pulse rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-1.5 md:gap-2">
                      {steamData?.categories?.length ? (
                        steamData.categories.slice(0, 8).map((category, index) => (
                          <span key={index} className={`bg-[#333] text-gray-300 ${styles.sidebar.tag} rounded`}>
                            {category}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className={`bg-[#333] text-gray-300 ${styles.sidebar.tag} rounded`}>Action</span>
                          <span className={`bg-[#333] text-gray-300 ${styles.sidebar.tag} rounded`}>Adventure</span>
                          <span className={`bg-[#333] text-gray-300 ${styles.sidebar.tag} rounded`}>Open World</span>
                          <span className={`bg-[#333] text-gray-300 ${styles.sidebar.tag} rounded`}>RPG</span>
                          <span className={`bg-[#333] text-gray-300 ${styles.sidebar.tag} rounded`}>Story Rich</span>
                          <span className={`bg-[#333] text-gray-300 ${styles.sidebar.tag} rounded`}>Multiplayer</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <h4 className={`text-gray-400 ${styles.sidebar.info} mb-1.5 md:mb-2`}>{t.modal.languages}</h4>
                  {loadingSteam ? (
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-full" />
                      <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-2/3" />
                    </div>
                  ) : (
                    <p className={`text-gray-300 ${styles.sidebar.info}`}>
                      {steamData?.languages?.length
                        ? steamData.languages.slice(0, 10).join(', ')
                        : 'English, Spanish, French, German, Japanese, Korean, Chinese'}
                    </p>
                  )}
                </div>

                {/* Social */}
                <div>
                  <h4 className={`text-gray-400 ${styles.sidebar.info} mb-1.5 md:mb-2`}>{t.modal.share}</h4>
                  <div className={`flex ${styles.content.gap} flex-wrap`}>
                    <button className={`bg-[#333] hover:bg-[#444] text-white ${styles.sidebar.button} rounded transition-colors`}>
                      {t.modal.discord}
                    </button>
                    <button className={`bg-[#333] hover:bg-[#444] text-white ${styles.sidebar.button} rounded transition-colors`}>
                      {t.modal.facebook}
                    </button>
                    <button className={`bg-[#333] hover:bg-[#444] text-white ${styles.sidebar.button} rounded transition-colors`}>
                      {t.modal.copyLink}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Buy on Steam Widget - Full Width */}
            {loadingSteam ? (
              <div className="flex justify-center mt-4 xs:mt-5 sm:mt-6 md:mt-8 px-3 xs:px-4 sm:px-5 md:px-6">
                <div className="w-full max-w-[646px] h-[150px] xs:h-[170px] sm:h-[180px] md:h-[190px] bg-gray-700 animate-pulse rounded-lg" />
              </div>
            ) : steamData ? (
              <div className="flex justify-center mt-4 xs:mt-5 sm:mt-6 md:mt-8 px-3 xs:px-4 sm:px-5 md:px-6 overflow-hidden">
                <iframe
                  src={`https://store.steampowered.com/widget/${steamData.steam_appid}/?l=${getSteamLanguage(locale)}`}
                  className="w-full max-w-[646px] scale-90 xs:scale-95 sm:scale-100"
                  width="646"
                  height="190"
                  frameBorder="0"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {viewerOpen && (
        <div
          className={`fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center ${styles.viewer.padding}`}
          onClick={(e) => {
            e.stopPropagation();
            setViewerOpen(false);
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewerOpen(false);
            }}
            className={`absolute ${styles.viewer.closeButton} bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50`}
          >
            <X className={`text-white ${styles.viewer.closeIcon}`} />
          </button>

          {/* Image counter */}
          <div className={`absolute ${styles.viewer.counter} text-white/70`}>
            {viewerIndex + 1} / {screenshots.length}
          </div>

          {/* Main image */}
          <div
            className={`${styles.viewer.image} rounded-lg overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={proxySteamImage(screenshots[viewerIndex])}
              alt={`Screenshot ${viewerIndex + 1}`}
              className={`max-w-full ${styles.viewer.image} object-contain`}
            />
          </div>

          {/* Navigation arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prevViewerImage(); }}
            className={`absolute ${styles.viewer.arrowLeft} top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full ${styles.viewer.arrow} flex items-center justify-center transition-colors`}
          >
            <ChevronLeft className={styles.viewer.arrowIcon} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextViewerImage(); }}
            className={`absolute ${styles.viewer.arrowRight} top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full ${styles.viewer.arrow} flex items-center justify-center transition-colors`}
          >
            <ChevronRight className={styles.viewer.arrowIcon} />
          </button>

          {/* Thumbnails */}
          <div className={`absolute ${styles.viewer.thumbnails} left-1/2 -translate-x-1/2 flex overflow-x-auto max-w-[95vw] px-2`}>
            {screenshots.map((src, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setViewerIndex(index); }}
                className={`flex-shrink-0 ${styles.viewer.thumbnail} rounded overflow-hidden transition-all ${index === viewerIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                  }`}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${proxySteamImage(src)})` }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
