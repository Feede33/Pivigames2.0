'use client';

import { Star } from 'lucide-react';
import { proxySteamImage } from '@/lib/image-proxy';
import type { GameWithSteamData } from '@/lib/supabase';

type Props = {
  games: GameWithSteamData[];
  loading: boolean;
  t: any; // Acepta cualquier objeto de traducción
  onGameClickAction: (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => void;
  loadedCount?: number;
  totalCount?: number;
};

export default function GamesGrid({ games, loading, t, onGameClickAction, loadedCount, totalCount }: Props) {
  if (games.length === 0 && !loading) {
    return null;
  }

  return (
    <section data-games-grid>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold">{t.games.availableToDownload}</h3>
        
         
       
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-6 pt-2">
        {games.map((game) => (
          <div
            key={game.id}
            className="group cursor-pointer"
            onClick={(e) => onGameClickAction(game, e)}
          >
            <div className="relative rounded-lg overflow-hidden mb-3 shadow-lg hover:animate-fade-in animate-delay-100 animate-duration-300">
              <div className="aspect-[2/3] bg-gradient-to-br from-purple-900 to-blue-900">
                <img
                  src={proxySteamImage(game.image)}
                  alt={game.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si library_600x900 falla, usar el fallback (header_image o wallpaper)
                    const target = e.target as HTMLImageElement;
                    const fallbackSrc = game.image_fallback ? proxySteamImage(game.image_fallback) : '';
                    
                    // Solo cambiar si tenemos fallback y no lo hemos intentado
                    if (fallbackSrc && !target.dataset.fallbackAttempted) {
                      target.dataset.fallbackAttempted = 'true';
                      target.src = fallbackSrc;
                    }
                  }}
                />
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  {game.genre}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-xs md:text-sm line-clamp-2 group-hover:text-primary transition min-h-[2.5rem] md:h-10">
                {game.title}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star fill="yellow" stroke="yellow" strokeWidth={0.5} size={12} className="md:w-[14px] md:h-[14px]" />
                  <span className="text-[10px] md:text-xs">{game.rating}</span>
                </span>
                <span className="text-xs md:text-sm font-bold text-green-500">FREE</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Cargando más juegos...</div>
        </div>
      )}
    </section>
  );
}
