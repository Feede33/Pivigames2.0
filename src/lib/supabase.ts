import { createBrowserClient } from '@supabase/ssr';
import { getRawgRating } from './rawg';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente de Supabase con soporte para cookies (SSR)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 [Supabase] Client initialized:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
});

// Tipo simplificado - almacenamos steam_appid, links, title y genre
// Información adicional se obtiene de la API de Steam
export type Game = {
  id: number;
  steam_appid: string; // ID de Steam (obligatorio)
  links?: string; // Link único de descarga para cada juego
  title?: string; // Título del juego (para búsquedas)
  genre?: string; // Género del juego (para búsquedas)
};

// Tipo para ofertas de Steam
export type SteamSpecial = {
  id: number;
  steam_appid: string;
  links?: string;
  created_at?: string;
  updated_at?: string;
};

// Tipo extendido con datos de Steam API
export type GameWithSteamData = Game & {
  title: string;
  genre: string;
  image: string;
  image_fallback?: string; // Fallback si image no existe
  cover_image: string;
  rating: number;
  wallpaper: string;
  description: string;
  trailer?: string;
  screenshots?: string[];
  release_year?: number | null;
  required_age?: number;
};

// Función para obtener solo los juegos de la DB (sin datos de Steam)
// SOLO muestra juegos que tienen link de descarga (links IS NOT NULL)
// Soporta paginación para cargar juegos progresivamente
export async function getGames(page: number = 0, pageSize: number = 100): Promise<Game[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .not('links', 'is', null) // Filtrar solo juegos con link de descarga
    .order('id', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return data as Game[];
}

// Función para obtener el total de juegos disponibles
export async function getTotalGamesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .not('links', 'is', null);

  if (error) {
    console.error('Error fetching games count:', error);
    return 0;
  }

  return count || 0;
}

// Función para buscar juegos por título, género o steam_appid
// Búsqueda mejorada con priorización:
// 1. Coincidencia exacta con steam_appid
// 2. Título que empieza con el query
// 3. Título que contiene el query
// 4. Género que contiene el query
export async function searchGames(query: string, limit: number = 10): Promise<Game[]> {
  const trimmedQuery = query.trim();
  
  // Si el query es muy corto (1-2 caracteres), solo buscar al inicio del título
  if (trimmedQuery.length <= 2) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .not('links', 'is', null)
      .or(`title.ilike.${trimmedQuery}%,steam_appid.eq.${trimmedQuery}`)
      .limit(limit);

    if (error) {
      console.error('Error searching games:', error);
      return [];
    }

    return data as Game[];
  }
  
  // Para queries más largos, buscar en cualquier parte pero ordenar por relevancia
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .not('links', 'is', null)
    .or(`title.ilike.%${trimmedQuery}%,genre.ilike.%${trimmedQuery}%,steam_appid.eq.${trimmedQuery}`)
    .limit(limit * 2); // Obtener más resultados para ordenar

  if (error) {
    console.error('Error searching games:', error);
    return [];
  }

  // Ordenar por relevancia en el cliente
  const results = (data as Game[]).sort((a, b) => {
    const aTitle = a.title?.toLowerCase() || '';
    const bTitle = b.title?.toLowerCase() || '';
    const queryLower = trimmedQuery.toLowerCase();
    
    // Prioridad 1: steam_appid exacto
    if (a.steam_appid === trimmedQuery) return -1;
    if (b.steam_appid === trimmedQuery) return 1;
    
    // Prioridad 2: Título empieza con el query
    const aStartsWith = aTitle.startsWith(queryLower);
    const bStartsWith = bTitle.startsWith(queryLower);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Prioridad 3: Posición del query en el título (más cerca del inicio = mejor)
    const aIndex = aTitle.indexOf(queryLower);
    const bIndex = bTitle.indexOf(queryLower);
    if (aIndex !== -1 && bIndex !== -1) {
      if (aIndex !== bIndex) return aIndex - bIndex;
    }
    if (aIndex !== -1 && bIndex === -1) return -1;
    if (aIndex === -1 && bIndex !== -1) return 1;
    
    // Prioridad 4: Alfabético
    return aTitle.localeCompare(bTitle);
  });

  return results.slice(0, limit);
}

