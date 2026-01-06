# 🔍 Test de Conexión

## Página de Test Automático

He creado una página de test que puedes visitar en:
```
http://localhost:3000/test-db
```

Esta página automáticamente:
1. ✅ Verifica la conexión a Supabase
2. ✅ Obtiene los juegos de la DB
3. ✅ Enriquece cada juego con datos de Steam
4. ✅ Muestra toda la información en pantalla
5. ✅ Verifica las variables de entorno

## Verificar que todo funciona

### 1. Verificar Variables de Entorno

Abre `.env.local` y verifica que tengas:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ktakrkxxyezczbogmuiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui
```

### 2. Verificar Datos en Supabase

Ve a tu proyecto en Supabase y ejecuta:
```sql
SELECT * FROM games;
```

Deberías ver 2 juegos:
- Cyberpunk 2077 (steam_appid: 1091500)
- Elden Ring (steam_appid: 1214650)

### 3. Verificar en la Consola del Navegador

Abre la consola del navegador (F12) y busca:
- `Games from DB:` - Debería mostrar los 2 juegos de la DB
- `Enriched games:` - Debería mostrar los juegos con datos de Steam

### 4. Posibles Problemas

#### Problema: "No hay juegos disponibles"

**Solución 1**: Verifica que los juegos existan en la DB
```sql
SELECT COUNT(*) FROM games;
```

**Solución 2**: Verifica que la tabla tenga las columnas correctas
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'games';
```

Deberías ver:
- id (bigint)
- steam_appid (text)
- links (text)

**Solución 3**: Verifica los logs en la consola del navegador

#### Problema: Error de CORS o API

Si ves errores relacionados con la API de Steam:
1. Verifica tu conexión a internet
2. Steam API puede estar bloqueada en tu región
3. Intenta con otro navegador

#### Problema: Variables de entorno no cargadas

1. Reinicia el servidor de desarrollo
2. Verifica que el archivo `.env.local` esté en la raíz del proyecto
3. Las variables deben empezar con `NEXT_PUBLIC_` para estar disponibles en el cliente

### 5. Test Manual

Abre la consola del navegador y ejecuta:

```javascript
// Test 1: Verificar conexión a Supabase
fetch('https://ktakrkxxyezczbogmuiq.supabase.co/rest/v1/games', {
  headers: {
    'apikey': 'tu-anon-key',
    'Authorization': 'Bearer tu-anon-key'
  }
})
.then(r => r.json())
.then(console.log)

// Test 2: Verificar API de Steam
fetch('/api/steam/1091500')
.then(r => r.json())
.then(console.log)
```

### 6. Logs Útiles

El código ahora incluye logs detallados:
- `Games from DB:` - Muestra los juegos obtenidos de Supabase
- `Enriched games:` - Muestra los juegos con datos de Steam
- `Error loading games:` - Muestra errores si algo falla
- `Error loading Steam data for [appid]:` - Muestra errores específicos de Steam

### 7. Reiniciar el Servidor

Si hiciste cambios en `.env.local`:
```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia
npm run dev
```
