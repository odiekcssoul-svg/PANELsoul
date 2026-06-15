# StreamAdmin — SSouL Streaming

App de gestión de cuentas de streaming, clientes y renovaciones.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Auth + Base de datos)
- Zustand (estado)
- Vercel (deploy)

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. Conecta el repo en vercel.com
2. Agrega las variables de entorno en **Settings → Environment Variables**
3. Vercel detecta Vite automáticamente y hace el build

## Base de datos

Ejecuta el archivo `supabase/schema.sql` en el SQL Editor de Supabase para crear todas las tablas.
