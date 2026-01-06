# Guía de Prueba - Sistema de Precios Regionales

## 🧪 Cómo Probar el Sistema

### Paso 1: Iniciar el Servidor
```bash
cd --yess
bun run dev
```

### Paso 2: Probar la API de Geolocalización
Abre en tu navegador:
```
http://localhost:3000/api/geolocation
```

**Respuesta esperada:**
```json
{
  "ip": "8.8.8.8",
  "country": "United States",
  "country_code": "US",
  "currency": "USD",
  "steam_country_code": "us",
  "city": "Mountain View",
  "region": "California"
}
```

### Paso 3: Probar Precios de Steam
Abre en tu navegador (ejemplo con Cyberpunk 2077):
```
http://localhost:3000/api/steam/1091500?cc=ar
```

**Parámetros:**
- `1091500` = Steam App ID de Cyberpunk 2077
- `cc=ar` = Código de país (Argentina)

**Otros códigos para probar:**
- `cc=us` - Estados Unidos (USD)
- `cc=mx` - México (MXN)
- `cc=br` - Brasil (BRL)
- `cc=es` - España (EUR)
- `cc=jp` - Japón (JPY)

### Paso 4: Ver el Precio en el Modal
1. Abre la aplicación: `http://localhost:3000`
2. Haz clic en cualquier juego que tenga `steam_appid`
3. Observa la tarjeta de precio en el sidebar derecho

**Deberías ver:**
```
┌─────────────────────────────┐
│ PRECIO      📍 Argentina    │
│                             │
│ -75%    $999.99            │
│                             │
│ $249.99                     │
│                             │
│ Precio en ARS               │
└─────────────────────────────┘
```

## 🔍 Verificaciones

### ✅ Checklist de Funcionalidad

- [ ] La API `/api/geolocation` retorna tu país correctamente
- [ ] La API `/api/steam/[appid]` retorna precios con el parámetro `cc`
- [ ] El modal muestra el badge con tu país (📍 Argentina)
- [ ] El precio se muestra en tu moneda local
- [ ] Si hay descuento, se muestra el badge con el porcentaje
- [ ] El precio original aparece tachado cuando hay descuento
- [ ] Se muestra "GRATIS" para juegos gratuitos

### 🐛 Debugging

**Ver logs en la consola del navegador:**
```javascript
// Deberías ver estos logs:
User location: { country: "Argentina", ... }
Steam data loaded: { price: "$249.99 ARS", ... }
Price for Argentina : $249.99 ARS
```

**Si no funciona:**
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Busca las peticiones a `/api/geolocation` y `/api/steam/`
4. Verifica que no haya errores 404 o 500

## 🌍 Probar Diferentes Regiones

### Opción 1: Usar VPN
1. Conecta tu VPN a diferentes países
2. Recarga la página
3. Observa cómo cambian los precios

### Opción 2: Modificar el Código (Desarrollo)
En `src/app/api/geolocation/route.ts`, cambia temporalmente:

```typescript
// Forzar un país específico para pruebas
return NextResponse.json({
  ip: '0.0.0.0',
  country: 'Argentina',
  country_code: 'AR',
  currency: 'ARS',
  steam_country_code: 'ar',
  city: 'Buenos Aires',
  region: 'Buenos Aires',
});
```

### Opción 3: Modificar el Query Param
En `src/components/GameModal.tsx`, cambia temporalmente:

```typescript
// Línea ~85
fetch(`/api/steam/${game.steam_appid}?cc=ar`) // Forzar Argentina
```

## 📊 Ejemplos de Precios por Región

| Juego | USA | Argentina | Brasil | México | España |
|-------|-----|-----------|--------|--------|--------|
| Cyberpunk 2077 | $59.99 | $999.99 ARS | R$ 199.90 | $899.00 MXN | 59,99 € |
| GTA V | $29.99 | $499.99 ARS | R$ 99.90 | $449.00 MXN | 29,99 € |
| Elden Ring | $59.99 | $999.99 ARS | R$ 199.90 | $899.00 MXN | 59,99 € |

## 🎯 Casos de Prueba

### Caso 1: Juego con Descuento
```
App ID: 1091500 (Cyberpunk 2077)
Región: Argentina
Esperado: Badge de descuento + precio original tachado
```

### Caso 2: Juego Gratuito
```
App ID: 730 (CS:GO)
Región: Cualquiera
Esperado: "GRATIS" en grande
```

### Caso 3: Juego Sin Precio
```
App ID: Sin precio en Steam
Región: Cualquiera
Esperado: No se muestra la tarjeta de precio
```

### Caso 4: Error de API
```
Desconecta internet temporalmente
Esperado: Fallback a USD
```

## 📸 Screenshots Esperados

### Vista Normal
```
┌─────────────────────────────┐
│ PRECIO      📍 Argentina    │
│                             │
│ $999.99 ARS                 │
│                             │
│ Precio en ARS               │
└─────────────────────────────┘
```

### Con Descuento
```
┌─────────────────────────────┐
│ PRECIO      📍 Argentina    │
│                             │
│ -75%    $999.99            │
│                             │
│ $249.99                     │
│                             │
│ Precio en ARS               │
└─────────────────────────────┘
```

### Juego Gratis
```
┌─────────────────────────────┐
│ PRECIO      📍 Argentina    │
│                             │
│ GRATIS                      │
│                             │
│ Precio en ARS               │
└─────────────────────────────┘
```

## 🚀 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
bun run dev

# Ver logs en tiempo real
# (Los logs aparecen en la terminal donde corriste bun run dev)

# Limpiar cache de Next.js
rm -rf .next

# Reinstalar dependencias
bun install
```

## 📝 Notas Importantes

1. **En desarrollo**: El sistema usa una IP de prueba (8.8.8.8) que corresponde a USA
2. **En producción**: Detectará automáticamente la IP real del usuario
3. **Cache**: Los precios se cachean por 1 hora, si cambias de región puede tardar en actualizarse
4. **Rate Limiting**: Steam tiene límites de peticiones, no hagas demasiadas pruebas seguidas

## ✅ Resultado Esperado

Cuando todo funcione correctamente:
- ✅ El país se detecta automáticamente
- ✅ Los precios se muestran en la moneda local
- ✅ Los descuentos son visibles
- ✅ La interfaz es clara y atractiva
- ✅ No hay errores en la consola
