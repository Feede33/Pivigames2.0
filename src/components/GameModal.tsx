'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { X, Play, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Game } from '@/lib/supabase';

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
  is_free: boolean;
  steam_appid: number;
};

type Props = {
  game: Game | null;
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
  const [steamData, setSteamData] = useState<SteamData | null>(null);
  const [loadingSteam, setLoadingSteam] = useState(false);

  // Cargar datos de Steam si existe steam_appid
  useEffect(() => {
    if (game?.steam_appid) {
      setLoadingSteam(true);
      fetch(`/api/steam/${game.steam_appid}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setSteamData(data);
          }
        })
        .catch((err) => console.error('Error loading Steam data:', err))
        .finally(() => setLoadingSteam(false));
    }
  }, [game?.steam_appid]);

  // Screenshots - prioriza Steam, luego los del game, luego wallpaper
  const screenshots = steamData?.screenshots?.length
    ? steamData.screenshots.map((s) => s.full)
    : game?.screenshots?.length
    ? game.screenshots
    : [game?.wallpaper].filter(Boolean) as string[];

  // Videos - prioriza Steam, luego el trailer del game
  const videos = steamData?.videos?.length
    ? steamData.videos
    : game?.trailer
    ? [{ name: 'Trailer', mp4: { max: game.trailer } as { max: string } }]
    : [];

  const currentVideo = videos[0]; // Por ahora mostramos el primer video

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (game) {
      requestAnimationFrame(() => setVisible(true));
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
    setScreenshotIndex((prev) => (prev + 1) % Math.max(1, screenshots.length - 2));
  };

  const prevScreenshot = () => {
    setScreenshotIndex((prev) => (prev - 1 + Math.max(1, screenshots.length - 2)) % Math.max(1, screenshots.length - 2));
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
      className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-200 ${
        visible ? 'bg-black/85' : 'bg-black/0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-[1100px] min-h-[850px] bg-[#181818] rounded-lg overflow-hidden transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
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
            {/* Wallpaper - siempre presente pero con fade */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
                showTrailer ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ backgroundImage: `url(${game.wallpaper})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent transition-opacity duration-500 ${
              showTrailer ? 'opacity-0' : 'opacity-100'
            }`} />
            
            {/* Video de YouTube con ReactPlayer */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${
              showTrailer && currentVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              {showTrailer && currentVideo && (
                <VideoPlayer 
                  url={currentVideo.mp4?.max || (currentVideo.mp4 as any)?.['480'] || game.trailer || ''} 
                  playing={showTrailer} 
                />
              )}
            </div>

            {/* Título y botones sobre el wallpaper */}
            <div className={`absolute bottom-5 left-6 right-6 z-10 transition-all duration-500 ${
              showTrailer ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
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
                    Download
                  </a>
                )}
                {(currentVideo || game.trailer) && (
                  <button 
                    onClick={() => setShowTrailer(true)}
                    className="px-7 py-2.5 rounded-full bg-gray-500/70 text-white border-none font-bold text-[15px] cursor-pointer flex items-center gap-2 hover:bg-gray-500/90 transition-colors"
                  >
                    <Play className="w-[18px] h-[18px]" />
                    Trailer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Título y botones cuando el trailer está activo */}
          <div className={`overflow-hidden transition-all duration-500 ease-out ${
            showTrailer ? 'max-h-[120px] opacity-100' : 'max-h-0 opacity-0'
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
                    Download
                  </a>
                )}
                {(currentVideo || game.trailer) && (
                  <button 
                    onClick={() => setShowTrailer(false)}
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
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-[2fr_1fr] gap-8">
              {/* Left column */}
              <div>
                <p className="text-gray-200 leading-relaxed text-base mb-6">
                  {steamData?.short_description || game.description}
                </p>

                {/* Features section */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Game Features</h3>
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
                </div>

                {/* Screenshots section with slider */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">
                    Screenshots
                    {loadingSteam && <span className="text-gray-500 text-sm ml-2">(Cargando desde Steam...)</span>}
                    {steamData && <span className="text-green-500 text-sm ml-2">✓ Steam</span>}
                  </h3>
                  <div className="relative">
                    {/* Slider container */}
                    <div className="overflow-hidden rounded-lg">
                      <div 
                        className="flex gap-2 transition-transform duration-300"
                        style={{ transform: `translateX(-${screenshotIndex * 33.33}%)` }}
                      >
                        {screenshots.map((src, index) => (
                          <div 
                            key={index}
                            className="flex-shrink-0 w-[calc(33.33%-5px)] aspect-video bg-gray-700 rounded overflow-hidden cursor-pointer"
                            onClick={() => openViewer(index)}
                          >
                            <div 
                              className="w-full h-full bg-cover bg-center hover:scale-110 transition-transform duration-300"
                              style={{ backgroundImage: `url(${src})` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Navigation arrows */}
                    {screenshots.length > 3 && (
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
                      {Array.from({ length: Math.max(1, screenshots.length - 2) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setScreenshotIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === screenshotIndex ? 'bg-white' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Requirements */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg">REQUISITOS DEL SISTEMA</h3>
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
                          <p><span className="text-gray-400">SO:</span> {game.min_os || 'Windows 10'}</p>
                          <p><span className="text-gray-400">PROCESADOR:</span> {game.min_cpu || 'Intel i5-6600'}</p>
                          <p><span className="text-gray-400">MEMORIA:</span> {game.min_ram || '8 GB de RAM'}</p>
                          <p><span className="text-gray-400">GRÁFICOS:</span> {game.min_gpu || 'GTX 1060'}</p>
                          <p><span className="text-gray-400">ALMACENAMIENTO:</span> {game.min_storage || '50 GB'}</p>
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
                          <p><span className="text-gray-400">SO:</span> {game.rec_os || 'Windows 11'}</p>
                          <p><span className="text-gray-400">PROCESADOR:</span> {game.rec_cpu || 'Intel i7-10700'}</p>
                          <p><span className="text-gray-400">MEMORIA:</span> {game.rec_ram || '16 GB de RAM'}</p>
                          <p><span className="text-gray-400">GRÁFICOS:</span> {game.rec_gpu || 'RTX 3070'}</p>
                          <p><span className="text-gray-400">ALMACENAMIENTO:</span> {game.rec_storage || '50 GB SSD'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buy on Steam Section */}
                {steamData && (
                  <div className="mt-8 bg-gradient-to-r from-[#1b2838] to-[#2a475e] rounded-lg p-6 border border-[#3d5a73]">
                    <div className="flex items-start gap-6">
                      {/* Game Logo/Icon placeholder */}
                      <div className="flex-shrink-0 w-32 h-32 bg-white rounded overflow-hidden">
                        <img 
                          src={game.image} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-white text-2xl font-bold">
                            Buy {game.title} on Steam
                          </h3>
                          <img 
                            src="https://store.cloudflare.steamstatic.com/public/shared/images/header/logo_steam.svg?t=962016" 
                            alt="Steam"
                            className="h-6 opacity-80"
                          />
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          {steamData.short_description || game.description}
                        </p>

                        {/* Platform icons */}
                        <div className="flex gap-2 mb-4">
                          {steamData.platforms.windows && (
                            <div className="w-6 h-6 text-gray-400" title="Windows">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0,0 L10,0 L10,10 L0,10 Z M11,0 L24,0 L24,10 L11,10 Z M0,11 L10,11 L10,24 L0,24 Z M11,11 L24,11 L24,24 L11,24 Z"/>
                              </svg>
                            </div>
                          )}
                          {steamData.platforms.mac && (
                            <div className="w-6 h-6 text-gray-400" title="Mac">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                              </svg>
                            </div>
                          )}
                          {steamData.platforms.linux && (
                            <div className="w-6 h-6 text-gray-400" title="Linux">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14.62,8.35C14.2,8.63 12.87,9.39 12.67,9.54C12.28,9.85 11.92,9.83 11.53,9.53C11.33,9.37 10,8.61 9.58,8.34C9.1,8.03 9.13,7.64 9.66,7.42C11.3,6.73 12.94,6.78 14.57,7.45C15.06,7.66 15.08,8.05 14.62,8.35M21.84,15.63C20.91,13.54 19.64,11.64 18,9.97C17.47,9.42 17.14,8.8 16.94,8.09C16.84,7.76 16.77,7.42 16.7,7.08C16.5,6.2 16.41,5.3 16,4.47C15.27,2.89 14,2.07 12.16,2C10.35,2.05 9.05,2.88 8.32,4.47C7.88,5.32 7.79,6.23 7.59,7.12C7.5,7.5 7.43,7.9 7.29,8.26C7.1,8.78 6.81,9.22 6.41,9.63C4.75,11.28 3.5,13.19 2.59,15.29C2.33,15.87 2.1,16.47 2.04,17.1C1.85,19.03 3.1,20.69 5.04,20.89C5.68,20.96 6.27,20.78 6.85,20.59C7.38,20.42 7.88,20.17 8.39,19.95C9.67,19.41 11,19.14 12.41,19.14C13.83,19.14 15.16,19.41 16.44,19.95C16.95,20.17 17.45,20.42 17.98,20.59C18.56,20.78 19.15,20.96 19.79,20.89C21.73,20.69 22.98,19.03 22.79,17.1C22.73,16.47 22.5,15.87 22.24,15.29C22.15,15.09 22,14.86 21.84,15.63M9.5,10.56C9.91,11 10.5,11.26 11.14,11.26C11.78,11.26 12.37,11 12.78,10.56C13.2,10.12 13.44,9.5 13.44,8.85C13.44,8.2 13.2,7.58 12.78,7.14C12.37,6.7 11.78,6.44 11.14,6.44C10.5,6.44 9.91,6.7 9.5,7.14C9.08,7.58 8.84,8.2 8.84,8.85C8.84,9.5 9.08,10.12 9.5,10.56Z"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Price and Button */}
                        <div className="flex items-center justify-between">
                          <div>
                            {steamData.is_free ? (
                              <div className="text-2xl font-bold text-green-400">
                                Free to Play
                              </div>
                            ) : steamData.price_info ? (
                              <div className="flex items-center gap-3">
                                {steamData.price_info.discount_percent > 0 && (
                                  <div className="bg-[#4c6b22] text-[#beee11] px-2 py-1 text-sm font-bold">
                                    -{steamData.price_info.discount_percent}%
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {steamData.price_info.discount_percent > 0 && (
                                    <span className="text-gray-500 line-through text-sm">
                                      {steamData.price_info.initial_formatted}
                                    </span>
                                  )}
                                  <span className="text-2xl font-bold text-[#beee11]">
                                    {steamData.price_info.final_formatted}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">
                                Price not available
                              </div>
                            )}
                          </div>

                          <a
                            href={`https://store.steampowered.com/app/${steamData.steam_appid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#5c7e10] hover:bg-[#6c9310] text-white px-8 py-3 rounded font-bold text-lg transition-colors flex items-center gap-2"
                          >
                            Buy on Steam
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Sidebar */}
              <div className="space-y-6">
                {/* Game info */}
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
                    <span className="text-white">
                      {steamData?.metacritic 
                        ? `⭐ ${steamData.metacritic}/100 (Metacritic)` 
                        : `⭐ ${game.rating}/10`}
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
                  {steamData?.price && (
                    <p className="text-gray-500 text-sm">
                      <span>Price: </span>
                      <span className="text-white">{steamData.price}</span>
                    </p>
                  )}
                  
                </div>

                {/* Platforms */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Available on</h4>
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
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Tags</h4>
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
                </div>

                {/* Languages */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Languages</h4>
                  <p className="text-gray-300 text-sm">
                    {steamData?.languages?.length 
                      ? steamData.languages.slice(0, 10).join(', ') 
                      : 'English, Spanish, French, German, Japanese, Korean, Chinese'}
                  </p>
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
              src={screenshots[viewerIndex]} 
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
                className={`w-16 h-10 rounded overflow-hidden transition-all ${
                  index === viewerIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${src})` }}
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
