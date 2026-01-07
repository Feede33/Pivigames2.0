# ⏰ Configuración del Horario del Cron

## 🕐 Horario Configurado

**Hora Argentina (UTC-3):** 6:45 PM (18:45)  
**Hora UTC:** 9:45 PM (21:45)  
**Schedule:** `45 21 * * *`

## 📅 Cuándo se Ejecuta

**Todos los días a las 6:45 PM** hora Argentina

### Ejemplo:

- **Hoy 7 de Enero:** 6:45 PM → 20 juegos nuevos
- **Mañana 8 de Enero:** 6:45 PM → 20 juegos nuevos
- **Pasado mañana 9 de Enero:** 6:45 PM → 20 juegos nuevos
- **Todos los días:** 6:45 PM → 20 juegos nuevos

## 🚀 Cómo Funciona

### Primera Ejecución

Después de hacer push a GitHub:

1. **Vercel detecta el push**
2. **Configura el cron automáticamente**
3. **Espera hasta las 6:45 PM**
4. **Ejecuta el cron automáticamente**
5. **20 juegos nuevos en tu base de datos**

### Ejecuciones Siguientes

**Todos los días a las 6:45 PM:**
- Vercel ejecuta el cron automáticamente
- 20 juegos nuevos se agregan
- Sin intervención manual
- Para siempre

## 📊 Sintaxis del Schedule

```
45 21 * * *
│  │  │ │ │
│  │  │ │ └─── Día de la semana (0-6, Domingo=0)
│  │  │ └───── Mes (1-12)
│  │  └─────── Día del mes (1-31)
│  └────────── Hora UTC (0-23)
└───────────── Minuto (0-59)
```

**`45 21 * * *`** significa:
- Minuto 45
- Hora 21 UTC (9:45 PM UTC)
- Todos los días del mes
- Todos los meses
- Todos los días de la semana

**Resultado:** 6:45 PM Argentina (UTC-3)

## 🔄 Flujo Automático

```
Hoy 6:45 PM
    ↓
Cron se ejecuta automáticamente
    ↓
Obtiene 20 App IDs aleatorios
    ↓
Verifica que no existan
    ↓
Inserta solo los nuevos
    ↓
¡20 juegos nuevos!
    ↓
Mañana 6:45 PM
    ↓
Se repite automáticamente
```

## ✅ Verificación

### Después del primer push:

1. Ve a Vercel Dashboard
2. Settings → Cron Jobs
3. Deberías ver:
   - Path: `/api/cron/fetch-games`
   - Schedule: `45 21 * * *`
   - Next execution: Hoy 6:45 PM

### Ver logs de ejecución:

1. Vercel Dashboard
2. Logs → Functions
3. Busca `/api/cron/fetch-games`
4. Verás todas las ejecuciones con timestamps

## 🎯 Resultado

Después de hacer push a GitHub:

✅ **Hoy 6:45 PM:** Primera ejecución automática  
✅ **Mañana 6:45 PM:** Segunda ejecución automática  
✅ **Todos los días 6:45 PM:** Ejecución automática  
✅ **Sin hacer nada más:** Funciona solo para siempre  

**¡Tu sistema trabaja solo todos los días a las 6:45 PM! 🚀**

---

**Configurado:** 7 de Enero 2026  
**Próxima ejecución:** Hoy 6:45 PM (después del deploy)
