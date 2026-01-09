'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info, Star } from 'lucide-react';
import GameModal from "@/components/GameModal"
import UserProfile from "@/components/UserProfile"
import WallpaperImage from "@/components/WallpaperImage"
import { getGames, enrichGameWithSteamData, type GameWithSteamData } from "@/lib/supabase"
import { proxySteamImage } from "@/lib/image-proxy"


export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalGame, setModalGame] = useState<GameWithSteamData | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [games, setGames] = useState<GameWithSteamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offersScroll, setOffersScroll] = useState(0);
  const GAMES_PER_PAGE = 20;

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
  const offersGames = games.slice(0, Math.min(games.length, 20));
  const allGames = games; // Mostrar todos los juegos

  const heroGames = offersGames.length > 0 ? offersGames : [];

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
      const scrollAmount = 240; // ancho de card + gap
      const newScroll = direction === 'left'
        ? Math.max(0, offersScroll - scrollAmount)
        : offersScroll + scrollAmount;

      container.scrollTo({ left: newScroll, behavior: 'smooth' });
      setOffersScroll(newScroll);
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

      {/* Caja */}
      {!loading && games.length > 0 && (
        <div className="relative px-8 pb-20 pt-10 space-y-12 bg-black">
          {/* Ofertas Div*/}
          {offersGames.length > 0 && (
            <section className="relative group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Ofertas</h3>
              </div>
              {/*Ofertas - Main Caja*/}
              <div
                id="offers-scroll"
                className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide scroll-smooth pl-3"
              >
                {/*Contenido - Scroleable*/}
                {offersGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex-shrink-0 w-[220px] group cursor-pointer"
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
                      {/* Badge superior */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          {game.rating >= 8 ? 'Popular' : 'Add-On'}
                        </span>
                      </div>
                    </div>
                    {/* Título y precio */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {game.genre}
                      </p>
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition">
                        {game.title}
                      </h4>
                      <p className="text-sm font-bold text-green-500">
                        FREE
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Slider Oferta izquierdo */}
              <button
                onClick={() => scrollOffers('left')}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black p-3 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Slider oferta derecho */}
              <button
                onClick={() => scrollOffers('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black p-3 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </section>
          )}

          {/* Todos los Juegos - Grid infinito */}
          {allGames.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Todos los Juegos</h3>
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
      )}

      {/* Modal del juego - Componente separado */}
      <GameModal game={modalGame} origin={modalOrigin} onClose={closeModal} />

      {/* User Profile - Discord Style */}
      <UserProfile />


    </div>
  );
}
