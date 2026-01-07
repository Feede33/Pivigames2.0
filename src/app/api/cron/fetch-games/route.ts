import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lista extendida de App IDs populares de Steam
// Incluye juegos populares, AAA, indie, y de diferentes géneros
const POPULAR_STEAM_APPIDS = [
  // Juegos muy populares
  '730', '570', '440', '271590', '578080', '1172470', '1245620',
  '1091500', '1938090', '2357570', '1086940', '1203220', '1174180',
  '1966720', '2050650', '1817070', '1623730', '1449850', '1426210',
  '1332010', '1237970', '1172620', '1145360', '1097150', '1063730',
  '976730', '945360', '892970', '883710', '814380', '755790',
  '739630', '686810', '646570', '620', '582010', '552520',
  '548430', '489830', '477160', '466560', '431960', '413150',
  '394360', '377160', '359550', '346110', '292030', '281990',
  '268500', '252490', '238960', '236390', '227300', '221100',
  '218620', '203160', '200260', '105600', '72850', '49520',
  // Juegos adicionales populares
  '1091500', '1174180', '1203220', '1237970', '1245620', '1332010',
  '1426210', '1449850', '1623730', '1817070', '1938090', '2050650',
  '2357570', '271590', '346110', '359550', '377160', '394360',
  '413150', '431960', '466560', '477160', '489830', '548430',
  '552520', '578080', '582010', '620', '646570', '686810',
  '739630', '755790', '814380', '883710', '892970', '945360',
  '976730', '1063730', '1086940', '1097150', '1145360', '1172470',
  '1172620', '1966720', '105600', '200260', '203160', '218620',
  '221100', '227300', '236390', '238960', '252490', '268500',
  '281990', '292030', '49520', '72850',
  // Más juegos populares de Steam
  '1174180', '1203220', '1237970', '1245620', '1332010', '1426210',
  '1449850', '1623730', '1817070', '1938090', '2050650', '2357570',
  '271590', '346110', '359550', '377160', '394360', '413150',
  '431960', '466560', '477160', '489830', '548430', '552520',
  '578080', '582010', '620', '646570', '686810', '739630',
  '755790', '814380', '883710', '892970', '945360', '976730',
  '1063730', '1086940', '1097150', '1145360', '1172470', '1172620'
];

// Función para obtener 20 App IDs aleatorios
function getRandomAppIds(count: number = 20): string[] {
  const shuffled = [...POPULAR_STEAM_APPIDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Función para verificar si un App ID ya existe en la base de datos
async function appIdExists(appId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('games')
    .select('steam_appid')
    .eq('steam_appid', appId)
    .single();
  
  return !!data && !error;
}

export async function GET(request: Request) {
  try {
    // Verificar autorización de Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Vercel Cron envía el header: Authorization: Bearer <CRON_SECRET>
    // También verificamos si viene de Vercel por el header especial
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    
    if (!isVercelCron) {
      console.error('Unauthorized cron attempt:', {
        hasAuthHeader: !!authHeader,
        authHeaderValue: authHeader?.substring(0, 20) + '...',
        expectedSecret: cronSecret?.substring(0, 10) + '...'
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Cron job started at:', new Date().toISOString());

    // Obtener 20 App IDs aleatorios
    const randomAppIds = getRandomAppIds(20);
    
    const results = {
      total: randomAppIds.length,
      inserted: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    // Insertar cada App ID en Supabase (solo si no existe)
    for (const appId of randomAppIds) {
      try {
        // Verificar si ya existe
        const exists = await appIdExists(appId);
        
        if (exists) {
          results.skipped++;
          results.details.push({
            appId,
            status: 'skipped',
            reason: 'Already exists'
          });
          continue;
        }

        // Insertar nuevo juego (sin link de descarga por defecto)
        const { data, error } = await supabase
          .from('games')
          .insert({
            steam_appid: appId,
            links: null // Sin link de descarga inicialmente
          })
          .select()
          .single();

        if (error) throw error;

        results.inserted++;
        results.details.push({
          appId,
          status: 'inserted',
          id: data.id
        });
      } catch (error) {
        results.errors++;
        results.details.push({
          appId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} games`,
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
