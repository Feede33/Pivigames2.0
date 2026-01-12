'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import WallpaperImage from './WallpaperImage';
import type { GameWithSteamData } from '@/lib/supabase';


type Props = {
  games: GameWithSteamData[];
  loading: boolean;
  t: any; // Acepta cualquier objeto de traducción
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
      <div className="relative h-[80vh] flex items-center justify-center">
        <div className="text-2xl text-muted-foreground">{t.loading.games}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="relative h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{t.empty.noGames}</h2>
          <p className="text-muted-foreground">{t.empty.addGames}</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="relative h-[60vh] md:h-[75vh] lg:h-[90vh] flex items-center overflow-hidden bg-black">
      {/* Wallpaper */}
      <WallpaperImage
        src={games[currentSlide].wallpaper}
        alt={games[currentSlide].title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
      />

      {/* Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 md:via-black/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 z-30 bg-background/50 hover:bg-background/80 p-2 md:p-3 rounded-full transition"
      >
        <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 z-30 bg-background/50 hover:bg-background/80 p-2 md:p-3 rounded-full transition"
      >
        <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all ${index === currentSlide ? 'w-6 md:w-8 bg-primary' : 'w-3 md:w-4 bg-muted-foreground/50'
              }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 px-4 md:px-8 lg:pl-20 max-w-full md:max-w-2xl">
        <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4 line-clamp-2">{games[currentSlide].title}</h2>
        <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4 flex-wrap">
          <span className="text-success font-bold text-sm md:text-base">
            {Math.round(games[currentSlide].rating * 10)}% {t.hero.match}
          </span>
          <span className="text-gray-400 text-xs md:text-sm">
            {games[currentSlide].release_year || 'N/A'}
          </span>
          <span className="border border-gray-500 px-1.5 py-0.5 text-xs text-gray-300">
            {games[currentSlide].required_age ? `${games[currentSlide].required_age}+` : '18+'}
          </span>
          <span className="border border-gray-500 px-1.5 py-0.5 text-xs text-gray-300">
            HD
          </span>
        </div>
        <p className="text-sm md:text-base lg:text-lg mb-4 md:mb-6 text-muted-foreground line-clamp-2 md:line-clamp-3">
          {games[currentSlide].description}
        </p>
        <div className="flex gap-2 md:gap-4 flex-wrap">
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
            className="bg-primary text-primary-foreground px-4 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-base flex items-center gap-2 hover:bg-primary/90 transition cursor-pointer"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5" />
            {t.hero.play}
          </button>
          <button className="bg-secondary text-secondary-foreground px-4 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-base flex items-center gap-2 hover:bg-secondary/80 transition cursor-pointer">
            <Info className="w-4 h-4 md:w-5 md:h-5" />
            {t.hero.report}
          </button>
        </div>
      </div>
    </div>
  );
}
