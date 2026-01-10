'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import WallpaperImage from './WallpaperImage';
import type { GameWithSteamData } from '@/lib/supabase';
import type { TranslationKeys } from '@/lib/i18n';

type Props = {
  games: GameWithSteamData[];
  loading: boolean;
  t: any; // Acepta cualquier objeto de traducción
  onGameClick: (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function HeroSlider({ games, loading, t, onGameClick }: Props) {
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
    <div className="relative h-[90vh] flex items-center overflow-hidden bg-black">
      {/* Wallpaper */}
      <WallpaperImage
        src={games[currentSlide].wallpaper}
        alt={games[currentSlide].title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
      />
      
      {/* Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-30 bg-background/50 hover:bg-background/80 p-3 rounded-full transition"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 z-30 bg-background/50 hover:bg-background/80 p-3 rounded-full transition"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-primary' : 'w-4 bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 px-8 pl-20 max-w-2xl">
        <h2 className="text-6xl font-bold mb-4">{games[currentSlide].title}</h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-success font-bold">
            {Math.round(games[currentSlide].rating * 10)}% {t.hero.match}
          </span>
          <span className="border border-border px-2 py-1 text-sm">18+</span>
          <span className="text-muted-foreground">2024</span>
          <span className="border border-border px-2 py-1 text-sm">4K</span>
        </div>
        <p className="text-lg mb-6 text-muted-foreground">
          {games[currentSlide].description}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() =>
              onGameClick(games[currentSlide], {
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
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition cursor-pointer"
          >
            <Play className="w-5 h-5" />
            {t.hero.play}
          </button>
          <button className="bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-secondary/80 transition cursor-pointer">
            <Info className="w-5 h-5" />
            {t.hero.report}
          </button>
        </div>
      </div>
    </div>
  );
}
