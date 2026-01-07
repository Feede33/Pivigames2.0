'use client';

import { Plyr } from 'plyr-react';
import 'plyr/dist/plyr.css';
import { useState, useEffect } from 'react';

type Props = {
  url: string;
  playing: boolean;
};

// Extrae el ID del video de YouTube
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Detecta si es una URL directa de video (MP4, WebM, etc.)
function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

// Detecta si es una URL de HLS (M3U8)
function isHLSUrl(url: string): boolean {
  return /\.m3u8(\?.*)?$/i.test(url);
}

// Detecta si es una URL de DASH (MPD)
function isDASHUrl(url: string): boolean {
  return /\.mpd(\?.*)?$/i.test(url);
}

export default function VideoPlayer({ url }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  
  const videoId = getYouTubeId(url);
  const isDirectVideo = isDirectVideoUrl(url);
  const isHLS = isHLSUrl(url);
  const isDASH = isDASHUrl(url);

  // Simular carga del video
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [url]);

  // Si no es ningún formato válido, mostrar mensaje
  if (!videoId && !isDirectVideo && !isHLS && !isDASH) {
    console.warn('VideoPlayer: URL no válida', url);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="text-lg mb-2">URL de video no válida</p>
          <p className="text-sm text-gray-400">No se pudo cargar el trailer</p>
        </div>
      </div>
    );
  }

  // Para videos HLS (M3U8) - formato de Steam
  if (isHLS) {
    return (
      <div className="plyr-wrapper w-full h-full relative bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-white text-lg animate-pulse">Cargando video...</div>
          </div>
        )}
        <Plyr
          source={{
            type: 'video',
            sources: [
              {
                src: url,
                type: 'application/x-mpegURL',
              },
            ],
          }}
          options={{
            controls: [
              'play-large',
              'play',
              'progress',
              'current-time',
              'mute',
              'volume',
              'settings',
              'fullscreen',
            ],
            settings: ['quality', 'speed'],
            speed: {
              selected: 1,
              options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            },
            autoplay: true,
            clickToPlay: true,
            disableContextMenu: true,
            hideControls: false,
            resetOnEnd: false,
            keyboard: { focused: true, global: true },
            tooltips: { controls: true, seek: true },
            fullscreen: {
              enabled: true,
              fallback: true,
              iosNative: true,
            },
          }}
        />
      </div>
    );
  }

  // Para videos DASH (MPD)
  if (isDASH) {
    return (
      <div className="plyr-wrapper w-full h-full relative bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-white text-lg animate-pulse">Cargando video...</div>
          </div>
        )}
        <Plyr
          source={{
            type: 'video',
            sources: [
              {
                src: url,
                type: 'application/dash+xml',
              },
            ],
          }}
          options={{
            controls: [
              'play-large',
              'play',
              'progress',
              'current-time',
              'mute',
              'volume',
              'settings',
              'fullscreen',
            ],
            settings: ['quality', 'speed'],
            speed: {
              selected: 1,
              options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            },
            autoplay: true,
            clickToPlay: true,
            disableContextMenu: true,
            hideControls: false,
            resetOnEnd: false,
            keyboard: { focused: true, global: true },
            tooltips: { controls: true, seek: true },
            fullscreen: {
              enabled: true,
              fallback: true,
              iosNative: true,
            },
          }}
        />
      </div>
    );
  }

  // Para videos directos (Steam MP4/WebM)
  if (isDirectVideo) {
    return (
      <div className="plyr-wrapper w-full h-full relative bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-white text-lg animate-pulse">Cargando video...</div>
          </div>
        )}
        <Plyr
          source={{
            type: 'video',
            sources: [
              {
                src: url,
                type: url.endsWith('.webm') ? 'video/webm' : 'video/mp4',
              },
            ],
          }}
          options={{
            controls: [
              'play',
              'progress',
              'current-time',
              'mute',
              'volume',
              'settings',
              'fullscreen',
            ],
            settings: ['quality', 'speed'],
            speed: {
              selected: 1,
              options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            },
            autoplay: true,
            clickToPlay: true,
            disableContextMenu: true,
            hideControls: false,
            resetOnEnd: false,
            keyboard: { focused: true, global: true },
            tooltips: { controls: true, seek: true },
            fullscreen: {
              enabled: true,
              fallback: true,
              iosNative: true,
            },
          }}
        />
      </div>
    );
  }

  // Para videos de YouTube
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div 
      className="plyr-wrapper w-full h-full relative"
      style={{
        backgroundImage: `url(${thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-white text-lg animate-pulse">Cargando video...</div>
        </div>
      )}
      <Plyr
        source={{
          type: 'video',
          sources: [
            {
              src: videoId!,
              provider: 'youtube',
            },
          ],
        }}
        options={{
          controls: [
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'fullscreen',
          ],
          settings: ['quality', 'speed'],
          quality: {
            default: 1080,
            options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
            forced: true,
          },
          speed: {
            selected: 1,
            options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
          },
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
          },
          autoplay: true,
          clickToPlay: true,
          disableContextMenu: true,
          hideControls: false,
          resetOnEnd: false,
          keyboard: { focused: true, global: true },
          tooltips: { controls: true, seek: true },
          fullscreen: {
            enabled: true,
            fallback: true,
            iosNative: true,
          },
        }}
      />
    </div>
  );
}