// Función para enriquecer un juego con datos de Steam (solo cliente)
export async function enrichGameWithSteamData(
  game: Game, 
  locale?: string
): Promise<GameWithSteamData> {
  try {
    // Construir URL con parámetro de idioma y timestamp para evitar caché
    const timestamp = Date.now();
    const url = locale 
      ? `/api/steam/${game.steam_appid}?l=${locale}&t=${timestamp}`
      : `/api/steam/${game.steam_appid}?t=${timestamp}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    
    if (!response.ok) {
      console.warn(`Steam API returned ${response.status} for ${game.steam_appid}, using fallback data`);
      throw new Error(`Steam API error: ${response.status}`);
    }
    
    const steamData = await response.json();
    
    // El wallpaper ya viene optimizado desde la API
    // La API prioriza: page_bg_raw > background_raw > screenshots > background > header_image
    const wallpaperUrl = steamData.background || steamData.header_image || '';
    
    if (wallpaperUrl) {
      console.log(`✓ Wallpaper loaded for ${steamData.name}`);
    } else {
      console.log(`⚠ No wallpaper available for ${steamData.name}`);
    }
    
    // Obtener la imagen de portada vertical (mejor para grids)
    // Steam proporciona diferentes tamaños de imágenes
    // Prioridad: library_600x900 > header_image > wallpaper
    const verticalCover = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steam_appid}/library_600x900.jpg`;
    
    // Usar header_image o wallpaper como fallback si library_600x900 no existe
    const imageFallback = steamData.header_image || wallpaperUrl || '';
    
    // Obtener rating de RAWG si no hay Metacritic
    let rating = 7.5; // Valor por defecto
    
    if (steamData.metacritic) {
      rating = steamData.metacritic / 10;
    } else {
      // Intentar obtener rating de RAWG
      const rawgRating = await getRawgRating(steamData.name || game.title || '');
      if (rawgRating > 0) {
        rating = rawgRating;
      }
    }
    
    return {
      ...game,
      title: steamData.name || game.title || 'Unknown Game',
      genre: steamData.genres?.join(', ') || game.genre || 'Unknown',
      image: verticalCover, // Portada vertical para grids
      image_fallback: imageFallback, // Fallback si library_600x900 no existe
      cover_image: steamData.header_image || '', // Header horizontal para carruseles
      rating,
      wallpaper: wallpaperUrl,
      description: steamData.short_description || '',
      trailer: steamData.videos?.[0]?.mp4?.max || steamData.videos?.[0]?.mp4?.['480'] || '',
      screenshots: steamData.screenshots?.map((s: any) => s.full) || [],
      release_year: steamData.release_year,
      required_age: steamData.required_age
    } as GameWithSteamData;
  } catch (err) {
    console.error(`Error loading Steam data for ${game.steam_appid}:`, err);
    
    // Retornar datos básicos del juego si falla la API de Steam
    // Usar datos de la DB si están disponibles
    const fallbackImage = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steam_appid}/header.jpg`;
    
    return {
      ...game,
      title: game.title || `Game ${game.steam_appid}`,
      genre: game.genre || 'Unknown',
      image: fallbackImage,
      image_fallback: fallbackImage,
      cover_image: fallbackImage,
      rating: 7.0,
      wallpaper: fallbackImage,
      description: 'Unable to load game details. Please try again later.',
      screenshots: [],
      release_year: null,
      required_age: 0
    } as GameWithSteamData;
  }
}

// Función para obtener un juego por ID (sin datos de Steam)
export async function getGameById(id: number): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }

  return data as Game;
}

// ============================================
// FUNCIONES PARA OFERTAS DE STEAM
// ============================================

// Obtener todas las ofertas actuales de Steam desde Supabase
export async function getSteamSpecials(): Promise<SteamSpecial[]> {
  const { data, error } = await supabase
    .from('steam_specials')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching steam specials:', error);
    return [];
  }

  return data as SteamSpecial[];
}

// Obtener solo ofertas que tienen link de descarga
export async function getSteamSpecialsWithLinks(): Promise<SteamSpecial[]> {
  const { data, error } = await supabase
    .from('steam_specials')
    .select('*')
    .not('links', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching steam specials with links:', error);
    return [];
  }

  return data as SteamSpecial[];
}

// Verificar si una oferta tiene link de descarga
export async function specialHasDownloadLink(steamAppId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('steam_specials')
    .select('links')
    .eq('steam_appid', steamAppId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.links;
}

// Agregar o actualizar link de descarga para una oferta
export async function updateSpecialDownloadLink(steamAppId: string, link: string): Promise<boolean> {
  const { error } = await supabase
    .from('steam_specials')
    .update({ links: link })
    .eq('steam_appid', steamAppId);

  if (error) {
    console.error('Error updating special download link:', error);
    return false;
  }

  return true;
}

