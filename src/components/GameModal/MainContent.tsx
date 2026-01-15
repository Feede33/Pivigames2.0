import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { proxySteamImage } from '@/lib/image-proxy';
import { formatSteamRequirements } from '@/lib/security';

type SteamData = {
  short_description: string | null;
  categories: string[];
  pc_requirements: {
    minimum: string | null;
    recommended: string | null;
  };
};

type MediaItem = {
  type: 'image' | 'video';
  src: string;
  videoUrl?: string;
  videoIndex?: number;
  index: number;
};

type Props = {
  loadingSteam: boolean;
  steamData: SteamData | null;
  gameDescription: string;
  mediaItems: MediaItem[];
  screenshotIndex: number;
  styles: any;
  t: any;
  onPrevScreenshot: () => void;
  onNextScreenshot: () => void;
  onSetScreenshotIndex: (index: number) => void;
  onMediaClick: (item: MediaItem) => void;
};

export default function MainContent({
  loadingSteam,
  steamData,
  gameDescription,
  mediaItems,
  screenshotIndex,
  styles,
  t,
  onPrevScreenshot,
  onNextScreenshot,
  onSetScreenshotIndex,
  onMediaClick,
}: Props) {
  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      {loadingSteam ? (
        <div style={styles.content.spacingLarge} className="space-y-2">
          <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-full" />
          <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-full" />
          <div className="h-3 md:h-4 bg-gray-700 animate-pulse rounded w-3/4" />
        </div>
      ) : (
        <p style={{ ...styles.text.sm, ...styles.content.spacingLarge }} className="text-gray-200 leading-relaxed">
          {steamData?.short_description || gameDescription}
        </p>
      )}

      {/* Features section */}
      <div style={styles.content.spacingLarge}>
        <h3 style={styles.text.heading} className="text-white font-semibold mb-2 md:mb-3">
          {t.modal.gameFeatures}
        </h3>
        {loadingSteam ? (
          <div style={styles.grid.features}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 md:h-5 bg-gray-700 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div style={styles.grid.features}>
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
      <div style={styles.content.spacingLarge}>
        <h3 style={styles.text.heading} className="text-white font-semibold mb-2 md:mb-3">
          {t.modal.screenshotsVideos}
          {loadingSteam && <span className="text-gray-500 text-sm ml-2">({t.common.loading})</span>}
          {steamData && <span className="text-green-500 text-sm ml-2">✓ Steam</span>}
        </h3>
        {loadingSteam ? (
          <div className="relative">
            <div className="overflow-hidden rounded-lg">
              <div className="flex gap-2 md:gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[calc(25%-6px)] md:w-[calc(25%-9px)] aspect-video bg-gray-700 animate-pulse rounded"
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-1.5 md:gap-2 mt-3 md:mt-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-gray-700 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative" style={{ padding: '0 3rem' }}>
            {/* Slider container with overflow hidden */}
            <div className="relative overflow-hidden rounded-lg" style={{ width: '100%' }}>
              <div
                className="flex gap-3 md:gap-2 transition-all duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(calc(-${screenshotIndex * 100}% - ${screenshotIndex * 16}px))`,
                }}
              >
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 aspect-video bg-gray-700 overflow-hidden cursor-pointer relative group"
                    style={{
                      width: 'calc(25% - 12px)',
                      borderRadius: '10px',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.5)',
                      minWidth: '280px',
                      minHeight: "158px"
                    }}
                    onClick={() => onMediaClick(item)}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundImage: `url(${proxySteamImage(item.src)})` }}
                    />
                    {/* Indicador de video */}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                        <div className="bg-white/90 rounded-full p-3 md:p-4 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 md:w-6 md:h-6 text-black" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows - Outside overflow container */}
            {mediaItems.length > 4 && (
              <>
                <button
                  onClick={onPrevScreenshot}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all duration-200 z-20 hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  onClick={onNextScreenshot}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all duration-200 z-20 hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </>
            )}

            {/* Dots indicator */}
            {mediaItems.length > 4 && (
              <div className="flex justify-center gap-2 md:gap-2.5 mt-3 md:mt-4">
                {Array.from({ length: Math.ceil(mediaItems.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onSetScreenshotIndex(index)}
                    className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                      index === screenshotIndex ? 'bg-white scale-125' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Requirements */}
      <div>
        <h3 style={styles.text.base} className="text-white font-semibold mb-3 md:mb-4">
          {t.modal.systemRequirements}
        </h3>
        {loadingSteam ? (
          <div className="requirements-grid">
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
          <div className="requirements-grid">
            {/* MÍNIMO */}
            <div>
              <h4 className="text-gray-400 text-sm font-semibold mb-3">{t.modal.minimum}</h4>
              {steamData?.pc_requirements?.minimum ? (
                <div
                  className="steam-requirements text-sm text-gray-300"
                  dangerouslySetInnerHTML={{ __html: formatSteamRequirements(steamData.pc_requirements.minimum) }}
                />
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
                <div
                  className="steam-requirements text-sm text-gray-300"
                  dangerouslySetInnerHTML={{ __html: formatSteamRequirements(steamData.pc_requirements.recommended) }}
                />
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
  );
}
