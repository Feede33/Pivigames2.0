import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log('Sync specials cron job started at:', new Date().toISOString());

    // Obtener ofertas actuales de Steam (usando US como base)
    const steamResponse = await fetch(
      `https://store.steampowered.com/api/featuredcategories?cc=us&l=spanish`
    );

    if (!steamResponse.ok) {
      throw new Error('Failed to fetch Steam specials');
    }

    const steamData = await steamResponse.json();
    
    // Combinar ofertas de diferentes categorías
    const specials = steamData.specials?.items || [];
    const topSellers = steamData.top_sellers?.items || [];
    const featured = steamData.featured_win?.items || [];
    
    const allGames = [...specials, ...topSellers, ...featured];
    
    // Filtrar solo juegos con descuento
    const gamesWithDiscount = allGames.filter((game: any) => 
      game.discount_percent > 0
    );
    
    // Eliminar duplicados
    const uniqueGames = Array.from(
      new Map(gamesWithDiscount.map((game: any) => [game.id, game])).values()
    );

    const results = {
      total_steam_specials: uniqueGames.length,
      inserted: 0,
      updated: 0,
      deleted: 0,
      errors: 0,
    };

    // Obtener IDs actuales de ofertas
    const currentSpecialIds = uniqueGames.map((game: any) => game.id.toString());

    // 1. Eliminar ofertas que ya no están en Steam
    const { data: existingSpecials } = await supabase
      .from('steam_specials')
      .select('steam_appid');

    if (existingSpecials) {
      const existingIds = existingSpecials.map(s => s.steam_appid);
      const idsToDelete = existingIds.filter(id => !currentSpecialIds.includes(id));
      
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('steam_specials')
          .delete()
          .in('steam_appid', idsToDelete);
        
        if (!deleteError) {
          results.deleted = idsToDelete.length;
          console.log(`Deleted ${idsToDelete.length} expired specials`);
        }
      }
    }

    // 2. Insertar o actualizar ofertas actuales
    for (const game of uniqueGames) {
      try {
        const appId = game.id.toString();
        
        // Verificar si ya existe
        const { data: existing } = await supabase
          .from('steam_specials')
          .select('*')
          .eq('steam_appid', appId)
          .single();

        if (existing) {
          // Ya existe, solo actualizar timestamp
          const { error: updateError } = await supabase
            .from('steam_specials')
            .update({ updated_at: new Date().toISOString() })
            .eq('steam_appid', appId);
          
          if (!updateError) {
            results.updated++;
          } else {
            results.errors++;
          }
        } else {
          // No existe, insertar nuevo (sin link por defecto)
          const { error: insertError } = await supabase
            .from('steam_specials')
            .insert({
              steam_appid: appId,
              links: null
            });
          
          if (!insertError) {
            results.inserted++;
          } else {
            results.errors++;
          }
        }
      } catch (error) {
        console.error(`Error processing special ${game.id}:`, error);
        results.errors++;
      }
    }

    console.log('Sync results:', results);

    return NextResponse.json({
      success: true,
      message: `Synced ${results.inserted + results.updated} specials`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in sync specials cron:', error);
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
