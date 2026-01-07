import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Usar SERVICE_ROLE_KEY para bypass RLS en operaciones de cron
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generar App IDs aleatorios en rangos conocidos de Steam
// Steam tiene App IDs desde ~10 hasta ~3,000,000+
function generateRandomAppIds(count: number): string[] {
  const appIds = new Set<string>();
  
  while (appIds.size < count * 3) { // Generar 3x para tener buffer
    // Generar IDs en rangos donde hay más juegos
    const ranges = [
      { min: 200, max: 1000 },      // Juegos clásicos
      { min: 10000, max: 100000 },  // Juegos indie
      { min: 200000, max: 800000 }, // Juegos modernos
      { min: 1000000, max: 2500000 } // Juegos recientes
    ];
    
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    const randomId = Math.floor(Math.random() * (range.max - range.min) + range.min);
    appIds.add(randomId.toString());
  }
  
  return Array.from(appIds);
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

// Verificar si un juego existe y es válido en Steam
async function isValidGame(appId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    if (!response.ok) return false;
    
    const data = await response.json();
    
    // Verificar que sea un juego válido
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

    // Generar App IDs aleatorios
    const candidateIds = generateRandomAppIds(60); // Generar 60 candidatos
    console.log(`Generated ${candidateIds.length} candidate App IDs`);
    
    const results = {
      total: 0,
      inserted: 0,
      skipped: 0,
      invalid: 0,
      details: [] as any[]
    };

    // Procesar candidatos hasta conseguir 20 válidos
    for (const appId of candidateIds) {
      // Si ya tenemos 20 insertados, terminar
      if (results.inserted >= 20) {
        break;
      }
      
      try {
        // Verificar si ya existe en nuestra DB
        const exists = await appIdExists(appId);
        
        if (exists) {
          results.skipped++;
          continue;
        }
        
        // Verificar si es un juego válido en Steam
        console.log(`Validating App ID: ${appId}`);
        const isValid = await isValidGame(appId);
        
        if (!isValid) {
          results.invalid++;
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
        
        // Pequeña pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to process App ID ${appId}:`, error);
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
