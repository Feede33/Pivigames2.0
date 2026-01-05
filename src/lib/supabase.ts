import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para la base de datos
export type Game = {
  id: number;
  title: string;
  genre: string;
  image: string; // Imagen vertical para trending (aspect-[2/3])
  cover_image: string; // Imagen horizontal para categorías (aspect-video)
  rating: number;
  wallpaper: string;
  description: string;
  trailer: string;
  links?: string; // Link único de descarga para cada juego
  screenshots?: string[];
  // Requisitos mínimos
  min_os?: string;
  min_cpu?: string;
  min_ram?: string;
  min_gpu?: string;
  min_storage?: string;
  // Requisitos recomendados
  rec_os?: string;
  rec_cpu?: string;
  rec_ram?: string;
  rec_gpu?: string;
  rec_storage?: string;
  created_at?: string;
  updated_at?: string;
};

// Función para obtener todos los juegos
export async function getGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return data as Game[];
}

// Función para obtener un juego por ID
export async function getGameById(id: number) {
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

// Función para buscar juegos
export async function searchGames(query: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .or(`title.ilike.%${query}%,genre.ilike.%${query}%,description.ilike.%${query}%`)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error searching games:', error);
    return [];
  }

  return data as Game[];
}

// Función para obtener juegos por género
export async function getGamesByGenre(genre: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('genre', genre)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching games by genre:', error);
    return [];
  }

  return data as Game[];
}
