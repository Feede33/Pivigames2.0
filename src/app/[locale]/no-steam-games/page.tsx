'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GameModal from '@/components/GameModal';
import UserProfile from '@/components/UserProfile';
import GamesGrid from '@/components/GamesGrid';
import LanguageSelector from '@/components/LanguageSelector';
import { SearchSystem } from '@/components/ui/search-system';
import { 
  Gift, 
  Library, 
  Users, 
  Star, 
  Flame, 
  SkipForward, 
  Calendar, 
  Trophy, 
  BarChart3, 
  Crown 
} from 'lucide-react';
import { FuturisticLoginButtonCompact, FuturisticLoginButtonMobile } from '@/components/FuturisticLoginButton';
import {
  Pagination,
  PaginationContent,
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

export const dynamic = 'force-dynamic';

export default function NoSteamGamesPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'es';
  const t = useTranslations(locale);
  const { user } = useAuth();

  const [modalGame, setModalGame] = useState<GameWithSteamData | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number; width: number; height: number; } | null>(null);
  const [games, setGames] = useState<GameWithSteamData[]>([]);
  const [gamesCache, setGamesCache] = useState<Map<number, GameWithSteamData[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [prefetchingPage, setPrefetchingPage] = useState<number | null>(null);
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const GAMES_PER_PAGE = 100;

  useEffect(() => {
    async function fetchTotalCount() {
      const total = await getTotalGamesCount();
      setTotalGamesCount(total);
    }
    fetchTotalCount();
  }, []);

  const loadAndCachePage = async (pageNumber: number): Promise<GameWithSteamData[]> => {
    if (gamesCache.has(pageNumber)) return gamesCache.get(pageNumber)!;
    const gamesFromDB = await getGames(pageNumber, GAMES_PER_PAGE);
    if (gamesFromDB.length === 0) return [];
    const nonSteamGames = gamesFromDB.filter(game => !game.steam_appid);
    const enrichedGames: GameWithSteamData[] = [];
    const BATCH_SIZE = 50;
    for (let i = 0; i < nonSteamGames.length; i += BATCH_SIZE) {
      const batch = nonSteamGames.slice(i, i + BATCH_SIZE);
      const enrichedBatch = await Promise.all(batch.map((game) => enrichGameWithSteamData(game, locale)));
      enrichedGames.push(...enrichedBatch);
      if (i + BATCH_SIZE < nonSteamGames.length) await new Promise(resolve => setTimeout(resolve, 500));
    }
    setGamesCache(prev => new Map(prev).set(pageNumber, enrichedGames));
    return enrichedGames;
  };

  useEffect(() => {
    async function loadGames() {
      if (currentPage === 0) setLoading(true);
      try {
        const enrichedGames = await loadAndCachePage(currentPage);
        setGames(enrichedGames);
        if (currentPage === 0) setLoading(false);
        const totalPages = Math.ceil(totalGamesCount / GAMES_PER_PAGE);
        const nextPage = currentPage + 1;
        if (nextPage < totalPages && !gamesCache.has(nextPage) && prefetchingPage !== nextPage) {
          setPrefetchingPage(nextPage);
          loadAndCachePage(nextPage).then(() => setPrefetchingPage(null));
        }
      } catch (error) {
        console.error('Error loading games:', error);
        setGames([]);
      }
    }
    loadGames();
  }, [locale, currentPage, totalGamesCount]);

  const goToPage = (pageNumber: number) => {
    const totalPages = Math.ceil(totalGamesCount / GAMES_PER_PAGE);
    if (pageNumber < 0 || pageNumber >= totalPages || pageNumber === currentPage) return;
    setCurrentPage(pageNumber);
  };

  const handleGameClick = (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height });
    setModalGame(game);
  };

  const closeModal = () => {
    setModalGame(null);
    setModalOrigin(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-[#151515] px-4 md:px-8 py-3 md:py-4 backdrop-blur-sm min-h-[40px]">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-brand">Pegasusgames</h1>
            <div className="hidden lg:flex gap-6 text-sm">
              <a href={`/${locale}`} className="hover:text-muted-foreground transition">{t.nav.discover}</a>
              <a href="#" className="hover:text-muted-foreground transition">{t.nav.browse}</a>
              <a href="#" className="hover:text-muted-foreground transition">{t.nav.offers}</a>
              <a href={`/${locale}/no-steam-games`} className="text-brand hover:text-brand/80 transition">No Steam Games</a>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">

            <LanguageSelector />
            {!user && <FuturisticLoginButtonCompact />}
            <UserProfile navOnly />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted/50 transition">
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>

          </div>
        </div>

      </nav>

      {/* Main Grid Layout */}
      <div className="pt-16 md:pt-20 grid grid-cols-1 lg:grid-cols-[300px_1fr] min-h-screen">
        {/* Sidebar */}
        <aside className="pt-20 hidden lg:block bg-[#151515] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto -mt-4 md:-mt-5">
          <div className="pl-12 pr-6 pt-6 pb-6 space-y-8">
            {/* Main Navigation */}
            <nav className="space-y-2">
              <a href={`/${locale}`} className="block text-2xl font-bold hover:text-brand transition-colors">
                Home
              </a>
              <a href="#" className="block text-2xl font-bold hover:text-brand transition-colors">
                Reviews
              </a>
            </nav>

            {/* User Section */}
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold">FEEDE33</span>
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    F
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <a href="#" className="text-lg hover:text-brand transition-colors">
                    Wishlist
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                    <Library className="w-5 h-5" />
                  </div>
                  <a href="#" className="text-lg hover:text-brand transition-colors">
                    My library
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <a href="#" className="text-lg hover:text-brand transition-colors">
                    People you follow
                  </a>
                </div>
              </div>
            )}

            {/* New Releases */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">New Releases</h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <a href="#" className="text-base hover:text-brand transition-colors">
                  Last 30 days
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <a href="#" className="text-base hover:text-brand transition-colors">
                  This week
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                  <SkipForward className="w-5 h-5" />
                </div>
                <a href="#" className="text-base hover:text-brand transition-colors">
                  Next week
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <a href="#" className="text-base hover:text-brand transition-colors">
                  Release calendar
                </a>
              </div>
            </div>

            {/* Top */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Top</h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <a href="#" className="text-base hover:text-brand transition-colors">
                  Best of the year
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <a href="#" className="text-base hover:text-brand transition-colors">
                  Popular in 2025
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <a href="#" className="text-base hover:text-brand transition-colors">
                  All time top 250
                </a>
              </div>
            </div>

            {/* All Games */}
            <div>
              <h2 className="text-2xl font-bold hover:text-brand transition-colors cursor-pointer">
                All Games
              </h2>
            </div>

            {/* Browse */}
            <div>
              <h2 className="text-2xl font-bold hover:text-brand transition-colors cursor-pointer">
                Browse
              </h2>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="bg-black">
          <div className="flex pb-12 md:pb-16 px-4 md:px-8 pt-8 bg-gradient-to-b from-background via-background/95 to-black">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">Descubrir</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
                {locale === 'es' ? 'Descubre juegos increíbles que no están disponibles en Steam. Una colección curada de títulos únicos e independientes.' : 'Discover amazing games that are not available on Steam. A curated collection of unique and independent titles.'}
              </p>
            </div>
          </div>
          <div className="relative px-4 md:px-6 lg:px-8 pb-20 pt-10 space-y-8 md:space-y-12">
           
          
          </div>
        </main>
      </div>

      <GameModal game={modalGame} origin={modalOrigin} onCloseAction={closeModal} locale={locale} />
    </div>
  );
}
