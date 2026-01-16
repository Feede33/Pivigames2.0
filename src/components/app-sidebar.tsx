'use client';

import {
  Gamepad2,
  Star,
  TrendingUp,
  Filter,
  Download,
  Calendar,
  Users,
  Trophy,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

type FilterOptions = {
  orderBy: 'popularity' | 'rating' | 'name' | 'downloads' | 'release_date';
  platform: string;
  genre: string;
  minRating: number;
};

type AppSidebarProps = {
  filters?: FilterOptions;
  onFilterChangeAction?: (filters: Partial<FilterOptions>) => void;
  locale?: 'es' | 'en';
};

export function AppSidebar({ 
  filters: filtersProp, 
  onFilterChangeAction, 
  locale = 'es' 
}: AppSidebarProps) {
  // Ensure filters always has a value
  const filters = filtersProp || { 
    orderBy: 'popularity' as const, 
    platform: 'all', 
    genre: 'all', 
    minRating: 0 
  };

  const t = {
    es: {
      title: 'Filtros',
      orderBy: 'Ordenar por',
      popularity: 'Popularidad',
      rating: 'Calificación',
      name: 'Nombre',
      downloads: 'Descargas',
      releaseDate: 'Fecha de lanzamiento',
      platform: 'Plataforma',
      all: 'Todas',
      windows: 'Windows',
      mac: 'Mac',
      linux: 'Linux',
      genre: 'Género',
      action: 'Acción',
      adventure: 'Aventura',
      rpg: 'RPG',
      strategy: 'Estrategia',
      simulation: 'Simulación',
      sports: 'Deportes',
      racing: 'Carreras',
      minRating: 'Calificación mínima',
      stats: 'Estadísticas',
      totalGames: 'Total de juegos',
      withDownloads: 'Con descargas',
    },
    en: {
      title: 'Filters',
      orderBy: 'Order by',
      popularity: 'Popularity',
      rating: 'Rating',
      name: 'Name',
      downloads: 'Downloads',
      releaseDate: 'Release Date',
      platform: 'Platform',
      all: 'All',
      windows: 'Windows',
      mac: 'Mac',
      linux: 'Linux',
      genre: 'Genre',
      action: 'Action',
      adventure: 'Adventure',
      rpg: 'RPG',
      strategy: 'Strategy',
      simulation: 'Simulation',
      sports: 'Sports',
      racing: 'Racing',
      minRating: 'Minimum rating',
      stats: 'Statistics',
      totalGames: 'Total games',
      withDownloads: 'With downloads',
    },
  };

  const translations = t[locale];

  const orderByItems = [
    {
      title: translations.popularity,
      value: 'popularity' as const,
      icon: TrendingUp,
    },
    {
      title: translations.rating,
      value: 'rating' as const,
      icon: Star,
    },
    {
      title: translations.name,
      value: 'name' as const,
      icon: Gamepad2,
    },
    {
      title: translations.downloads,
      value: 'downloads' as const,
      icon: Download,
    },
    {
      title: translations.releaseDate,
      value: 'release_date' as const,
      icon: Calendar,
    },
  ];

  const platformItems = [
    { title: translations.all, value: 'all' },
    { title: translations.windows, value: 'windows' },
    { title: translations.mac, value: 'mac' },
    { title: translations.linux, value: 'linux' },
  ];

  const genreItems = [
    { title: translations.all, value: 'all' },
    { title: translations.action, value: 'action' },
    { title: translations.adventure, value: 'adventure' },
    { title: translations.rpg, value: 'rpg' },
    { title: translations.strategy, value: 'strategy' },
    { title: translations.simulation, value: 'simulation' },
    { title: translations.sports, value: 'sports' },
    { title: translations.racing, value: 'racing' },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Filter className="size-5" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            {translations.title}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Order By */}
        <SidebarGroup>
          <SidebarGroupLabel>{translations.orderBy}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {orderByItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={filters.orderBy === item.value}
                    onClick={() => onFilterChangeAction?.({ orderBy: item.value })}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Platform */}
        <SidebarGroup>
          <SidebarGroupLabel>{translations.platform}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={filters.platform === item.value}
                    onClick={() => onFilterChangeAction?.({ platform: item.value })}
                    tooltip={item.title}
                  >
                    <Gamepad2 className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Genre */}
        <SidebarGroup>
          <SidebarGroupLabel>{translations.genre}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {genreItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={filters.genre === item.value}
                    onClick={() => onFilterChangeAction?.({ genre: item.value })}
                    tooltip={item.title}
                  >
                    <Trophy className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Rating Filter */}
        <SidebarGroup>
          <SidebarGroupLabel>{translations.minRating}</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.minRating}
                onChange={(e) =>
                  onFilterChangeAction?.({ minRating: parseFloat(e.target.value) })
                }
                className="w-full accent-brand"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-semibold text-brand">
                  {filters.minRating}+
                </span>
                <span>10</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupLabel>{translations.stats}</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-2 space-y-2 text-xs group-data-[collapsible=icon]:hidden">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="size-3" />
                  {translations.totalGames}
                </span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Download className="size-3" />
                  {translations.withDownloads}
                </span>
                <span className="font-semibold text-green-500">856</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}