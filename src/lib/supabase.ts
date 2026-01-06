import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipo simplificado - solo almacenamos steam_appid y links
// Toda la información del juego se obtiene de la API de Steam
export type Game = {
  id: number;
  steam_appid: string; // ID de Steam (obligatorio)
  links?: string; // Link único de descarga para cada juego
};

// Tipo extendido con datos de Steam API
export type GameWithSteamData = Game & {
  title: string;
  genre: string;
  image: string;
  cover_image: string;
  rating: number;
  wallpaper: string;
  description: string;
  trailer?: string;
  screenshots?: string[];
};

// Función para obtener solo los juegos de la DB (sin datos de Steam)
export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return data as Game[];
}

// Función para enriquecer un juego con datos de Steam (solo cliente)
export async function enrichGameWithSteamData(game: Game): Promise<GameWithSteamData> {
  try {
    const response = await fetch(`/api/steam/${game.steam_appid}`);
    if (!response.ok) throw new Error('Steam API error');
    
    const steamData = await response.json();
    
    return {
      ...game,
      title: steamData.name || 'Unknown Game',
      genre: steamData.genres?.join(', ') || 'Unknown',
      image: steamData.header_image || '',
      cover_image: steamData.header_image || '',
      rating: steamData.metacritic ? steamData.metacritic / 10 : 7.5,
      wallpaper: steamData.background || steamData.header_image || '',
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
