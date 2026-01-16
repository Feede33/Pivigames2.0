# 🔑 Cómo Obtener tu API Key de RAWG

## Paso 1: Ir a RAWG
Abre tu navegador y ve a: **https://rawg.io/apidocs**

## Paso 2: Crear una cuenta
1. Haz clic en **"Get API Key"** (botón verde en la parte superior)
2. Puedes registrarte con:
   - Google
   - GitHub
   - Email

## Paso 3: Obtener tu API Key
1. Una vez registrado, serás redirigido al dashboard
2. Verás tu **API Key** en la parte superior de la página
3. Copia la API Key (es un string largo como: `abc123def456...`)

## Paso 4: Agregar la API Key a tu proyecto
1. Abre el archivo `--yess/.env.local`
2. Busca la línea que dice:
   ```
   RAWG_API_KEY=
   ```
3. Pega tu API Key después del `=`:
   ```
   RAWG_API_KEY=tu_api_key_aqui
   ```
4. Guarda el archivo

## Paso 5: Reiniciar el servidor
```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

## ✅ Verificar que funciona

1. Abre tu aplicación en el navegador
2. Abre la consola del navegador (F12)
3. Busca logs como:
   ```
   [RAWG] Rating for [Nombre del Juego]: 8.5/10
   ```
4. Los juegos sin Metacritic ahora deberían mostrar ratings diferentes a 7.5

## 📊 Límites del plan gratuito
- **20,000 requests por mes**
- Suficiente para proyectos pequeños/medianos
- Los resultados se cachean por 24 horas para reducir el uso

## ❓ Problemas comunes

### "RAWG API key not configured"
- Verifica que agregaste la key en `.env.local`
- Asegúrate de reiniciar el servidor después de agregar la key

### Los ratings siguen siendo 7.5
- Verifica que la API key sea correcta
- Revisa la consola del navegador para ver errores
- Asegúrate de que el servidor esté reiniciado

### "Rate limit exceeded"
- Has excedido las 20,000 requests del mes
- Espera al siguiente mes o considera un plan pago
