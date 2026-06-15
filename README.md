# StreamAdmin 🎬

Aplicación web profesional para gestión de cuentas de streaming, clientes y renovaciones.

## Stack

- **Vite 5** + React 18 + TypeScript
- **Tailwind CSS** — dark mode, colores negro/azul/naranja
- **Zustand** — estado global con persistencia en localStorage
- **Recharts** — gráficas de ingresos y servicios
- **ExcelJS** — exportar a Excel
- **jsPDF** — exportar a PDF
- **React Router 6** — navegación SPA
- **Supabase** — base de datos PostgreSQL (opcional, con datos demo incluidos)
- **React Hot Toast** — notificaciones

## Inicio rápido

```bash
cd streaming-app
npm install
npm run dev
```

Abre http://localhost:5173

## Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| 👑 Admin | admin@streamadmin.com | admin123 |
| 👤 Empleado | empleado@streamadmin.com | emp123 |

## Configurar Supabase (opcional)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia `.env.example` a `.env.local`
3. Rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
4. Ejecuta `supabase/schema.sql` en el SQL editor de Supabase

Sin Supabase la app funciona 100% con datos de demostración guardados en localStorage.

## Desplegar en Vercel

```bash
# 1. Sube a GitHub
git init && git add . && git commit -m "StreamAdmin inicial"
git remote add origin https://github.com/tu-usuario/streaming-app.git
git push -u origin main

# 2. Importa en vercel.com
# 3. Agrega las variables de entorno en Vercel si usas Supabase
```

El `vercel.json` incluido maneja el routing de SPA automáticamente.

## Módulos

| Módulo | Funciones |
|--------|-----------|
| **Dashboard** | Estadísticas, gráficas de ingresos, servicios más vendidos, renovaciones próximas |
| **Clientes** | CRUD completo, historial de servicios por cliente |
| **Streaming** | CRUD, renovar, marcar vencida, copiar credenciales, exportar Excel/PDF, filtros |
| **Renovaciones** | Vista por hoy / próximas / vencidas / todas, renovación rápida |
| **Gmail** | CRUD, mostrar/ocultar contraseña, copiar credenciales |
| **Proveedores** | CRUD completo con tarjetas visuales, exportar Excel |
| **Notificaciones** | Alertas de renovación/vencimiento, marcar leídas |
| **Actividad** | Registro de todas las acciones del sistema |
| **Seguridad** | Cambio de contraseña, tabla de permisos por rol, lista de usuarios (admin) |

## Servicios soportados

Netflix · Prime Video · Disney+ · HBO Max · Spotify · YouTube Premium · Crunchyroll · Vix Premium · Paramount+
