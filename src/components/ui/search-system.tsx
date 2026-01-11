'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { searchGames, enrichGameWithSteamData } from '@/lib/supabase';
import type { GameWithSteamData } from '@/lib/supabase';
import { useTranslations, type Locale } from '@/lib/i18n';

type SearchSystemProps = {
  games: GameWithSteamData[];
  allGamesCache: Map<number, GameWithSteamData[]>;
  onGameClickAction: (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => void;
  locale?: string;
};

export function SearchSystem({ games, allGamesCache, onGameClickAction, locale = 'es' }: SearchSystemProps) {
  const t = useTranslations(locale as Locale);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GameWithSteamData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Buscar en todos los juegos (incluyendo caché y base de datos)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Debounce
    const timer = setTimeout(async () => {
      const query = searchQuery.toLowerCase().trim();
      
      // Primero buscar en el caché local
      const allGames: GameWithSteamData[] = [];
      allGamesCache.forEach((gamesInPage) => {
        allGames.push(...gamesInPage);
      });

      // Si no hay juegos en caché, usar los actuales
      const gamesToSearch = allGames.length > 0 ? allGames : games;

      // Función para calcular relevancia
      const calculateRelevance = (game: GameWithSteamData): number => {
        const title = game.title.toLowerCase();
        const genre = game.genre.toLowerCase();
        
        // Coincidencia exacta con steam_appid
        if (game.steam_appid === query) return 1000;
        
        // Título empieza con el query
        if (title.startsWith(query)) return 100;
        
        // Título contiene el query al inicio de una palabra
        const words = title.split(/\s+/);
        if (words.some(word => word.startsWith(query))) return 50;
        
        // Título contiene el query
        if (title.includes(query)) return 25;
        
        // Género contiene el query
        if (genre.includes(query)) return 10;
        
        return 0;
      };

      // Buscar y ordenar por relevancia en caché
      let results = gamesToSearch
        .map(game => ({ game, relevance: calculateRelevance(game) }))
        .filter(({ relevance }) => relevance > 0)
        .sort((a, b) => {
          // Primero por relevancia
          if (b.relevance !== a.relevance) return b.relevance - a.relevance;
          // Luego alfabéticamente
          return a.game.title.localeCompare(b.game.title);
        })
        .map(({ game }) => game);

      // Si no hay resultados en caché o el query es largo, buscar en la base de datos
      if (results.length === 0 || query.length >= 3) {
        console.log('Searching database...');
        try {
          const dbResults = await searchGames(query, 10);
          
          // Enriquecer los resultados con datos de Steam
          const enrichedResults = await Promise.all(
            dbResults.map(game => enrichGameWithSteamData(game, locale))
          );
          
          // Combinar resultados del caché y la DB, eliminando duplicados
          const combinedResults = [...results];
          enrichedResults.forEach(dbGame => {
            if (!combinedResults.some(g => g.steam_appid === dbGame.steam_appid)) {
              combinedResults.push(dbGame);
            }
          });
          
          results = combinedResults;
          console.log('Total results:', results.length);
        } catch (error) {
          console.error('Error searching database:', error);
        }
      }

      setSearchResults(results.slice(0, 10)); // Limitar a 10 resultados
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, games, allGamesCache, locale]);

  const handleGameClick = (game: GameWithSteamData) => {
    // Crear un evento sintético para el modal
    const syntheticEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: window.innerWidth / 2 - 100,
          top: window.innerHeight / 2 - 100,
          width: 200,
          height: 200,
        }),
      },
    } as React.MouseEvent<HTMLDivElement>;

    onGameClickAction(game, syntheticEvent);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline text-sm">{t.search.button}</span>
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[400px] max-w-[90vw] bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search.placeholder}
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t.search.noResults}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-border">
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleGameClick(game)}
                    className="flex items-center gap-3 p-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <img
                      src={game.cover_image || game.image}
                      alt={game.title}
                      className="w-16 h-10 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = game.image_fallback || '';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{game.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{game.genre}</p>
                    </div>
                    <div className="text-xs text-green-500 font-bold">FREE</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t.search.typeToSearch}
              </div>
            )}
          </div>

          {/* Footer */}
          {searchResults.length > 0 && (
            <div className="p-2 border-t border-border bg-secondary/20 text-center text-xs text-muted-foreground">
              {t.search.showing} {searchResults.length} {searchResults.length === 1 ? t.search.result : t.search.results}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
