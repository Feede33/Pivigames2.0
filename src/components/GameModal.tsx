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


const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

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
  onClose: () => void;
};

export default function GameModal({ game, onClose }: Props) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [steamData, setSteamData] = useState<SteamData | null>(null);
  const [loadingSteam, setLoadingSteam] = useState(false);
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
      fetch(`/api/steam/${game.steam_appid}?cc=${userLocation.steam_country_code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.warn('Steam API error:', data.error);
            return;
          }
          console.log('Steam data loaded:', data);
          console.log('Price info:', data.price_info);
          setSteamData(data);
        })
        .catch((err) => console.error('Error loading Steam data:', err))
        .finally(() => setLoadingSteam(false));
    }
  }, [game?.steam_appid, userLocation]);

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
    setTimeout(onClose, 200);
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
        className={`w-[1100px] min-h-[850px] bg-[#181818] rounded-lg overflow-hidden transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
      >
        <OverlayScrollbarsComponent
          options={{
            scrollbars: {
              autoHide: 'leave',
              theme: 'os-theme-dark',
            },
          }}
          style={{ maxHeight: '500px' }}
        >
          {/* Tu contenido aquí */}
        </OverlayScrollbarsComponent>
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-black/60 border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer z-10 hover:bg-black/80 transition-colors"
        >
          <X className="text-white w-5 h-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          {/* Hero Image / Trailer */}
          <div className="h-[350px] relative overflow-hidden">
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
              <div className={`absolute bottom-5 left-6 right-6 z-10 transition-all duration-500 ${showTrailer ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
                }`}>
                <h2 className="text-4xl font-bold text-white mb-3">{game.title}</h2>
                <div className="flex gap-3">
                  {game.links && (
                    <a
                      href={game.links}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-7 py-2.5 rounded-full bg-white text-black border-none font-bold text-[15px] cursor-pointer flex items-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-[18px] h-[18px]" />
                      Download Free
                    </a>
                  )}
                  {(hasValidVideo || game.trailer) && (
                    <button
                      onClick={() => {
                        setCurrentVideoIndex(0);
                        setShowTrailer(true);
                      }}
                      className="px-7 py-2.5 rounded-full bg-gray-500/70 text-white border-none font-bold text-[15px] cursor-pointer flex items-center gap-2 hover:bg-gray-500/90 transition-colors"
                    >
                      <Play className="w-[18px] h-[18px]" />
                      Trailer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Título y botones cuando el trailer está activo */}
          <div className={`overflow-hidden transition-all duration-500 ease-out ${showTrailer ? 'max-h-[120px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
            <div className="px-6 py-4 bg-[#181818]">
              <h2 className="text-4xl font-bold text-white mb-3">{game.title}</h2>
              <div className="flex gap-3">
                {game.links && (
                  <a
                    href={game.links}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-2.5 rounded-full bg-white text-black border-none font-bold text-[15px] cursor-pointer flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-[18px] h-[18px]" />
                    Download Free
                  </a>
                )}
                {(hasValidVideo || game.trailer) && (
                  <button
                    onClick={() => {
                      setShowTrailer(false);
                      setCurrentVideoIndex(0);
                    }}
                    className="px-7 py-2.5 rounded-full bg-red-600 text-white border-none font-bold text-[15px] cursor-pointer flex items-center gap-2 hover:bg-red-700 transition-colors"
                  >
                    <X className="w-[18px] h-[18px]" />
                    Cerrar Trailer
                  </button>
                )}
              </div>
            </div>
          </div>


          {/* Detalles */}
          <div className="p-6">
            {/* Info badges */}
            <div className="flex gap-3 items-center mb-4">
              {loadingSteam ? (
                <>
                  <div className="h-5 w-20 bg-gray-700 animate-pulse rounded" />
                  <div className="h-4 w-12 bg-gray-700 animate-pulse rounded" />
                  <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
                  <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
                  <div className="h-6 w-8 bg-gray-700 animate-pulse rounded" />
                </>
              ) : (
                <>
                  <span className="text-green-500 font-bold text-[15px]">
                    {steamData?.metacritic
                      ? `${steamData.metacritic}% Match`
                      : `${Math.round(game.rating * 10)}% Match`}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {steamData?.release_year || '2024'}
                  </span>
                  <span className="border border-gray-500 px-1.5 py-0.5 text-xs text-gray-300">
                    {steamData?.required_age ? `${steamData.required_age}+` : '18+'}
                  </span>
                  <span className="border border-gray-500 px-1.5 py-0.5 text-xs text-gray-300">
                    HD
                  </span>
                  <span className="border border-gray-500 px-1.5 py-0.5 text-xs text-gray-300">
                    5.1
                  </span>
                </>
              )}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-[2fr_1fr] gap-8">
              {/* Left column */}
              <div>
                {loadingSteam ? (
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-700 animate-pulse rounded w-full" />
                    <div className="h-4 bg-gray-700 animate-pulse rounded w-full" />
                    <div className="h-4 bg-gray-700 animate-pulse rounded w-3/4" />
                  </div>
                ) : (
                  <p className="text-gray-200 leading-relaxed text-base mb-6">
                    {steamData?.short_description || game.description}
                  </p>
                )}

                {/* Features section */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Game Features</h3>
                  {loadingSteam ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-5 bg-gray-700 animate-pulse rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {steamData?.categories?.length ? (
                        steamData.categories.slice(0, 6).map((category, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-500">✓</span> {category}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-500">✓</span> Single Player Campaign
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-500">✓</span> Online Multiplayer
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-500">✓</span> Cross-Platform Play
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-500">✓</span> Cloud Saves
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-500">✓</span> Controller Support
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span className="text-green-500">✓</span> Achievements
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Screenshots section with slider */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">
                    Screenshots & Videos
                    {loadingSteam && <span className="text-gray-500 text-sm ml-2">(Cargando desde Steam...)</span>}
                    {steamData && <span className="text-green-500 text-sm ml-2">✓ Steam</span>}
                  </h3>
                  {loadingSteam ? (
                    <div className="relative">
                      <div className="overflow-hidden rounded-lg">
                        <div className="flex gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="flex-shrink-0 w-[calc(33.33%-5px)] aspect-video bg-gray-700 animate-pulse rounded"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-center gap-1.5 mt-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-gray-700 animate-pulse" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Slider container */}
                      <div className="overflow-hidden rounded-lg">
                        <div
                          className="flex gap-2 transition-transform duration-300"
                          style={{ transform: `translateX(-${screenshotIndex * 33.33}%)` }}
                        >
                          {mediaItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex-shrink-0 w-[calc(33.33%-5px)] aspect-video bg-gray-700 rounded overflow-hidden cursor-pointer relative group"
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
                                  <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 text-black" />
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
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-black/80 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextScreenshot}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-black/80 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Dots indicator */}
                      <div className="flex justify-center gap-1.5 mt-3">
                        {Array.from({ length: Math.max(1, mediaItems.length - 2) }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setScreenshotIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${index === screenshotIndex ? 'bg-white' : 'bg-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* System Requirements */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg">REQUISITOS DEL SISTEMA</h3>
                  {loadingSteam ? (
                    <div className="grid grid-cols-2 gap-8">
                      {/* MÍNIMO Skeleton */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">MÍNIMO:</h4>
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-700 animate-pulse rounded w-full" />
                          ))}
                        </div>
                      </div>
                      {/* RECOMENDADO Skeleton */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">RECOMENDADO:</h4>
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-700 animate-pulse rounded w-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-8">
                      {/* MÍNIMO */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">MÍNIMO:</h4>
                        {steamData?.pc_requirements?.minimum ? (
                          <div className="space-y-2 text-sm text-gray-300">
                            {steamData.pc_requirements.minimum.split('\n').filter(Boolean).map((line, index) => (
                              <p key={index} className="leading-relaxed">{line}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-300">
                            <p className="text-gray-500">No hay información de requisitos mínimos disponible</p>
                          </div>
                        )}
                      </div>

                      {/* RECOMENDADO */}
                      <div>
                        <h4 className="text-gray-400 text-sm font-semibold mb-3">RECOMENDADO:</h4>
                        {steamData?.pc_requirements?.recommended ? (
                          <div className="space-y-2 text-sm text-gray-300">
                            {steamData.pc_requirements.recommended.split('\n').filter(Boolean).map((line, index) => (
                              <p key={index} className="leading-relaxed">{line}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-300">
                            <p className="text-gray-500">No hay información de requisitos recomendados disponible</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Sidebar */}
              <div className="space-y-6">
                {/* Price Card - Destacado */}
                {loadingSteam ? (
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-700/20 via-gray-600/10 to-gray-700/20 border border-gray-600/30 rounded-3xl p-8">
                    <div className="flex items-center justify-between gap-6 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gray-600 animate-pulse rounded-full"></div>
                        <div className="h-4 w-16 bg-gray-600 animate-pulse rounded"></div>
                      </div>
                      <div className="h-8 w-24 bg-gray-600 animate-pulse rounded-full"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-600 animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-20 bg-gray-600 animate-pulse rounded"></div>
                  </div>
                ) : steamData?.price ? (
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-green-400/30 rounded-3xl p-8 backdrop-blur-sm">
                    <Snowfall
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0
                      }} />

                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent"></div>
                    <div className="relative flex items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
                        <h4 className="text-gray-300 text-xs font-bold tracking-wider uppercase">Precio</h4>
                      </div>
                      {userLocation && (
                        <span className="flex items-center gap-2 text-xs text-emerald-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full border border-green-400/20 backdrop-blur-sm shadow-lg shadow-green-500/10">
                          <MapPinCheck className="w-3.5 h-3.5" />
                          <span className="font-medium">{userLocation.country}</span>
                        </span>
                      )}
                    </div>

                    {steamData.is_free ? (
                      <div className="text-3xl font-bold text-green-400">
                        GRATIS
                      </div>
                    ) : steamData.price_info ? (
                      <div>
                        {steamData.price_info.discount_percent > 0 ? (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="bg-green-600 text-white px-2 py-1 rounded font-bold text-sm">
                                -{steamData.price_info.discount_percent}%
                              </span>
                              <span className="text-gray-400 line-through text-lg">
                                {steamData.price_info.initial_formatted}
                              </span>
                            </div>
                            <div className="text-3xl font-bold text-green-400">
                              {steamData.price_info.final_formatted}
                            </div>
                          </div>
                        ) : (
                          <div className="text-3xl font-bold text-white">
                            {steamData.price_info.final_formatted || steamData.price}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-white">
                        {steamData.price}
                      </div>
                    )}

                    {steamData.price_info && (
                      <p className="text-xs text-gray-400 mt-2">
                        Precio en {steamData.price_info.currency}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Game info */}
                {loadingSteam ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-5 bg-gray-700 animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-500 text-sm">
                      <span>Genre: </span>
                      <span className="text-white">
                        {steamData?.genres?.length
                          ? steamData.genres.join(', ')
                          : game.genre}
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      <span>Rating: </span>
                      <span className="text-white flex items-center gap-1">
                        <Star fill="yellow" stroke="yellow" strokeWidth={0.5} size={16} />
                        {steamData?.metacritic
                          ? `${steamData.metacritic}/100 (Metacritic)`
                          : `${game.rating}/10`}
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      <span>Developer: </span>
                      <span className="text-white">
                        {steamData?.developers?.length
                          ? steamData.developers.join(', ')
                          : 'Pivigames Studio'}
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      <span>Publisher: </span>
                      <span className="text-white">
                        {steamData?.publishers?.length
                          ? steamData.publishers.join(', ')
                          : 'Pivigames Inc.'}
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      <span>Release: </span>
                      <span className="text-white">
                        {steamData?.release_date || 'Dec 15, 2024'}
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      <span>Price History: </span>
                      {steamData?.current_price && steamData?.lowest_recorded_price ? (
                        <span className="text-white">
                          <a 
                            href={`https://steamdb.info/app/${steamData.steam_appid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-400 transition-colors cursor-pointer underline decoration-dotted"
                          >
                            Current Price: {steamData.current_price}
                          </a>
                          {' | '}
                          <a 
                            href={`https://steamdb.info/app/${steamData.steam_appid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-400 transition-colors cursor-pointer underline decoration-dotted"
                          >
                            Lowest Recorded Price: {steamData.lowest_recorded_price}
                          </a>
                        </span>
                      ) : (
                        <span className="text-white">No disponible</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Platforms */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Available on</h4>
                  {loadingSteam ? (
                    <div className="h-5 w-24 bg-gray-700 animate-pulse rounded" />
                  ) : (
                    <div className="flex gap-3 text-sm text-gray-300">
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
                  <h4 className="text-gray-400 text-sm mb-2">Tags</h4>
                  {loadingSteam ? (
                    <div className="flex flex-wrap gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-6 w-16 bg-gray-700 animate-pulse rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {steamData?.categories?.length ? (
                        steamData.categories.slice(0, 8).map((category, index) => (
                          <span key={index} className="bg-[#333] text-gray-300 px-2 py-1 rounded text-xs">
                            {category}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="bg-[#333] text-gray-300 px-2 py-1 rounded text-xs">Action</span>
                          <span className="bg-[#333] text-gray-300 px-2 py-1 rounded text-xs">Adventure</span>
                          <span className="bg-[#333] text-gray-300 px-2 py-1 rounded text-xs">Open World</span>
                          <span className="bg-[#333] text-gray-300 px-2 py-1 rounded text-xs">RPG</span>
                          <span className="bg-[#333] text-gray-300 px-2 py-1 rounded text-xs">Story Rich</span>
                          <span className="bg-[#333] text-gray-300 px-2 py-1 rounded text-xs">Multiplayer</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Languages</h4>
                  {loadingSteam ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 animate-pulse rounded w-full" />
                      <div className="h-4 bg-gray-700 animate-pulse rounded w-2/3" />
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm">
                      {steamData?.languages?.length
                        ? steamData.languages.slice(0, 10).join(', ')
                        : 'English, Spanish, French, German, Japanese, Korean, Chinese'}
                    </p>
                  )}
                </div>

                {/* Social */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Share</h4>
                  <div className="flex gap-3">
                    <button className="bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded text-sm transition-colors">
                      Discord
                    </button>
                    <button className="bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded text-sm transition-colors">
                      Facebook
                    </button>
                    <button className="bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded text-sm transition-colors">
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Buy on Steam Widget - Full Width */}
            {loadingSteam ? (
              <div className="flex justify-center mt-8 px-6">
                <div className="w-[646px] h-[190px] bg-gray-700 animate-pulse rounded-lg" />
              </div>
            ) : steamData ? (
              <div className="flex justify-center mt-8 px-6">
                <iframe
                  src={`https://store.steampowered.com/widget/${steamData.steam_appid}/`}
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
          className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center"
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
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <X className="text-white w-6 h-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            {viewerIndex + 1} / {screenshots.length}
          </div>

          {/* Main image */}
          <div
            className="max-w-[90vw] max-h-[85vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={proxySteamImage(screenshots[viewerIndex])}
              alt={`Screenshot ${viewerIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>

          {/* Navigation arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prevViewerImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextViewerImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {screenshots.map((src, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setViewerIndex(index); }}
                className={`w-16 h-10 rounded overflow-hidden transition-all ${index === viewerIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
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
