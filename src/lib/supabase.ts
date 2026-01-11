import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
export async function searchGames(query: string, limit: number = 10): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .not('links', 'is', null)
    .or(`title.ilike.%${query}%,genre.ilike.%${query}%,steam_appid.eq.${query}`)
    .limit(limit);

  if (error) {
    console.error('Error searching games:', error);
    return [];
  }

  return data as Game[];
}

// Función para enriquecer un juego con datos de Steam (solo cliente)
export async function enrichGameWithSteamData(
  game: Game, 
  locale?: string, 
  index?: number
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
    if (!response.ok) throw new Error('Steam API error');
    
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
    
    return {
      ...game,
      title: steamData.name || 'Unknown Game',
      genre: steamData.genres?.join(', ') || 'Unknown',
      image: verticalCover, // Portada vertical para grids
      image_fallback: imageFallback, // Fallback si library_600x900 no existe
      cover_image: steamData.header_image || '', // Header horizontal para carruseles
      rating: steamData.metacritic ? steamData.metacritic / 10 : 7.5,
      wallpaper: wallpaperUrl,
      description: steamData.short_description || '',
      trailer: steamData.videos?.[0]?.mp4?.max || steamData.videos?.[0]?.mp4?.['480'] || '',
      screenshots: steamData.screenshots?.map((s: any) => s.full) || []
    } as GameWithSteamData;
  } catch (err) {
    console.error(`Error loading Steam data for ${game.steam_appid}:`, err);
    // Retornar datos por defecto si falla
    return {
      ...game,
      title: 'Unknown Game',
      genre: 'Unknown',
      image: '',
      image_fallback: '',
      cover_image: '',
      rating: 0,
      wallpaper: '',
      description: 'No description available',
      screenshots: []
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

