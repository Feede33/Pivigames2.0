'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import GameModal from '@/components/GameModal';
import UserProfile from '@/components/UserProfile';
import HeroSlider from '@/components/HeroSlider';
import SteamOffers from '@/components/SteamOffers';
import GamesGrid from '@/components/GamesGrid';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [steamSpecials, setSteamSpecials] = useState<SteamSpecialEnriched[]>([]);
  const [userCountry, setUserCountry] = useState<string>('us');
  const [loadingSpecials, setLoadingSpecials] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadedGamesCount, setLoadedGamesCount] = useState(0);
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
          `/api/steam/specials?cc=${userCountry}&count=20&l=${locale}`
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

  // Cargar juegos desde Supabase y enriquecerlos con datos de Steam
  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        const gamesFromDB = await getGames(0, GAMES_PER_PAGE);
        console.log('Games from DB (page 0):', gamesFromDB.length);

        if (gamesFromDB.length === 0) {
          setGames([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        setLoadedGamesCount(0);

        // Cargar juegos en lotes de 50 simultáneos
        const enrichedGames: GameWithSteamData[] = [];
        const BATCH_SIZE = 50;

        for (let i = 0; i < gamesFromDB.length; i += BATCH_SIZE) {
          const batch = gamesFromDB.slice(i, i + BATCH_SIZE);
          
          console.log(`Loading batch ${Math.floor(i / BATCH_SIZE) + 1}: games ${i} to ${i + batch.length}`);
          
          // Procesar 50 juegos en paralelo
          const enrichedBatch = await Promise.all(
            batch.map((game, index) => enrichGameWithSteamData(game, locale, i + index))
          );
          
          enrichedGames.push(...enrichedBatch);
          
          // Actualizar el estado después de cada lote
          setGames([...enrichedGames]);
          setLoadedGamesCount(enrichedGames.length);
          
          // Después del primer lote, desactivar loading para mostrar el hero
          if (i === 0) {
            setLoading(false);
            console.log('Hero should now be visible with', enrichedGames.length, 'games');
          }
          
          // Delay entre lotes
          if (i + BATCH_SIZE < gamesFromDB.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        console.log('First page loaded:', enrichedGames.length);
        setHasMore(gamesFromDB.length === GAMES_PER_PAGE);
        setCurrentPage(0);
      } catch (error) {
        console.error('Error loading games:', error);
        setGames([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, [locale]);

  // Función para cargar más juegos (infinite scroll)
  const loadMoreGames = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const gamesFromDB = await getGames(nextPage, GAMES_PER_PAGE);
      console.log(`Loading page ${nextPage}:`, gamesFromDB.length, 'games');

      if (gamesFromDB.length === 0) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      // Cargar nuevos juegos en lotes de 50
      const BATCH_SIZE = 50;
      const newEnrichedGames: GameWithSteamData[] = [];

      for (let i = 0; i < gamesFromDB.length; i += BATCH_SIZE) {
        const batch = gamesFromDB.slice(i, i + BATCH_SIZE);
        
        const enrichedBatch = await Promise.all(
          batch.map((game, index) => enrichGameWithSteamData(game, locale, i + index))
        );
        
        newEnrichedGames.push(...enrichedBatch);
        
        // Actualizar el estado progresivamente
        setGames(prev => [...prev, ...newEnrichedGames]);
        setLoadedGamesCount(games.length + newEnrichedGames.length);
        
        // Delay entre lotes
        if (i + BATCH_SIZE < gamesFromDB.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setCurrentPage(nextPage);
      setHasMore(gamesFromDB.length === GAMES_PER_PAGE);
    } catch (error) {
      console.error('Error loading more games:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || loading) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Cargar más cuando estemos a 500px del final
      if (scrollHeight - scrollTop - clientHeight < 500) {
        console.log('Near bottom - loading more games');
        loadMoreGames();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loading, currentPage]);

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
      const response = await fetch(`/api/steam/${special.id}?cc=${userCountry}&l=${locale}`);
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
      }
    } catch (error) {
      console.error('Error loading full game data:', error);
    }
  };

  // Organizar juegos
  const heroGames = games.length > 0 ? games.slice(0, 10) : [];

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
            <LanguageSwitcher />
            <UserProfile />
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <HeroSlider games={heroGames} loading={loading} t={t as any} onGameClick={handleGameClick} />

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
          loadedCount={loadedGamesCount}
          totalCount={totalGamesCount}
        />

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Cargando más juegos...</span>
            </div>
          </div>
        )}

        {/* No more games indicator */}
        {!hasMore && games.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Has visto todos los {totalGamesCount} juegos disponibles
            </p>
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
