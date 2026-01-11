// Script para actualizar títulos y géneros de juegos existentes
// Ejecutar con: npx tsx scripts/update-game-titles.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Obtener datos de Steam API
async function getSteamGameData(appId: string): Promise<{ title: string; genre: string } | null> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GameUpdater/1.0)',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (!data[appId]?.success || !data[appId]?.data) {
      return null;
    }

    const gameData = data[appId].data;
    const title = gameData.name || '';
    const genres = gameData.genres?.map((g: any) => g.description).join(', ') || 'Unknown';

    return { title, genre: genres };
  } catch (error) {
    console.error(`Error fetching Steam data for ${appId}:`, error);
    return null;
  }
}

// Actualizar juegos en batch
async function updateGamesBatch(games: any[], batchNumber: number, totalBatches: number) {
  console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${games.length} games)`);
  
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    
    // Obtener datos de Steam
    const steamData = await getSteamGameData(game.steam_appid);
    
    if (steamData && steamData.title) {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('games')
        .update({
          title: steamData.title,
          genre: steamData.genre
        })
        .eq('id', game.id);

      if (error) {
        console.error(`❌ Failed to update ${game.steam_appid}:`, error.message);
        failed++;
      } else {
        updated++;
        if (updated % 10 === 0) {
          console.log(`   ✓ Updated ${updated}/${games.length} games in this batch`);
        }
      }
    } else {
      failed++;
    }

    // Rate limit: Steam permite ~200 requests por 5 minutos
    // Esperamos 1.5 segundos entre requests = ~40 requests por minuto
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`✅ Batch ${batchNumber} complete: ${updated} updated, ${failed} failed`);
  return { updated, failed };
}

async function main() {
  console.log('🚀 Starting game titles update...\n');

  // Obtener todos los juegos sin título
  const { data: games, error } = await supabase
    .from('games')
    .select('id, steam_appid')
    .is('title', null)
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Error fetching games:', error);
    process.exit(1);
  }

  if (!games || games.length === 0) {
    console.log('✅ All games already have titles!');
    process.exit(0);
  }

  console.log(`📊 Found ${games.length} games without titles`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(games.length * 1.5 / 60)} minutes\n`);

  // Procesar en batches de 50 juegos
  const BATCH_SIZE = 50;
  const batches = [];
  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    batches.push(games.slice(i, i + BATCH_SIZE));
  }

  let totalUpdated = 0;
  let totalFailed = 0;

  for (let i = 0; i < batches.length; i++) {
    const { updated, failed } = await updateGamesBatch(batches[i], i + 1, batches.length);
    totalUpdated += updated;
    totalFailed += failed;

    // Pausa entre batches
    if (i < batches.length - 1) {
      console.log('⏸️  Waiting 10 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Update complete!');
  console.log(`✅ Successfully updated: ${totalUpdated} games`);
  console.log(`❌ Failed: ${totalFailed} games`);
  console.log('='.repeat(50));
}

main().catch(console.error);
