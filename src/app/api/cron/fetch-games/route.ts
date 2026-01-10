import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRandomGames } from '@/lib/steam-games';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Verificar si un App ID ya existe en la base de datos
async function appIdExists(appId: string): Promise<boolean> {
  const { data } = await supabase
    .from('games')
    .select('steam_appid')
    .eq('steam_appid', appId)
    .single();
  
  return !!data;
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

    // Obtener juegos aleatorios hasta conseguir 200 nuevos
    let attempts = 0;
    const maxAttempts = 1000; // Evitar loop infinito
    
    while (results.inserted < 201 && attempts < maxAttempts) {
      // Obtener más candidatos de los necesarios
      const candidates = getRandomGames(30);
      
      for (const appId of candidates) {
        if (results.inserted >= 201) break;
        
        attempts++;
        
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
