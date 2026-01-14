import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { proxySteamImage } from '@/lib/image-proxy';

type Props = {
  isOpen: boolean;
  screenshots: string[];
  currentIndex: number;
  styles: any;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSetIndex: (index: number) => void;
};

export default function ImageViewer({
  isOpen,
  screenshots,
  currentIndex,
  styles,
  onClose,
  onPrev,
  onNext,
  onSetIndex,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={styles.viewer.padding}
      className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={styles.viewer.closeButton}
        className="absolute bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50"
      >
        <X style={styles.viewer.closeIcon} className="text-white" />
      </button>

      {/* Image counter */}
      <div style={styles.viewer.counter} className="absolute text-white/70">
        {currentIndex + 1} / {screenshots.length}
      </div>

      {/* Main image */}
      <div style={styles.viewer.image} className="rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <img
          src={proxySteamImage(screenshots[currentIndex])}
          alt={`Screenshot ${currentIndex + 1}`}
          style={styles.viewer.image}
          className="max-w-full object-contain"
        />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        style={{ ...styles.viewer.arrowLeft, ...styles.viewer.arrow }}
        className="absolute top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft style={styles.viewer.arrowIcon} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        style={{ ...styles.viewer.arrowRight, ...styles.viewer.arrow }}
        className="absolute top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight style={styles.viewer.arrowIcon} />
      </button>

      {/* Thumbnails */}
      <div style={styles.viewer.thumbnails} className="absolute left-1/2 -translate-x-1/2 flex overflow-x-auto max-w-[95vw] px-2">
        {screenshots.map((src, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onSetIndex(index);
            }}
            style={styles.viewer.thumbnail}
            className={`flex-shrink-0 rounded overflow-hidden transition-all ${
              index === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
            }`}
          >
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${proxySteamImage(src)})` }} />
          </button>
        ))}
      </div>
    </div>
  );
}
