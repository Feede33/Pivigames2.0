'use client';

import { useEffect, useState } from 'react';
import { getGames, enrichGameWithSteamData } from '@/lib/supabase';

export default function TestDB() {
  const [status, setStatus] = useState<string>('Iniciando...');
  const [games, setGames] = useState<any[]>([]);
  const [enrichedGames, setEnrichedGames] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function test() {
      try {
        // Test 1: Obtener juegos de la DB
        setStatus('Obteniendo juegos de Supabase...');
        const gamesFromDB = await getGames();
        console.log('Games from DB:', gamesFromDB);
        setGames(gamesFromDB);
        
        if (gamesFromDB.length === 0) {
          setError('No hay juegos en la base de datos');
          setStatus('Error: No hay juegos');
          return;
        }
        
        setStatus(`✅ ${gamesFromDB.length} juegos encontrados en DB`);
        
        // Test 2: Enriquecer con datos de Steam
        setStatus('Obteniendo datos de Steam...');
        const enriched = await Promise.all(
          gamesFromDB.map(game => enrichGameWithSteamData(game))
        );
        console.log('Enriched games:', enriched);
        setEnrichedGames(enriched);
        
        setStatus(`✅ ${enriched.length} juegos enriquecidos con Steam`);
      } catch (err: any) {
        console.error('Test error:', err);
        setError(err.message);
        setStatus('❌ Error en el test');
      }
    }
    
    test();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Test de Conexión</h1>
      
      <div className="space-y-6">
        {/* Status */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Estado:</h2>
          <p className="text-lg">{status}</p>
          {error && (
            <p className="text-red-500 mt-2">Error: {error}</p>
          )}
        </div>

        {/* Juegos de la DB */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Juegos en la DB ({games.length}):</h2>
          <pre className="bg-black p-4 rounded overflow-auto">
            {JSON.stringify(games, null, 2)}
          </pre>
        </div>

        {/* Juegos enriquecidos */}
        {enrichedGames.length > 0 && (
          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Juegos con datos de Steam ({enrichedGames.length}):</h2>
            <div className="space-y-4">
              {enrichedGames.map((game, index) => (
                <div key={index} className="bg-black p-4 rounded">
                  <h3 className="text-lg font-bold mb-2">{game.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>Steam App ID:</strong> {game.steam_appid}
                    </div>
                    <div>
                      <strong>Genre:</strong> {game.genre}
                    </div>
                    <div>
                      <strong>Rating:</strong> {game.rating}
                    </div>
                    <div>
                      <strong>Has Image:</strong> {game.image ? '✅' : '❌'}
                    </div>
                    <div>
                      <strong>Has Wallpaper:</strong> {game.wallpaper ? '✅' : '❌'}
                    </div>
                    <div>
                      <strong>Has Trailer:</strong> {game.trailer ? '✅' : '❌'}
                    </div>
                  </div>
                  {game.image && (
                    <img 
                      src={game.image} 
                      alt={game.title}
                      className="mt-4 w-full max-w-md rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variables de entorno */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Variables de Entorno:</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}
            </div>
            <div>
              <strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
