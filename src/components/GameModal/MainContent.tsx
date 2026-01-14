import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { proxySteamImage } from '@/lib/image-proxy';

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
    <div>
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
          <div style={styles.grid.features} className="grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 md:h-5 bg-gray-700 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div style={styles.grid.features} className="grid">
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
                    style={styles.slider.thumbnail}
                    className="flex-shrink-0 w-[calc(33.33%-4px)] md:w-[calc(33.33%-5px)] aspect-video bg-gray-700 rounded overflow-hidden cursor-pointer relative group"
                    onClick={() => onMediaClick(item)}
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
                  onClick={onPrevScreenshot}
                  className="absolute left-1 bottom-15 -translate-y-1/2 -translate-x-2 md:-translate-x-3 bg-black/80 hover:bg-black text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={onNextScreenshot}
                  className="absolute left-84 bottom-15 -translate-y-1/2 translate-x-2 md:translate-x-3 bg-black/80 hover:bg-black text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </>
            )}

            {/* Dots indicator */}
            <div style={{ ...styles.slider.dotGap, ...styles.slider.dotMargin }} className="flex justify-center">
              {Array.from({ length: Math.max(1, mediaItems.length - 2) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSetScreenshotIndex(index)}
                  style={styles.slider.dot}
                  className={`rounded-full transition-colors ${
                    index === screenshotIndex ? 'bg-white' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Requirements */}
      <div>
        <h3 style={styles.text.base} className="text-white font-semibold mb-3 md:mb-4">
          {t.modal.systemRequirements}
        </h3>
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
          <div style={styles.grid.requirements} className="grid">
            {/* MÍNIMO */}
            <div>
              <h4 className="text-gray-400 text-sm font-semibold mb-3">{t.modal.minimum}</h4>
              {steamData?.pc_requirements?.minimum ? (
                <div className="space-y-2 text-sm text-gray-300">
                  {steamData.pc_requirements.minimum
                    .split('\n')
                    .filter(Boolean)
                    .map((line, index) => (
                      <p key={index} className="leading-relaxed">
                        {line}
                      </p>
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
                  {steamData.pc_requirements.recommended
                    .split('\n')
                    .filter(Boolean)
                    .map((line, index) => (
                      <p key={index} className="leading-relaxed">
                        {line}
                      </p>
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
  );
}
