export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20 px-4 md:px-8 pb-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
          Explora el Mundo de los Juegos
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-12 animate-fade-in animate-delay-200">
          Descubre nuevas aventuras, géneros y experiencias increíbles
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Card 1 - Acción */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 p-6 hover:scale-105 transition-transform animate-slide-in-up animate-delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Acción</h3>
              <p className="text-muted-foreground">Adrenalina pura y combates épicos</p>
              <div className="mt-4 text-sm text-red-400">120+ juegos</div>
            </div>
          </div>

          {/* Card 2 - Aventura */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-6 hover:scale-105 transition-transform animate-slide-in-up animate-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Aventura</h3>
              <p className="text-muted-foreground">Explora mundos fascinantes</p>
              <div className="mt-4 text-sm text-blue-400">85+ juegos</div>
            </div>
          </div>

          {/* Card 3 - RPG */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6 hover:scale-105 transition-transform animate-slide-in-up animate-delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚔️</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">RPG</h3>
              <p className="text-muted-foreground">Vive historias épicas</p>
              <div className="mt-4 text-sm text-purple-400">95+ juegos</div>
            </div>
          </div>

          {/* Card 4 - Estrategia */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6 hover:scale-105 transition-transform animate-slide-in-up animate-delay-400">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Estrategia</h3>
              <p className="text-muted-foreground">Planifica y conquista</p>
              <div className="mt-4 text-sm text-green-400">60+ juegos</div>
            </div>
          </div>

          {/* Card 5 - Deportes */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6 hover:scale-105 transition-transform animate-slide-in-up animate-delay-500">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚽</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Deportes</h3>
              <p className="text-muted-foreground">Compite como un campeón</p>
              <div className="mt-4 text-sm text-yellow-400">45+ juegos</div>
            </div>
          </div>

          {/* Card 6 - Indie */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 p-6 hover:scale-105 transition-transform animate-slide-in-up animate-delay-600">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Indie</h3>
              <p className="text-muted-foreground">Joyas ocultas y únicas</p>
              <div className="mt-4 text-sm text-cyan-400">150+ juegos</div>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-16 animate-fade-in animate-delay-700">
          <h2 className="text-3xl font-bold mb-6">Destacados de la Semana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured Card 1 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted border border-border p-8 animate-zoom-in animate-delay-800">
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                NUEVO
              </div>
              <h3 className="text-2xl font-bold mb-2">Cyberpunk Adventures</h3>
              <p className="text-muted-foreground mb-4">
                Sumérgete en un futuro distópico lleno de acción y decisiones morales
              </p>
              <div className="flex items-center gap-4">
                <span className="text-green-500 font-bold">95% Match</span>
                <span className="text-muted-foreground">2024</span>
              </div>
            </div>

            {/* Featured Card 2 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted border border-border p-8 animate-zoom-in animate-delay-900">
              <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Fantasy Realms</h3>
              <p className="text-muted-foreground mb-4">
                Explora reinos mágicos y conviértete en el héroe de tu propia leyenda
              </p>
              <div className="flex items-center gap-4">
                <span className="text-green-500 font-bold">92% Match</span>
                <span className="text-muted-foreground">2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-bounce-in animate-delay-1000">
          <div className="bg-gradient-to-br from-background to-muted border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-brand mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Juegos</div>
          </div>
          <div className="bg-gradient-to-br from-background to-muted border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Géneros</div>
          </div>
          <div className="bg-gradient-to-br from-background to-muted border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">1M+</div>
            <div className="text-sm text-muted-foreground">Jugadores</div>
          </div>
          <div className="bg-gradient-to-br from-background to-muted border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Disponible</div>
          </div>
        </div>
      </div>
    </div>
  );
}
