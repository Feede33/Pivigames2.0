import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache para juegos de SteamSpy
let steamSpyCache: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Obtener juegos desde SteamSpy API
async function getSteamSpyGames(page: number = 0): Promise<string[]> {
  try {
    console.log(`Fetching SteamSpy page ${page}...`);
    const response = await fetch(
      `https://steamspy.com/api.php?request=all&page=${page}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GameFetcher/1.0)',
        },
      }
    );
    
    if (!response.ok) {
      console.error(`SteamSpy API returned status ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    // SteamSpy devuelve un objeto donde las keys son los App IDs
    const appIds = Object.keys(data);
    console.log(`Fetched ${appIds.length} games from SteamSpy page ${page}`);
    return appIds;
  } catch (error) {
    console.error(`Error fetching SteamSpy page ${page}:`, error);
    return [];
  }
}

// Obtener múltiples páginas de SteamSpy
async function getAllSteamSpyGames(maxPages: number = 3): Promise<string[]> {
  // Usar cache si está disponible y no ha expirado
  if (steamSpyCache !== null && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log(`Using cached SteamSpy games (${steamSpyCache.length} games)`);
    return [...steamSpyCache];
  }

  const allAppIds: string[] = [];
  
  // Obtener múltiples páginas (cada página tiene ~1000 juegos)
  for (let page = 0; page < maxPages; page++) {
    const appIds = await getSteamSpyGames(page);
    
    if (appIds.length === 0) {
      console.log(`No more games found at page ${page}, stopping`);
      break;
    }
    
    allAppIds.push(...appIds);
    
    // Rate limit: 1 request per minute según SteamSpy
    // Pero en producción solo hacemos 1 página por ejecución para ser conservadores
    if (page < maxPages - 1) {
      console.log('Waiting 2 seconds before next page...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Guardar en cache
  if (allAppIds.length > 0) {
    steamSpyCache = allAppIds;
    cacheTimestamp = Date.now();
    console.log(`Cached ${allAppIds.length} games from SteamSpy`);
  }
  
  return allAppIds;
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

    const TARGET_GAMES = 1000;
    
    // Obtener juegos desde SteamSpy (3 páginas = ~3000 juegos)
    const allGames = await getAllSteamSpyGames(3);
    
    if (allGames.length === 0) {
      console.error('Failed to fetch games from SteamSpy');
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch games from SteamSpy',
        results,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log(`Total games available: ${allGames.length}`);
    
    // Mezclar y procesar
    const shuffledGames = shuffleArray(allGames);
    
    for (const appId of shuffledGames) {
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

        if (results.inserted % 100 === 0) {
          console.log(`Progress: ${results.inserted}/${TARGET_GAMES} inserted`);
        }
        
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
