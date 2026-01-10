'use client';

import { Star } from 'lucide-react';
import { proxySteamImage } from '@/lib/image-proxy';
import type { GameWithSteamData } from '@/lib/supabase';
import type { TranslationKeys } from '@/lib/i18n';

type Props = {
  games: GameWithSteamData[];
  loading: boolean;
  t: any; // Acepta cualquier objeto de traducción
  onGameClick: (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function GamesGrid({ games, loading, t, onGameClick }: Props) {
  if (loading || games.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">{t.games.availableToDownload}</h3>
      </div>
      <div className="grid grid-cols-7 gap-6 pt-2">
        {games.map((game) => (
          <div
            key={game.id}
            className="group cursor-pointer"
            onClick={(e) => onGameClick(game, e)}
          >
            <div className="relative rounded-lg overflow-hidden mb-3 shadow-lg hover:scale-105 transition-all duration-300">
              <div className="aspect-[2/3] bg-gradient-to-br from-purple-900 to-blue-900">
                <img
                  src={proxySteamImage(game.image)}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  {game.genre}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition h-10">
                {game.title}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star fill="yellow" stroke="yellow" strokeWidth={0.5} size={14} />
                  {game.rating}
                </span>
                <span className="text-sm font-bold text-green-500">FREE</span>
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
