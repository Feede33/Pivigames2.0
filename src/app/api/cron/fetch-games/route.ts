import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache para la lista completa de juegos de Steam
let steamGamesCache: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Obtener lista completa de juegos de Steam
async function getAllSteamGames(): Promise<string[]> {
  // Usar cache si está disponible y no ha expirado
  if (steamGamesCache !== null && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return [...steamGamesCache];
  }

  try {
    const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
    const data = await response.json();
    
    if (data?.applist?.apps) {
      // Extraer solo los App IDs y convertir a strings
      const games = data.applist.apps.map((app: any) => String(app.appid));
      steamGamesCache = games;
      cacheTimestamp = Date.now();
      console.log(`Loaded ${games.length} games from Steam API`);
      return games;
    }
  } catch (error) {
    console.error('Error fetching Steam games list:', error);
  }

  // Si falla, retornar cache anterior si existe, sino array vacío
  return steamGamesCache !== null ? [...steamGamesCache] : [];
}

// Verificar si un App ID ya existe en la base de datos
async function appIdExists(appId: string): Promise<boolean> {
  const { data } = await supabase
    .from('games')
    .select('steam_appid')
    .eq('steam_appid', appId)
    .single();
  
  return !!data;
}

// Mezclar array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: Request) {
  try {
    // Verificar autorización de Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    
    if (!isVercelCron) {
      console.error('Unauthorized cron attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Cron job started at:', new Date().toISOString());

    const results = {
      total: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    const TARGET_GAMES = 200;
    
    // Obtener lista completa de juegos de Steam
    const allSteamGames = await getAllSteamGames();
    
    if (allSteamGames.length === 0) {
      console.error('Failed to fetch Steam games list');
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch Steam games list',
        results,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Total Steam games available: ${allSteamGames.length}`);
    
    // Mezclar y tomar una muestra aleatoria
    const shuffledGames = shuffleArray(allSteamGames);
    const candidates = shuffledGames.slice(0, Math.min(1000, allSteamGames.length));
    
    // Procesar candidatos
    for (const appId of candidates) {
      if (results.inserted >= TARGET_GAMES) break;
      
      try {
        // Verificar si ya existe en nuestra DB
        const exists = await appIdExists(appId);
        
        if (exists) {
          results.skipped++;
          continue;
        }

        // Insertar nuevo juego
        const { data, error } = await supabase
          .from('games')
          .insert({
            steam_appid: appId,
            links: null
          })
          .select()
          .single();

        if (error) {
          console.error(`Error inserting App ID ${appId}:`, error);
          results.errors++;
          continue;
        }

        console.log(`Successfully inserted App ID ${appId}`);
        results.inserted++;
        results.total++;
        results.details.push({
          appId,
          status: 'inserted',
          id: data.id
        });
        
      } catch (error) {
        console.error(`Failed to process App ID ${appId}:`, error);
        results.errors++;
      }
    }

    console.log('Final results:', results);

    return NextResponse.json({
      success: true,
      message: `Inserted ${results.inserted} new games`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
