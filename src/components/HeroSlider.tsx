'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import WallpaperImage from './WallpaperImage';
import type { GameWithSteamData } from '@/lib/supabase';


type Props = {
  games: GameWithSteamData[];
  loading: boolean;
  t: any;
  onGameClickAction: (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function HeroSlider({ games, loading, t, onGameClickAction }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % games.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + games.length) % games.length);
  };

  if (loading) {
    return (
      <div className="relative h-[70vh] sm:h-[80vh] flex items-center justify-center">
        <div className="text-xl sm:text-2xl text-muted-foreground">{t.loading.games}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="relative h-[70vh] sm:h-[80vh] flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.empty.noGames}</h2>
          <p className="text-muted-foreground">{t.empty.addGames}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[90vh] flex items-center overflow-hidden bg-black">
      {/* Wallpaper */}
      <WallpaperImage
        src={games[currentSlide].wallpaper}
        alt={games[currentSlide].title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
      />

      {/* Gradientes optimizados para mobile */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 sm:via-black/70 md:via-black/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-32 md:h-40 bg-gradient-to-t from-black via-black/90 to-transparent z-10 pointer-events-none" />

      {/* Navigation Arrows - más pequeños en mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 p-2 md:p-3 rounded-full transition backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-1/2 translate-x-1/2 md:right-4 md:translate-x-0 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 p-2 md:p-3 rounded-full transition backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      {/* Slide Indicators - líneas horizontales */}
      <div className="absolute bottom-3 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-1 md:gap-1.5">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-[3px] rounded-sm transition-all duration-300 ${index === currentSlide
                ? 'w-6 md:w-8 bg-red-500'
                : 'w-6 md:w-8 bg-gray-400/40'
              }`}
          />
        ))}
      </div>

      {/* Content - optimizado para iPhone SE */}
      <div className="relative z-20 px-3 sm:px-4 md:px-8 lg:pl-20 max-w-full sm:max-w-xl md:max-w-2xl pb-16 sm:pb-20">
        <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-bold mb-1.5 sm:mb-2 md:mb-4 line-clamp-2 leading-tight">
          {games[currentSlide].title}
        </h2>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-4 flex-wrap">
          <span className="text-success font-bold text-xs sm:text-sm md:text-base">
            {Math.round(games[currentSlide].rating * 10)}% {t.hero.match}
          </span>
          <span className="text-gray-400 text-xs sm:text-sm">
            {games[currentSlide].release_year || 'N/A'}
          </span>
          <span className="border border-gray-500 px-1 py-0.5 text-[10px] sm:text-xs text-gray-300">
            {games[currentSlide].required_age ? `${games[currentSlide].required_age}+` : '18+'}
          </span>
          <span className="border border-gray-500 px-1 py-0.5 text-[10px] sm:text-xs text-gray-300">
            HD
          </span>
        </div>

        <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 md:mb-6 text-gray-300 line-clamp-2 sm:line-clamp-2 md:line-clamp-3 leading-relaxed">
          {games[currentSlide].description}
        </p>

        <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
          <button
            onClick={() =>
              onGameClickAction(games[currentSlide], {
                currentTarget: {
                  getBoundingClientRect: () => ({
                    left: window.innerWidth / 2 - 100,
                    top: window.innerHeight / 2 - 100,
                    width: 200,
                    height: 200,
                  }),
                },
              } as React.MouseEvent<HTMLDivElement>)
            }
            className="bg-white text-black px-3 sm:px-4 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-full font-bold text-xs sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2 hover:bg-gray-200 transition cursor-pointer"
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" />
            {t.hero.play}
          </button>
          <button className="bg-gray-700/80 text-white px-3 sm:px-4 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-full font-bold text-xs sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2 hover:bg-gray-600/80 transition cursor-pointer backdrop-blur-sm">
            <Info className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            {t.hero.report}
          </button>
        </div>
      </div>
    </div>
  );
}
