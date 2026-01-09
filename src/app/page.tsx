'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info, Star } from 'lucide-react';
import GameModal from "@/components/GameModal"
import UserProfile from "@/components/UserProfile"
import WallpaperImage from "@/components/WallpaperImage"
import { getGames, enrichGameWithSteamData, type GameWithSteamData, getSteamSpecials, specialHasDownloadLink } from "@/lib/supabase"
import { proxySteamImage } from "@/lib/image-proxy"


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
  hasDownloadLink?: boolean; // Indica si tiene link de descarga en Supabase
  downloadLink?: string | null;
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalGame, setModalGame] = useState<GameWithSteamData | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [games, setGames] = useState<GameWithSteamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offersScroll, setOffersScroll] = useState(0);
  const [steamSpecials, setSteamSpecials] = useState<SteamSpecialEnriched[]>([]);
  const [userCountry, setUserCountry] = useState<string>('us');
  const [loadingSpecials, setLoadingSpecials] = useState(true);
  const GAMES_PER_PAGE = 20;

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
        setUserCountry('us'); // Default a US si falla
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
        // 1. Obtener ofertas de Steam API con precios regionales
        const response = await fetch(`/api/steam/specials?cc=${userCountry}&count=20`);
        if (!response.ok) {
          throw new Error('Failed to fetch Steam specials');
        }
        
        const data = await response.json();
        const steamGames = data.games || [];
        
        // 2. Obtener ofertas de Supabase para verificar cuáles tienen links
        const supabaseSpecials = await getSteamSpecials();
        const specialsMap = new Map(
          supabaseSpecials.map(s => [s.steam_appid, s.links])
        );
        
        // 3. Enriquecer ofertas de Steam con información de links
        const enrichedSpecials: SteamSpecialEnriched[] = steamGames.map((game: any) => ({
          ...game,
          hasDownloadLink: specialsMap.has(game.id.toString()) && !!specialsMap.get(game.id.toString()),
          downloadLink: specialsMap.get(game.id.toString()) || null,
        }));
        
        setSteamSpecials(enrichedSpecials);
        console.log('Steam specials loaded:', enrichedSpecials.length);
        console.log('With download links:', enrichedSpecials.filter(s => s.hasDownloadLink).length);
      } catch (error) {
        console.error('Error loading Steam specials:', error);
        setSteamSpecials([]);
      } finally {
        setLoadingSpecials(false);
      }
    }
    loadSteamSpecials();
  }, [userCountry]);

  // Cargar juegos desde Supabase y enriquecerlos con datos de Steam
  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        // Primero obtener los juegos de la DB
        const gamesFromDB = await getGames();
        console.log('Games from DB:', gamesFromDB);

        if (gamesFromDB.length === 0) {
          setGames([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        // Luego enriquecer cada juego con datos de Steam
        const enrichedGames = await Promise.all(
          gamesFromDB.map(game => enrichGameWithSteamData(game))
        );

        console.log('Enriched games:', enrichedGames);
        setGames(enrichedGames);
        setHasMore(enrichedGames.length >= GAMES_PER_PAGE);
      } catch (error) {
        console.error('Error loading games:', error);
        setGames([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  // Infinite scroll - por ahora solo detecta scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Si estamos cerca del final (200px antes)
      if (scrollHeight - scrollTop - clientHeight < 200) {
        // Aquí se podría cargar más juegos en el futuro
        console.log('Near bottom - could load more games');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  // Organizar juegos por categorías
  const allGames = games; // Mostrar todos los juegos
  const heroGames = games.length > 0 ? games.slice(0, 10) : [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroGames.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroGames.length) % heroGames.length);
  };

  const handleGameClick = (game: GameWithSteamData, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    });
    setModalGame(game);
  };

  const closeModal = () => {
    setModalGame(null);
    setModalOrigin(null);
  };

  const scrollOffers = (direction: 'left' | 'right') => {
    const container = document.getElementById('offers-scroll');
    if (container) {
      const scrollAmount = 484; // ancho de card (460px) + gap (24px)
      const newScroll = direction === 'left'
        ? Math.max(0, offersScroll - scrollAmount)
        : offersScroll + scrollAmount;

      container.scrollTo({ left: newScroll, behavior: 'smooth' });
      setOffersScroll(newScroll);
    }
  };

  const handleSpecialClick = async (special: SteamSpecialEnriched, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    });
    
    // Convertir SteamSpecial a GameWithSteamData para el modal
    // Crear un objeto temporal mientras se cargan los datos completos
    const tempGame: GameWithSteamData = {
      id: special.id,
      steam_appid: special.id.toString(),
      title: special.name,
      genre: 'Loading...',
      image: special.capsule_image,
      cover_image: special.header_image,
      rating: 0,
      wallpaper: special.header_image,
      description: 'Cargando información...',
      screenshots: [],
    };
    
    setModalGame(tempGame);
    
    // Cargar datos completos de Steam en segundo plano
    try {
      const response = await fetch(`/api/steam/${special.id}?cc=${userCountry}`);
      if (response.ok) {
        const steamData = await response.json();
        
        const fullGame: GameWithSteamData = {
          id: special.id,
          steam_appid: special.id.toString(),
          title: steamData.name || special.name,
          genre: steamData.genres?.join(', ') || 'Unknown',
          image: special.capsule_image,
          cover_image: special.header_image,
          rating: steamData.metacritic ? steamData.metacritic / 10 : 7.5,
          wallpaper: steamData.background || special.header_image,
          description: steamData.short_description || '',
          trailer: steamData.videos?.[0]?.mp4?.max || steamData.videos?.[0]?.mp4?.['480'] || '',
          screenshots: steamData.screenshots?.map((s: any) => s.full) || []
        };
        
        setModalGame(fullGame);
      }
    } catch (error) {
      console.error('Error loading full game data:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    // Convertir centavos a precio real
    const realPrice = price / 100;
    
    // Mapeo de símbolos de moneda
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ARS': 'AR$',
      'MXN': 'MX$',
      'BRL': 'R$',
      'CLP': 'CLP$',
      'COP': 'COL$',
      'PEN': 'S/',
      'UYU': 'UY$',
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${realPrice.toFixed(2)}`;
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-background to-transparent px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold text-brand">Pivigames2.0</h1>
            <div className="hidden md:flex gap-6 text-sm">
              <a href="#" className="hover:text-muted-foreground transition">Discover</a>
              <a href="#" className="hover:text-muted-foreground transition">Browse</a>

              <a href="#" className="hover:text-muted-foreground transition">Ofertas e Historial de Precios</a>
            </div>
          </div>


        </div>
      </nav>

      {/* Hero Slider Section */}
      {loading ? (
        <div className="relative h-[80vh] flex items-center justify-center">
          <div className="text-2xl text-muted-foreground">Cargando juegos...</div>
        </div>
      ) : heroGames.length === 0 ? (
        <div className="relative h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">No hay juegos disponibles</h2>
            <p className="text-muted-foreground">Agrega juegos en tu base de datos de Supabase</p>
          </div>
        </div>
      ) : (
        <div className="relative h-[90vh] flex items-center overflow-hidden bg-black">
          {/* Wallpaper que cubre toda la pantalla manteniendo aspect ratio */}
          <WallpaperImage
            src={heroGames[currentSlide].wallpaper}
            alt={heroGames[currentSlide].title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          />
          {/* Gradiente negro desde la izquierda para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none" />
          {/* Gradiente negro inferior suave hacia el fondo de la página */}
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
            {heroGames.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-primary' : 'w-4 bg-muted-foreground/50'
                  }`}
              />
            ))}
          </div>

          <div className="relative z-20 px-8 pl-20 max-w-2xl">
            <h2 className="text-6xl font-bold mb-4">{heroGames[currentSlide].title}</h2>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-success font-bold">{Math.round(heroGames[currentSlide].rating * 10)}% Match</span>
              <span className="border border-border px-2 py-1 text-sm">18+</span>
              <span className="text-muted-foreground">2024</span>
              <span className="border border-border px-2 py-1 text-sm">4K</span>
            </div>
            <p className="text-lg mb-6 text-muted-foreground">
              {heroGames[currentSlide].description}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleGameClick(heroGames[currentSlide], { currentTarget: { getBoundingClientRect: () => ({ left: window.innerWidth / 2 - 100, top: window.innerHeight / 2 - 100, width: 200, height: 200 }) } } as React.MouseEvent<HTMLDivElement>)}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition cursor-pointer">
                <Play className="w-5 h-5" />
                Play
              </button>
              <button

                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-secondary/80 transition cursor-pointer"
              >
                <Info className="w-5 h-5" />
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caja Ofertas*/}
      <div className="relative px-8 pb-20 pt-10 space-y-12 bg-black">
        {/* Ofertas de Steam en tiempo real */}
        <section className="relative group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                🔥 Ofertas Especiales de Steam
              </h3>
              <p className="text-muted-foreground text-sm">
                Descuentos exclusivos actualizados diariamente
              </p>
            </div>
            {loadingSpecials && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Actualizando ofertas...</span>
              </div>
            )}
          </div>
          
          {loadingSpecials ? (
            <div className="flex gap-6 overflow-x-auto pb-4 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[460px]">
                  <div className="w-[460px] h-[215px] bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 bg-muted/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-muted/20 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : steamSpecials.length > 0 ? (
            <>
              {/*Ofertas - Main Caja*/}
              <div
                id="offers-scroll"
                className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide scroll-smooth pl-3"
              >
                {/*Contenido - Scroleable*/}
                {steamSpecials.map((special) => (
                  <div
                    key={special.id}
                    className="flex-shrink-0 w-[460px] group/card cursor-pointer"
                    onClick={(e) => handleSpecialClick(special, e)}
                  >
                    <div className="relative rounded-xl overflow-hidden mb-4 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-[1.02] border border-white/5">
                      {/* Imagen principal */}
                      <div className="w-[460px] h-[215px] bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
                        <img
                          src={proxySteamImage(special.header_image)}
                          alt={special.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Badge de descuento - Mejorado */}
                      <div className="absolute top-4 left-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500 blur-xl opacity-50"></div>
                          <span className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base font-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                            -{special.discount_percent}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Badge de disponibilidad de descarga - Mejorado */}
                      {special.hasDownloadLink && (
                        <div className="absolute top-4 right-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50"></div>
                            <span className="relative bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              DISPONIBLE
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Plataformas - Mejorado */}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {special.platforms.windows && (
                          <span className="bg-black/80 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-white/10 shadow-lg">
                            <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M6.555 1.375 0 2.237v5.45h6.555V1.375zM0 13.795l6.555.933V8.313H0v5.482zm7.278-5.4.026 6.378L16 16V8.395H7.278zM16 0 7.33 1.244v6.414H16V0z"/>
                            </svg>
                            Win
                          </span>
                        )}
                        {special.platforms.mac && (
                          <span className="bg-black/80 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-white/10 shadow-lg">
                            <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z"/>
                            </svg>
                            Mac
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Título y precio - Mejorado */}
                    <div className="space-y-2 px-1">
                      <h4 className="font-bold text-base line-clamp-2 group-hover/card:text-green-400 transition-colors duration-300">
                        {special.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground line-through opacity-60">
                            {formatPrice(special.original_price, special.currency)}
                          </span>
                          <span className="text-lg font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            {formatPrice(special.final_price, special.currency)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                          Ahorra {formatPrice(special.original_price - special.final_price, special.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Slider Oferta izquierdo - Mejorado */}
              <button
                onClick={() => scrollOffers('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-black via-black/95 to-transparent hover:from-green-900/50 hover:via-black/95 p-4 rounded-r-xl transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-2xl border-y border-r border-white/10"
              >
                <ChevronLeft className="w-8 h-8 text-green-400" />
              </button>

              {/* Slider oferta derecho - Mejorado */}
              <button
                onClick={() => scrollOffers('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-black via-black/95 to-transparent hover:from-green-900/50 hover:via-black/95 p-4 rounded-l-xl transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-2xl border-y border-l border-white/10"
              >
                <ChevronRight className="w-8 h-8 text-green-400" />
              </button>
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="inline-block p-6 bg-muted/10 rounded-2xl border border-muted/20">
                <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  No hay ofertas disponibles en este momento
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Las ofertas se actualizan diariamente. Vuelve pronto para ver nuevas ofertas.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Todos los Juegos de tu base de datos */}
        {!loading && games.length > 0 && (

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Juegos Disponibles para Descargar</h3>
            </div>
              <div className="grid grid-cols-7 gap-6 pt-2">
                {allGames.map((game) => (
                  <div
                    key={game.id}
                    className="group cursor-pointer"
                    onClick={(e) => handleGameClick(game, e)}
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
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition">
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
        )}
      </div>

      {/* Modal del juego - Componente separado */}
      <GameModal game={modalGame} origin={modalOrigin} onClose={closeModal} />

      {/* User Profile - Discord Style */}
      <UserProfile />


    </div>
  );
}
