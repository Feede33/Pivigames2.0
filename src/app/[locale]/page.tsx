'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import GameModal from '@/components/GameModal';
import UserProfile from '@/components/UserProfile';
import HeroSlider from '@/components/HeroSlider';
import SteamOffers from '@/components/SteamOffers';
import GamesGrid from '@/components/GamesGrid';
import LanguageSelector from '@/components/LanguageSelector';
import { SearchSystem } from '@/components/ui/search-system';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  getGames,
  getTotalGamesCount,
  enrichGameWithSteamData,
  type GameWithSteamData,
  getSteamSpecials,
} from '@/lib/supabase';
import { useTranslations, type Locale } from '@/lib/i18n';

// Tipo para ofertas de Steam con datos enriquecidos
type SteamSpecialEnriched = {
  id: number;
  name: string;
  discount_percent: number;
  original_price: number;
  final_price: number;
  currency: string;
  header_image: string;
  capsule_image: string;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  hasDownloadLink?: boolean;
  downloadLink?: string | null;
};

export default function Home() {
  // Obtener locale desde useParams (client-side)
  const params = useParams();
  const locale = (params?.locale as Locale) || 'es';
  const t = useTranslations(locale);

  const [modalGame, setModalGame] = useState<GameWithSteamData | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [games, setGames] = useState<GameWithSteamData[]>([]);
  const [heroGames, setHeroGames] = useState<GameWithSteamData[]>([]);
  const [gamesCache, setGamesCache] = useState<Map<number, GameWithSteamData[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [prefetchingPage, setPrefetchingPage] = useState<number | null>(null);
  const [steamSpecials, setSteamSpecials] = useState<SteamSpecialEnriched[]>([]);
  const [userCountry, setUserCountry] = useState<string>('us');
  const [loadingSpecials, setLoadingSpecials] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  const GAMES_PER_PAGE = 100;

  // Detectar errores de autenticación en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      let message: string = t.auth.error;

      if (errorDescription?.includes('email')) {
        message = t.auth.emailRequired;
      } else if (error === 'access_denied') {
        message = t.auth.accessDenied;
      }

      setAuthError(message);

      // Limpiar la URL sin recargar la página
      window.history.replaceState({}, '', window.location.pathname);

      // Auto-ocultar después de 10 segundos
      setTimeout(() => setAuthError(null), 10000);
    }
  }, [t.auth]);

  // Obtener ubicación del usuario
  useEffect(() => {
    async function getUserLocation() {
      try {
        const response = await fetch('/api/geolocation');
        if (response.ok) {
          const data = await response.json();
          setUserCountry(data.steam_country_code || 'us');
          console.log('User country detected:', data.steam_country_code);
        }
      } catch (error) {
        console.error('Error getting user location:', error);
        setUserCountry('us');
      }
    }
    getUserLocation();
  }, []);

  // Cargar ofertas de Steam basadas en la ubicación del usuario
  useEffect(() => {
    async function loadSteamSpecials() {
      if (!userCountry) return;

      setLoadingSpecials(true);
      try {
        const response = await fetch(
          `/api/steam/specials?cc=${userCountry}&count=20&l=${locale}&t=${Date.now()}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch Steam specials');
        }

        const data = await response.json();
        const steamGames = data.games || [];

        // Obtener ofertas de Supabase para verificar cuáles tienen links
        const supabaseSpecials = await getSteamSpecials();
        const specialsMap = new Map(supabaseSpecials.map((s) => [s.steam_appid, s.links]));

        // Enriquecer ofertas de Steam con información de links
        // MOSTRAR TODAS las ofertas, tengan o no link de descarga
        const enrichedSpecials: SteamSpecialEnriched[] = steamGames.map((game: any) => ({
          ...game,
          hasDownloadLink:
            specialsMap.has(game.id.toString()) && !!specialsMap.get(game.id.toString()),
          downloadLink: specialsMap.get(game.id.toString()) || null,
        }));

        setSteamSpecials(enrichedSpecials);
        console.log('Steam specials loaded:', enrichedSpecials.length);
        console.log(
          'With download links:',
          enrichedSpecials.filter((s) => s.hasDownloadLink).length
        );
      } catch (error) {
        console.error('Error loading Steam specials:', error);
        setSteamSpecials([]);
      } finally {
        setLoadingSpecials(false);
      }
    }
    loadSteamSpecials();
  }, [userCountry, locale]);

  // Obtener el total de juegos al inicio
  useEffect(() => {
    async function fetchTotalCount() {
      const total = await getTotalGamesCount();
      setTotalGamesCount(total);
      console.log('Total games in DB:', total);
    }
    fetchTotalCount();
  }, []);

  // Función para cargar y cachear una página
  const loadAndCachePage = async (pageNumber: number): Promise<GameWithSteamData[]> => {
    // Si ya está en caché, retornarla
    if (gamesCache.has(pageNumber)) {
      console.log(`Page ${pageNumber} loaded from cache`);
      return gamesCache.get(pageNumber)!;
    }

    console.log(`Loading page ${pageNumber} from API...`);
    const gamesFromDB = await getGames(pageNumber, GAMES_PER_PAGE);
    
    if (gamesFromDB.length === 0) {
      return [];
    }

    // Cargar juegos en lotes de 50 simultáneos
    const enrichedGames: GameWithSteamData[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < gamesFromDB.length; i += BATCH_SIZE) {
      const batch = gamesFromDB.slice(i, i + BATCH_SIZE);
      
      const enrichedBatch = await Promise.all(
        batch.map((game) => enrichGameWithSteamData(game, locale))
      );
      
      enrichedGames.push(...enrichedBatch);
      
      // Pequeño delay entre lotes
      if (i + BATCH_SIZE < gamesFromDB.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Guardar en caché
    setGamesCache(prev => new Map(prev).set(pageNumber, enrichedGames));
    console.log(`Page ${pageNumber} cached with ${enrichedGames.length} games`);
    
    return enrichedGames;
  };

  // Cargar juegos desde Supabase y enriquecerlos con datos de Steam
  useEffect(() => {
    async function loadGames() {
      // Solo mostrar loading en la primera carga
      if (currentPage === 0) {
        setLoading(true);
      }
      
      try {
        // Cargar la página actual
        const enrichedGames = await loadAndCachePage(currentPage);
        
        if (enrichedGames.length === 0) {
          setGames([]);
          if (currentPage === 0) setLoading(false);
          return;
        }

        setGames(enrichedGames);
        
        // Solo en la primera página, guardar los primeros 10 juegos para el hero
        if (currentPage === 0 && heroGames.length === 0) {
          setHeroGames(enrichedGames.slice(0, 10));
          setHeroLoading(false);
          console.log('Hero games cached:', enrichedGames.slice(0, 10).length);
        }
        
        // Desactivar loading después de cargar la primera página
        if (currentPage === 0) {
          setLoading(false);
        }

        // Prefetch de la siguiente página en background
        const totalPages = Math.ceil(totalGamesCount / GAMES_PER_PAGE);
        const nextPage = currentPage + 1;
        
        if (nextPage < totalPages && !gamesCache.has(nextPage) && prefetchingPage !== nextPage) {
          setPrefetchingPage(nextPage);
          console.log(`Prefetching page ${nextPage}...`);
          
          // Cargar en background sin bloquear
          loadAndCachePage(nextPage).then(() => {
            console.log(`Page ${nextPage} prefetched successfully`);
            setPrefetchingPage(null);
          }).catch(err => {
            console.error(`Error prefetching page ${nextPage}:`, err);
            setPrefetchingPage(null);
          });
        }
      } catch (error) {
        console.error('Error loading games:', error);
        setGames([]);
      }
    }
    loadGames();
  }, [locale, currentPage, totalGamesCount]);

  // Función para cambiar de página
  const goToPage = (pageNumber: number) => {
    const totalPages = Math.ceil(totalGamesCount / GAMES_PER_PAGE);
    if (pageNumber < 0 || pageNumber >= totalPages || pageNumber === currentPage) return;
    
    // Si la página está en caché, el cambio será instantáneo
    if (gamesCache.has(pageNumber)) {
      console.log(`Instant page change to ${pageNumber} (from cache)`);
    } else {
      console.log(`Loading page ${pageNumber}...`);
    }
    
    setCurrentPage(pageNumber);
    
    // Scroll suave hasta el grid de juegos (después del hero)
    setTimeout(() => {
      const gamesSection = document.querySelector('[data-games-grid]');
      if (gamesSection) {
        gamesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handlers
  const handleGameClick = (
    game: GameWithSteamData,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    });
    setModalGame(game);
  };

  const closeModal = () => {
    setModalGame(null);
    setModalOrigin(null);
  };

  const handleSpecialClick = async (
    special: SteamSpecialEnriched,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    });

    // Crear un objeto temporal mientras se cargan los datos completos
    // Incluir el link de descarga si existe
    const tempGame: GameWithSteamData = {
      id: special.id,
      steam_appid: special.id.toString(),
      title: special.name,
      genre: t.common.loading,
      image: special.capsule_image,
      cover_image: special.header_image,
      rating: 0,
      wallpaper: special.header_image,
      description: t.loading.info,
      screenshots: [],
      links: special.downloadLink || undefined,
    };

    setModalGame(tempGame);

    // Cargar datos completos de Steam en segundo plano
    try {
      const response = await fetch(`/api/steam/${special.id}?cc=${userCountry}&l=${locale}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      
      if (response.ok) {
        const steamData = await response.json();

        const fullGame: GameWithSteamData = {
          id: special.id,
          steam_appid: special.id.toString(),
          title: steamData.name || special.name,
          genre: steamData.genres?.join(', ') || t.common.unknown,
          image: special.capsule_image,
          cover_image: special.header_image,
          rating: steamData.metacritic ? steamData.metacritic / 10 : 7.5,
          wallpaper: steamData.background || special.header_image,
          description: steamData.short_description || '',
          trailer:
            steamData.videos?.[0]?.mp4?.max || steamData.videos?.[0]?.mp4?.['480'] || '',
          screenshots: steamData.screenshots?.map((s: any) => s.full) || [],
          links: special.downloadLink || undefined,
        };

        setModalGame(fullGame);
      } else {
        // Si falla la API de Steam, mantener los datos básicos del special
        console.warn(`Steam API failed for ${special.id} (${response.status}), using basic data`);
        // El juego temporal ya está configurado, no hacer nada más
      }
    } catch (error) {
      console.error(`Error loading Steam data for ${special.id}:`, error);
      // Si hay error, mantener los datos básicos del special
      // El juego temporal ya está configurado, no hacer nada más
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-background to-transparent px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold text-brand">Pivigames2.0</h1>
            <div className="hidden md:flex gap-6 text-sm">
              <a href="#" className="hover:text-muted-foreground transition">
                {t.nav.discover}
              </a>
              <a href="#" className="hover:text-muted-foreground transition">
                {t.nav.browse}
              </a>
              <a href="#" className="hover:text-muted-foreground transition">
                {t.nav.offers}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SearchSystem 
              games={games}
              allGamesCache={gamesCache}
              onGameClickAction={handleGameClick}
              locale={locale}
            />
            <LanguageSelector />
            <UserProfile />
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <HeroSlider games={heroGames} loading={heroLoading} t={t as any} onGameClickAction={handleGameClick} />

      {/* Content */}
      <div className="relative px-8 pb-20 pt-10 space-y-12 bg-black">
        {/* Steam Offers */}
        <SteamOffers
          specials={steamSpecials}
          loading={loadingSpecials}
          t={t as any}
          onSpecialClick={handleSpecialClick}
        />

        {/* Games Grid */}
        <GamesGrid 
          games={games} 
          loading={loading} 
          t={t as any} 
          onGameClickAction={handleGameClick}
          loadedCount={games.length}
          totalCount={totalGamesCount}
        />

        {/* Paginación */}
        {totalGamesCount > GAMES_PER_PAGE && (
          <div className="py-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage - 1);
                    }}
                    className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {/* Primera página */}
                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(0);
                        }}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}
                
                {/* Páginas alrededor de la actual */}
                {Array.from({ length: 5 }, (_, i) => {
                  const pageNumber = currentPage - 2 + i;
                  const totalPages = Math.ceil(totalGamesCount / GAMES_PER_PAGE);
                  
                  if (pageNumber < 0 || pageNumber >= totalPages) return null;
                  
                  const isCached = gamesCache.has(pageNumber);
                  const isPrefetching = prefetchingPage === pageNumber;
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                        className={`cursor-pointer relative ${isCached && pageNumber !== currentPage ? 'ring-1 ring-green-500/50' : ''}`}
                        title={isCached ? 'Página cacheada (carga instantánea)' : isPrefetching ? 'Precargando...' : ''}
                      >
                        {pageNumber + 1}
                        {isPrefetching && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {/* Última página */}
                {currentPage < Math.ceil(totalGamesCount / GAMES_PER_PAGE) - 3 && (
                  <>
                    {currentPage < Math.ceil(totalGamesCount / GAMES_PER_PAGE) - 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(Math.ceil(totalGamesCount / GAMES_PER_PAGE) - 1);
                        }}
                        className="cursor-pointer"
                      >
                        {Math.ceil(totalGamesCount / GAMES_PER_PAGE)}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage + 1);
                    }}
                    className={currentPage >= Math.ceil(totalGamesCount / GAMES_PER_PAGE) - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
          
          </div>
        )}
      </div>

      {/* Modal */}
      <GameModal game={modalGame} origin={modalOrigin} onCloseAction={closeModal} locale={locale} />

      {/* Error de autenticación */}
      {authError && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4">
          <div className="bg-[#f23f43] text-white rounded-lg shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">Error de Autenticación</h3>
              <p className="text-sm opacity-90">{authError}</p>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
