'use client';
import { useTheme } from "next-themes"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import GameModal from "@/components/GameModal"
import UserProfile from "@/components/UserProfile"
import { getGames, enrichGameWithSteamData, type GameWithSteamData } from "@/lib/supabase"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const [hoveredGame, setHoveredGame] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalGame, setModalGame] = useState<GameWithSteamData | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const { setTheme } = useTheme()
  const [games, setGames] = useState<GameWithSteamData[]>([]);
  const [loading, setLoading] = useState(true);

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
          setLoading(false);
          return;
        }
        
        // Luego enriquecer cada juego con datos de Steam
        const enrichedGames = await Promise.all(
          gamesFromDB.map(game => enrichGameWithSteamData(game))
        );
        
        console.log('Enriched games:', enrichedGames);
        setGames(enrichedGames);
      } catch (error) {
        console.error('Error loading games:', error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  // Organizar juegos por categorías
  const trendingGames = games.slice(0, 6);
  const actionGames = games.filter(g => g.genre.toLowerCase().includes('action')).slice(0, 4);
  const adventureGames = games.filter(g => g.genre.toLowerCase().includes('adventure')).slice(0, 4);
  const sportsGames = games.filter(g => g.genre.toLowerCase().includes('sport')).slice(0, 4);

  const heroGames = trendingGames.length > 0 ? trendingGames : [];

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


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-background to-transparent px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold text-brand">Pivigames2.0</h1>
            <div className="hidden md:flex gap-6 text-sm">
              <a href="#" className="hover:text-muted-foreground transition">Home</a>
              <a href="#" className="hover:text-muted-foreground transition">Games</a>
              <a href="#" className="hover:text-muted-foreground transition">New & Popular</a>
              <a href="#" className="hover:text-muted-foreground transition">My List</a>
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
        <div className="relative h-[100vh] flex items-center overflow-hidden">
          {/* SOLO EL WALLPAPER - SIN GRADIENTES PARA DEBUG */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{
              backgroundImage: `url(${heroGames[currentSlide].wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

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

      {/* Game Categories */}
      {!loading && games.length > 0 && (
        <div className="relative px-8 pb-20 pt-10 space-y-12 bg-black">
          {/* Trending Now - Epic Games Style */}
          {trendingGames.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Epic Extras</h3>
                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver más <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {trendingGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex-shrink-0 w-[180px] group cursor-pointer"
                    onClick={(e) => handleGameClick(game, e)}
                  >
                    <div className="relative rounded-lg overflow-hidden mb-3 transition-transform duration-200 group-hover:scale-105">
                      <div className="aspect-[3/4] bg-gradient-to-br from-purple-900 to-blue-900">
                        <img
                          src={game.image}
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
                      <p className="text-sm font-bold">
                        {game.rating >= 9 ? 'Free' : '$19.99'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Action Games - Epic Style */}
          {actionGames.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Top New Releases</h3>
                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver más <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {actionGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex-shrink-0 w-[280px] group cursor-pointer"
                    onClick={(e) => handleGameClick(game, e)}
                  >
                    <div className="relative rounded-lg overflow-hidden mb-3 transition-transform duration-200 group-hover:scale-105">
                      <div className="aspect-[16/9] bg-gradient-to-br from-red-900 to-orange-900">
                        <img
                          src={game.cover_image}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition">
                        {game.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>⭐ {game.rating}</span>
                        <span>•</span>
                        <span>{game.genre}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Adventure Games - Epic Style */}
          {adventureGames.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Epic Adventures</h3>
                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver más <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {adventureGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex-shrink-0 w-[180px] group cursor-pointer"
                    onClick={(e) => handleGameClick(game, e)}
                  >
                    <div className="relative rounded-lg overflow-hidden mb-3 transition-transform duration-200 group-hover:scale-105">
                      <div className="aspect-[3/4] bg-gradient-to-br from-green-900 to-teal-900">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          Adventure
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {game.genre}
                      </p>
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition">
                        {game.title}
                      </h4>
                      <p className="text-sm font-bold">
                        Free
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sports Games - Epic Style */}
          {sportsGames.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Sports & Racing</h3>
                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Ver más <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {sportsGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex-shrink-0 w-[280px] group cursor-pointer"
                    onClick={(e) => handleGameClick(game, e)}
                  >
                    <div className="relative rounded-lg overflow-hidden mb-3 transition-transform duration-200 group-hover:scale-105">
                      <div className="aspect-[16/9] bg-gradient-to-br from-blue-900 to-purple-900">
                        <img
                          src={game.cover_image}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                          Sports
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition">
                        {game.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{game.genre}</span>
                        <span className="text-sm font-bold">$29.99</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal del juego - Componente separado */}
      <GameModal game={modalGame} origin={modalOrigin} onClose={closeModal} />

      {/* User Profile - Discord Style */}
      <UserProfile />

      {/* Footer */}
      <footer className="border-border px-8 py-12 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Social</h4>
              <div className="flex gap-4 text-2xl">
                <a href="#" className="hover:text-muted-foreground">📘</a>
                <a href="#" className="hover:text-muted-foreground">🐦</a>
                <a href="#" className="hover:text-muted-foreground">📷</a>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">© 2024 GameFlix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
