'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import type { GameWithSteamData } from '@/lib/supabase';
import { useTranslations, type Locale } from '@/lib/i18n';
import { useScreenSize } from '@/hooks/useScreenSize';
import { getResponsiveStyles } from './GameModal/styles';
import { getSteamLanguage } from '@/lib/steam-languages';
import {
  ModalHeader,
  HeroSection,
  InfoBadges,
  MainContent,
  Sidebar,
  ImageViewer,
} from './GameModal/index';
import CommentSection from './GameModal/CommentSection';

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
  locale?: string;
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
        setUserLocation(data);
      })
      .catch((err) => console.error('Error loading location:', err));
  }, []);

  // Cargar datos de Steam
  useEffect(() => {
    if (game?.steam_appid && userLocation) {
      setLoadingSteam(true);
      setSteamError(null);

      fetch(`/api/steam/${game.steam_appid}?cc=${userLocation.steam_country_code}&l=${locale}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })
        .then(async (res) => {
          const data = await res.json();

          if (data._fallback) {
            console.warn(`Steam API returned fallback data for ${game.steam_appid}:`, data._error);
            setSteamError(data._error || 'Unable to load Steam data');
            return;
          }

          if (!res.ok) {
            console.warn(`Steam API returned ${res.status} for ${game.steam_appid}, using fallback data`);
            setSteamError(`Steam API error: ${res.status}`);
            return;
          }

          if (data.error) {
            console.warn('Steam API error:', data.error, data.details);
            setSteamError(data.details || data.error);
            return;
          }

          setSteamData(data);
        })
        .catch((err) => {
          console.error(`Error loading Steam data for ${game.steam_appid}:`, err);
          setSteamError('Network error loading Steam data');
        })
        .finally(() => setLoadingSteam(false));
    }
  }, [game?.steam_appid, userLocation, locale]);

  // Screenshots y videos
  const screenshots = steamData?.screenshots?.length
    ? steamData.screenshots.map((s) => s.full)
    : game?.screenshots?.length
    ? game.screenshots
    : game?.wallpaper
    ? [game.wallpaper]
    : [];

  const videos = steamData?.videos?.length
    ? steamData.videos
    : game?.trailer
    ? [{ name: 'Trailer', mp4: { max: game.trailer } as { max: string } }]
    : [];

  const currentVideo = videos[currentVideoIndex] as any;

  const mediaItems = [
    ...screenshots.map((src, index) => ({ type: 'image' as const, src, index })),
    ...videos.map((video: any, index) => ({
      type: 'video' as const,
      src: video.thumbnail,
      videoUrl:
        video.hls ||
        video.dash ||
        video.mp4?.max ||
        video.mp4?.['480'] ||
        video.webm?.max ||
        video.webm?.['480'] ||
        '',
      videoIndex: index,
      index: screenshots.length + index,
    })),
  ];

  const getVideoUrl = () => {
    if (!currentVideo) return '';
    const hlsUrl = currentVideo.hls;
    const dashUrl = currentVideo.dash;
    const mp4Max = currentVideo.mp4?.max;
    const mp4_480 = currentVideo.mp4?.['480'];
    const webmMax = currentVideo.webm?.max;
    const webm480 = currentVideo.webm?.['480'];
    const trailerUrl = game?.trailer;
    return hlsUrl || dashUrl || mp4Max || mp4_480 || webmMax || webm480 || trailerUrl || '';
  };

  const videoUrl = getVideoUrl();
  const hasValidVideo = videoUrl && videoUrl.trim() !== '';

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (game) {
      requestAnimationFrame(() => setVisible(true));
      setCurrentVideoIndex(0);
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

  const handleMediaClick = (item: any) => {
    if (item.type === 'video' && item.videoUrl) {
      setCurrentVideoIndex(item.videoIndex || 0);
      setShowTrailer(true);
    } else {
      openViewer(item.index);
    }
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
        style={styles.modal.container}
        className={`bg-[#181818] rounded-lg overflow-hidden transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <ModalHeader onClose={handleClose} styles={styles} />

        <div className="max-h-[85vh] overflow-y-auto scrollbar-thin">
          <HeroSection
            game={game}
            loadingSteam={loadingSteam}
            showTrailer={showTrailer}
            hasValidVideo={hasValidVideo}
            videoUrl={videoUrl}
            currentVideoIndex={currentVideoIndex}
            screenSize={screenSize}
            styles={styles}
            t={t}
            onPlayTrailer={() => {
              setCurrentVideoIndex(0);
              setShowTrailer(true);
            }}
            onCloseTrailer={() => {
              setShowTrailer(false);
              setCurrentVideoIndex(0);
            }}
          />

          <div style={styles.content.padding}>
            <InfoBadges
              loadingSteam={loadingSteam}
              steamData={steamData}
              steamError={steamError}
              gameRating={game.rating}
              gameYear={game.release_year || undefined}
              styles={styles}
              t={t}
            />

            <div className="main-content-grid" style={{ display: 'grid' }}>
              <div style={{ maxHeight: '800px', overflowY: 'auto' }} className="scrollbar-thin">
                <MainContent
                  loadingSteam={loadingSteam}
                  steamData={steamData}
                  gameDescription={game.description}
                  mediaItems={mediaItems}
                  screenshotIndex={screenshotIndex}
                  styles={styles}
                  t={t}
                  onPrevScreenshot={prevScreenshot}
                  onNextScreenshot={nextScreenshot}
                  onSetScreenshotIndex={setScreenshotIndex}
                  onMediaClick={handleMediaClick}
                />
              </div>

              <div style={{ maxHeight: '800px', overflowY: 'auto' }} className="scrollbar-thin">
                <Sidebar
                  loadingSteam={loadingSteam}
                  steamData={steamData}
                  userLocation={userLocation}
                  gameGenre={game.genre}
                  gameRating={game.rating}
                  gameYear={game.release_year || undefined}
                  locale={locale}
                  styles={styles}
                  t={t}
                />
              </div>
            </div>

            {/* Steam Widget - Full width row for md and lg */}
            <div className="steam-widget-container">
              {loadingSteam ? (
                <div style={styles.widget.container}>
                  <div style={styles.widget.skeleton} className="bg-gray-700 animate-pulse rounded-lg" />
                </div>
              ) : steamData ? (
                <div style={styles.widget.container}>
                  <iframe
                    src={`https://store.steampowered.com/widget/${steamData.steam_appid}/?l=${locale}`}
                    style={styles.widget.iframe}
                    frameBorder="0"
                    title="Steam Widget"
                  />
                </div>
              ) : null}
            </div>

            {/* Comment Section - Full width row with optional sidebar on lg */}
            <div className="comment-section-grid" style={{ display: 'grid' }}>
              <CommentSection />
              
              {/* Sidebar placeholder for lg screens only */}
              {screenSize === 'lg' && (
                <div className="hidden lg:block">
                  <div className="bg-gray-800 rounded-lg p-4 h-[600px] animate-pulse">
                    {/* Skeleton para futuras promociones/thumbnails */}
                    <div className="space-y-4">
                      <div className="h-32 bg-gray-700 rounded"></div>
                      <div className="h-32 bg-gray-700 rounded"></div>
                      <div className="h-32 bg-gray-700 rounded"></div>
                      <div className="h-32 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageViewer
        isOpen={viewerOpen}
        screenshots={screenshots}
        currentIndex={viewerIndex}
        styles={styles}
        onClose={() => setViewerOpen(false)}
        onPrev={prevViewerImage}
        onNext={nextViewerImage}
        onSetIndex={setViewerIndex}
      />
    </div>,
    document.body
  );
}
