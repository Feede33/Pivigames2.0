'use client';

import { Plyr } from 'plyr-react';
import 'plyr/dist/plyr.css';

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

export default function VideoPlayer({ url }: Props) {
  const videoId = getYouTubeId(url);

  if (!videoId) return null;

  // Thumbnail de YouTube para el fondo blur
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div 
      className="plyr-wrapper w-full h-full"
      style={{
        backgroundImage: `url(${thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Plyr
        source={{
          type: 'video',
          sources: [
            {
              src: videoId,
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
