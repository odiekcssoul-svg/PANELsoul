# Soul Streaming — Panel de Administración

App completa para gestión de servicios de streaming, clientes y contabilidad.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Auth + PostgreSQL)
- Zustand (estado global)
- Vercel (deploy)

## Rutas
- `/` → Landing pública de Soul Streaming
- `/admin/login` → Login del panel
- `/admin` → Dashboard (protegido)
- `/admin/clients`, `/admin/accounts`, etc.

## Variables de entorno

Crea un archivo `.env` en la raíz:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Base de datos

Ejecuta en el SQL Editor de Supabase en este orden:
1. `supabase/schema.sql` — tablas principales
2. `supabase/accounting.sql` — módulo de contabilidad

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. Conecta el repo en vercel.com
2. Agrega las variables de entorno en **Settings → Environment Variables**
3. Vercel detecta Vite automáticamente

## Módulos
- Dashboard con KPIs y métricas en tiempo real
- Clientes
- Cuentas de streaming (Netflix, Spotify, Disney+, HBO Max, etc.)
- Renovaciones con botón WhatsApp
- Correos Gmail
- Proveedores
- Contabilidad (ingresos, gastos, cuentas vencidas, por cobrar)
- Notificaciones
- Actividad
- Importar Excel
- Seguridad
