import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lista de App IDs populares de Steam (puedes expandir esta lista)
const POPULAR_STEAM_APPIDS = [
  '730', '570', '440', '271590', '578080', '1172470', '1245620',
  '1091500', '1938090', '2357570', '1086940', '1203220', '1174180',
  '1966720', '2050650', '1817070', '1623730', '1449850', '1426210',
  '1332010', '1237970', '1172620', '1145360', '1097150', '1063730',
  '976730', '945360', '892970', '883710', '814380', '755790',
  '739630', '686810', '646570', '620', '582010', '552520',
  '548430', '489830', '477160', '466560', '431960', '413150',
  '394360', '377160', '359550', '346110', '292030', '281990',
  '268500', '252490', '238960', '236390', '227300', '221100',
  '218620', '203160', '200260', '105600', '72850', '49520'
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
    // Verificar autorización (opcional pero recomendado)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
