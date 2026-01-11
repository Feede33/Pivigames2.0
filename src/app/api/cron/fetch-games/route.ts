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

// Mezclar array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Insertar juegos en batch
async function insertGamesBatch(appIds: string[]): Promise<{ inserted: number; errors: number }> {
  const BATCH_SIZE = 500;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < appIds.length; i += BATCH_SIZE) {
    const batch = appIds.slice(i, i + BATCH_SIZE);
    const gamesToInsert = batch.map(appId => ({
      steam_appid: appId,
      links: null
    }));

    try {
      const { data, error } = await supabase
        .from('games')
        .upsert(gamesToInsert, { 
          onConflict: 'steam_appid',
          ignoreDuplicates: true 
        })
        .select();

      if (error) {
        console.error(`Batch insert error:`, error);
        totalErrors += batch.length;
      } else {
        const inserted = data?.length || 0;
        totalInserted += inserted;
        if (totalInserted % 1000 === 0 || i + BATCH_SIZE >= appIds.length) {
          console.log(`Progress: ${totalInserted} games processed`);
        }
      }
    } catch (error) {
      console.error(`Failed to insert batch:`, error);
      totalErrors += batch.length;
    }
  }

  return { inserted: totalInserted, errors: totalErrors };
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

    const TARGET_GAMES = 12000;
    
    // Obtener juegos desde SteamSpy (15 páginas = ~15000 juegos para tener margen)
    const allGames = await getAllSteamSpyGames(15);
    
    if (allGames.length === 0) {
      console.error('Failed to fetch games from SteamSpy');
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch games from SteamSpy',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log(`Total games available: ${allGames.length}`);
    
    // Mezclar y tomar solo los que necesitamos
    const shuffledGames = shuffleArray(allGames);
    const gamesToProcess = shuffledGames.slice(0, TARGET_GAMES);
    
    console.log(`Processing ${gamesToProcess.length} games in batches...`);
    
    // Insertar en batch
    const { inserted, errors } = await insertGamesBatch(gamesToProcess);

    const results = {
      total: gamesToProcess.length,
      inserted,
      errors,
      timestamp: new Date().toISOString()
    };

    console.log('Final results:', results);

    return NextResponse.json({
      success: true,
      message: `Processed ${inserted} games (${errors} errors)`,
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
