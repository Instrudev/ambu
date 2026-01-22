# Ambu - MVP local

Monorepo para un sistema tipo “Uber para ambulancias”. Todo el contenido está en español y listo para un MVP local.

## Estructura
- `apps/mobile`: App móvil React Native + Expo Router + NativeWind.
- `apps/web`: Panel admin React + Vite + Tailwind + Shadcn UI.
- `packages/backend`: API Node + Express + Prisma + Socket.io.

## Requisitos
- Node.js 18+
- MySQL 8+

## Configuración rápida
```bash
npm run setup
```

### Backend
1. Crear `.env` en `packages/backend`:
```bash
DATABASE_URL="mysql://root:password@localhost:3306/ambu"
JWT_SECRET="cambia-esto"
PORT=3000
```
2. Ejecutar migraciones y seed:
```bash
npm run prisma:migrate -w packages/backend
```
3. Iniciar backend:
```bash
npm run dev -w packages/backend
```

### Web admin
```bash
npm run dev -w apps/web
```

### Mobile
Configura `.env` con la IP local del backend:
```bash
EXPO_PUBLIC_API_URL="http://TU_IP_LOCAL:3000"
```
Luego:
```bash
npm run dev -w apps/mobile
```

## Puertos
- Backend: http://localhost:3000
- Admin: http://localhost:5173
- MySQL: localhost:3306

## Scripts útiles
- `npm run setup`: instala dependencias del monorepo.
- `npm run dev:backend`: arranca backend.
- `npm run dev:web`: arranca admin.
- `npm run dev:mobile`: arranca app móvil.
