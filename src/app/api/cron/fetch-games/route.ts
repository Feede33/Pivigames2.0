import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Usar SERVICE_ROLE_KEY para bypass RLS en operaciones de cron
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const STEAM_API_KEY = process.env.STEAM_API_KEY!;

// Obtener lista completa de juegos de Steam
async function getAllSteamGames() {
  const response = await fetch(
    `https://api.steampowered.com/ISteamApps/GetAppList/v2/`
  );
  const data = await response.json();
  return data.applist.apps;
}

// Verificar si un App ID ya existe en la base de datos
async function appIdExists(appId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('games')
    .select('steam_appid')
    .eq('steam_appid', appId)
    .single();
  
  return !!data && !error;
}

// Verificar si un juego es válido (tiene datos completos en Steam)
async function isValidGame(appId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}`
    );
    const data = await response.json();
    
    // Verificar que sea un juego válido con datos
    if (data[appId]?.success && data[appId]?.data?.type === 'game') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
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

    // Obtener todos los juegos de Steam
    console.log('Fetching all Steam games...');
    const allGames = await getAllSteamGames();
    console.log(`Total Steam games: ${allGames.length}`);
    
    const results = {
      total: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    // Mezclar y buscar 20 juegos válidos que no existan en la DB
    const shuffled = [...allGames].sort(() => Math.random() - 0.5);
    
    for (const game of shuffled) {
      // Si ya tenemos 20 insertados, terminar
      if (results.inserted >= 20) {
        break;
      }
      
      const appId = game.appid.toString();
      
      try {
        // Verificar si ya existe en nuestra DB
        const exists = await appIdExists(appId);
        
        if (exists) {
          continue; // Saltar sin contar
        }
        
        // Verificar si es un juego válido en Steam
        console.log(`Validating App ID: ${appId} (${game.name})`);
        const isValid = await isValidGame(appId);
        
        if (!isValid) {
          console.log(`App ID ${appId} is not a valid game, skipping`);
          continue; // Saltar sin contar
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
          throw error;
        }

        console.log(`Successfully inserted App ID ${appId} (${game.name})`);
        results.inserted++;
        results.total++;
        results.details.push({
          appId,
          name: game.name,
          status: 'inserted',
          id: data.id
        });
        
        // Pequeña pausa para no saturar la API de Steam
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to process App ID ${appId}:`, error);
        results.errors++;
        results.total++;
        results.details.push({
          appId,
          name: game.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('Final results:', results);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} games, inserted ${results.inserted}`,
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
