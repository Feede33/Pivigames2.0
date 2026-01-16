'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GameModal from '@/components/GameModal';
import UserProfile from '@/components/UserProfile';
import GamesGrid from '@/components/GamesGrid';
import LanguageSelector from '@/components/LanguageSelector';
import { SearchSystem } from '@/components/ui/search-system';
import { FuturisticLoginButtonCompact, FuturisticLoginButtonMobile } from '@/components/FuturisticLoginButton';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
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
} from '@/lib/supabase';
import { useTranslations, type Locale } from '@/lib/i18n';

export default function NoSteamGamesPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'es';
  const t = useTranslations(locale);
  const { user } = useAuth();

  const [modalGame, setModalGame] = useState<GameWithSteamData | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [games, setGames] = useState<GameWithSteamData[]>([]);
  const [gamesCache, setGamesCache] = useState<Map<number, GameWithSteamData[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [prefetchingPage, setPrefetchingPage] = useState<number | null>(null);
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    orderBy: 'popularity' as 'popularity' | 'rating' | 'name' | 'downloads' | 'release_date',
    platform: 'all',
    genre: 'all',
    minRating: 0,
  });
  const GAMES_PER_PAGE = 100;

  // Obtener el total de juegos sin Steam al inicio
  useEffect(() => {
    async function fetchTotalCount() {
      // TODO: Implementar función para contar solo juegos sin Steam
      const total = await getTotalGamesCount();
      setTotalGamesCount(total);
      console.log('Total non-Steam games in DB:', total);
    }
    fetchTotalCount();
  }, []);

  // Función para cargar y cachear una página
  const loadAndCachePage = async (pageNumber: number): Promise<GameWithSteamData[]> => {
    if (gamesCache.has(pageNumber)) {
      console.log(`Page ${pageNumber} loaded from cache`);
      return gamesCache.get(pageNumber)!;
    }

    console.log(`Loading page ${pageNumber} from API...`);
    // TODO: Implementar filtro para obtener solo juegos sin Steam
    const gamesFromDB = await getGames(pageNumber, GAMES_PER_PAGE);

    if (gamesFromDB.length === 0) {
      return [];
    }

    // Filtrar juegos que NO tienen steam_appid
    const nonSteamGames = gamesFromDB.filter(game => !game.steam_appid);

    // Cargar juegos en lotes de 50 simultáneos
    const enrichedGames: GameWithSteamData[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < nonSteamGames.length; i += BATCH_SIZE) {
      const batch = nonSteamGames.slice(i, i + BATCH_SIZE);

      const enrichedBatch = await Promise.all(
        batch.map((game) => enrichGameWithSteamData(game, locale))
      );

      enrichedGames.push(...enrichedBatch);

      if (i + BATCH_SIZE < nonSteamGames.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setGamesCache(prev => new Map(prev).set(pageNumber, enrichedGames));
    console.log(`Page ${pageNumber} cached with ${enrichedGames.length} non-Steam games`);

    return enrichedGames;
  };

  // Cargar juegos
  useEffect(() => {
    async function loadGames() {
      if (currentPage === 0) {
        setLoading(true);
      }

      try {
        const enrichedGames = await loadAndCachePage(currentPage);

        if (enrichedGames.length === 0) {
          setGames([]);
          if (currentPage === 0) setLoading(false);
          return;
        }

        setGames(enrichedGames);

        if (currentPage === 0) {
          setLoading(false);
        }

        // Prefetch de la siguiente página
        const totalPages = Math.ceil(totalGamesCount / GAMES_PER_PAGE);
        const nextPage = currentPage + 1;

        if (nextPage < totalPages && !gamesCache.has(nextPage) && prefetchingPage !== nextPage) {
          setPrefetchingPage(nextPage);
          console.log(`Prefetching page ${nextPage}...`);

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

    setCurrentPage(pageNumber);

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

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar filters={filters} onFilterChangeAction={handleFilterChange} locale={locale as 'es' | 'en'} />
      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-gradient-to-b from-background to-transparent px-4 md:px-8 py-3 md:py-4 border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-brand">Pegasusgames</h1>

            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-6 text-sm animate-fade-in animate-duration-500 animate-delay-300">
              <a href={`/${locale}`} className="hover:text-muted-foreground transition">
                {t.nav.discover}
              </a>
              <a href="#" className="hover:text-muted-foreground transition">
                {t.nav.browse}
              </a>
              <a href="#" className="hover:text-muted-foreground transition">
                {t.nav.offers}
              </a>
              <a href={`/${locale}/no-steam-games`} className="text-brand hover:text-brand/80 transition">
                No Steam Games
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">
            <SearchSystem
              games={games}
              allGamesCache={gamesCache}
              onGameClickAction={handleGameClick}
              locale={locale}
            />
            <LanguageSelector />
            {!user && <FuturisticLoginButtonCompact />}
            <UserProfile navOnly />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted/50 transition"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-2xl overflow-hidden animate-fade-in animate-duration-200">
            <div className="p-4 space-y-2">
              <a
                href={`/${locale}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg hover:bg-muted/50 transition text-sm font-medium"
              >
                {t.nav.discover}
              </a>
              <a
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg hover:bg-muted/50 transition text-sm font-medium"
              >
                {t.nav.browse}
              </a>
              <a
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg hover:bg-muted/50 transition text-sm font-medium"
              >
                {t.nav.offers}
              </a>
              <a
                href={`/${locale}/no-steam-games`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg hover:bg-muted/50 transition text-sm font-medium text-brand"
              >
                No Steam Games
              </a>

              {!user && (
                <div className="pt-2 border-t border-border/50">
                  <FuturisticLoginButtonMobile onClickAction={() => setMobileMenuOpen(false)} />
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-6 md:pt-8 pb-12 md:pb-16 px-4 md:px-8 bg-gradient-to-b from-background via-background/95 to-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-brand via-purple-500 to-pink-500 bg-clip-text text-transparent">
            No Steam Games
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            {locale === 'es' 
              ? 'Descubre juegos increíbles que no están disponibles en Steam. Una colección curada de títulos únicos e independientes.'
              : 'Discover amazing games that are not available on Steam. A curated collection of unique and independent titles.'}
          </p>

          {/* Active Filters Display */}
          <div className="mt-6 flex flex-wrap gap-2">
            {filters.orderBy !== 'popularity' && (
              <div className="px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-xs font-medium text-brand">
                {filters.orderBy}
              </div>
            )}
            {filters.platform !== 'all' && (
              <div className="px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-xs font-medium text-brand">
                {filters.platform}
              </div>
            )}
            {filters.genre !== 'all' && (
              <div className="px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-xs font-medium text-brand">
                {filters.genre}
              </div>
            )}
            {filters.minRating > 0 && (
              <div className="px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-xs font-medium text-brand">
                Rating: {filters.minRating}+
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-4 md:px-6 lg:px-8 pb-20 pt-10 space-y-8 md:space-y-12 bg-black">
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
          <div className="py-6 md:py-8">
            <Pagination>
              <PaginationContent className="flex-wrap gap-1 md:gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage - 1);
                    }}
                    className={`${currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} text-xs md:text-sm px-2 md:px-3`}
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
                        className="cursor-pointer text-xs md:text-sm w-8 h-8 md:w-10 md:h-10"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && (
                      <PaginationItem className="hidden sm:block">
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
                        className={`cursor-pointer relative text-xs md:text-sm w-8 h-8 md:w-10 md:h-10 ${isCached && pageNumber !== currentPage ? 'ring-1 ring-green-500/50' : ''}`}
                        title={isCached ? 'Página cacheada (carga instantánea)' : isPrefetching ? 'Precargando...' : ''}
                      >
                        {pageNumber + 1}
                        {isPrefetching && (
                          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {/* Última página */}
                {currentPage < Math.ceil(totalGamesCount / GAMES_PER_PAGE) - 3 && (
                  <>
                    {currentPage < Math.ceil(totalGamesCount / GAMES_PER_PAGE) - 4 && (
                      <PaginationItem className="hidden sm:block">
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
                        className="cursor-pointer text-xs md:text-sm w-8 h-8 md:w-10 md:h-10"
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
                    className={`${currentPage >= Math.ceil(totalGamesCount / GAMES_PER_PAGE) - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} text-xs md:text-sm px-2 md:px-3`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Modal */}
      <GameModal game={modalGame} origin={modalOrigin} onCloseAction={closeModal} locale={locale} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
