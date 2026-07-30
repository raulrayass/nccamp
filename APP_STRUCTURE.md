# 📱 NCCAMP - ESTRUCTURA Y DIAGRAMA DE FLUJO

## 🏗️ ARQUITECTURA GENERAL

### Stack Tecnológico:
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: Tailwind CSS v4 + Shadcn/ui + Framer Motion
- **Backend**: Next.js Server Actions + API Routes
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Autenticación**: Better Auth
- **Estado**: React Context + SWR
- **Packaging**: Capacitor (Android/iOS en futuro)

---

## 📂 ESTRUCTURA DE CARPETAS

```
nccamp/
├─ 📁 app/
│  ├─ layout.tsx                    (Root layout - HTML shell)
│  ├─ globals.css                   (Tailwind + theme tokens)
│  ├─ error.tsx                     (Global error boundary)
│  ├─ sign-in/page.tsx              (Login)
│  ├─ sign-up/page.tsx              (Registro)
│  ├─ select-event/page.tsx         (Selector de evento activo)
│  │
│  ├─ (app)/                        (Rutas protegidas)
│  │  ├─ layout.tsx                 (Layout con Sidebar + Topbar + Dock)
│  │  ├─ page.tsx                   (Dashboard)
│  │  ├─ transactions/page.tsx      (Finanzas)
│  │  ├─ games/page.tsx             (Juegos)
│  │  ├─ attendees/page.tsx         (Camperos)
│  │  ├─ teams/page.tsx             (Equipos)
│  │  ├─ rooms/page.tsx             (Habitaciones)
│  │  ├─ staff/page.tsx             (Personal)
│  │  ├─ categories/page.tsx        (Categorías)
│  │  ├─ churches/page.tsx          (Iglesias)
│  │  └─ settings/page.tsx          (Configuración)
│  │
│  ├─ actions/                      (Server Actions - Backend)
│  │  ├─ events.ts                  (CRUD eventos + default event)
│  │  ├─ transactions.ts            (CRUD transacciones)
│  │  ├─ games.ts                   (CRUD juegos + puntuaciones)
│  │  ├─ attendees.ts               (CRUD camperos)
│  │  ├─ teams.ts                   (CRUD equipos)
│  │  ├─ rooms.ts                   (CRUD habitaciones)
│  │  ├─ staff.ts                   (CRUD personal)
│  │  ├─ categories.ts              (CRUD categorías)
│  │  ├─ churches.ts                (CRUD iglesias)
│  │  ├─ dashboard.ts               (Estadísticas)
│  │  └─ user.ts                    (Perfil usuario)
│  │
│  └─ api/
│     ├─ auth/[...all]/route.ts     (Better Auth endpoints)
│     └─ admin/migrate-db/route.ts  (DB migration)
│
├─ 📁 components/
│  ├─ Screens principales:
│  │  ├─ dashboard-client.tsx             (Dashboard animado)
│  │  ├─ transactions-client.tsx          (Tabla de finanzas)
│  │  ├─ games-client.tsx                 (Gestión de juegos)
│  │  ├─ attendees-client.tsx             (Gestión de camperos)
│  │  ├─ teams-client.tsx                 (Gestión de equipos)
│  │  ├─ rooms-client.tsx                 (Gestión de habitaciones)
│  │  ├─ staff-client.tsx                 (Gestión de personal)
│  │  ├─ categories-client.tsx            (Gestión de categorías)
│  │  ├─ churches-client.tsx              (Gestión de iglesias)
│  │  └─ settings-client.tsx              (Configuración usuario)
│  │
│  ├─ Layout Components:
│  │  ├─ topbar.tsx                 (Barra superior)
│  │  ├─ sidebar.tsx                (Menú lateral)
│  │  ├─ floating-dock.tsx          (Dock de acceso rápido)
│  │  └─ page-header.tsx            (Encabezado)
│  │
│  ├─ Dashboard:
│  │  ├─ dashboard/game-stats-card.tsx
│  │  ├─ dashboard/leaderboard.tsx
│  │  └─ dashboard/reports-builder.tsx
│  │
│  ├─ UI Components (shadcn):
│  │  ├─ ui/button.tsx
│  │  ├─ ui/card.tsx
│  │  ├─ ui/dialog.tsx
│  │  ├─ ui/input.tsx
│  │  └─ ... (otros componentes)
│  │
│  └─ user-provider.tsx             (Context de usuario)
│
├─ 📁 lib/
│  ├─ contexts/
│  │  ├─ event-session-context.tsx  (Evento activo - localStorage)
│  │  └─ event-context.tsx          (Legacy)
│  │
│  ├─ db/
│  │  ├─ index.ts                   (Conexión Drizzle)
│  │  └─ schema.ts                  (Definición de tablas)
│  │
│  ├─ hooks/
│  │  ├─ useAttendees.ts
│  │  ├─ useCategories.ts
│  │  ├─ useTransactions.ts
│  │  ├─ useGames.ts
│  │  ├─ useTeams.ts
│  │  ├─ useRooms.ts
│  │  ├─ useStaff.ts
│  │  ├─ useChurches.ts
│  │  ├─ useDashboardStats.ts
│  │  ├─ useGameScores.ts
│  │  └─ useMediaQuery.ts
│  │
│  ├─ auth.ts                       (Config Better Auth)
│  ├─ auth-client.ts                (Cliente auth)
│  ├─ utils.ts                      (Utilidades)
│  ├─ countries.ts                  (Datos de países)
│  └─ responsive-config.ts          (Config responsive)
│
└─ 📁 public/
   └─ Assets estáticos
```

---

## 🔄 FLUJO DE DATOS

### 1️⃣ AUTENTICACIÓN
```
Usuario
  ↓
/sign-in/page.tsx
  ↓
auth-form.tsx → Better Auth
  ↓
✓ Login exitoso
  ↓
root layout.tsx
  ├─ EventSessionProvider
  ├─ UserProvider
  ↓
/select-event (si no tiene evento default)
```

### 2️⃣ FLUJO DE SESIÓN
```
Usuario autenticado
  ↓
¿Evento default? (getDefaultEvent)
  ├─ SÍ → Dashboard
  └─ NO → /select-event
          ├─ selectEventClient.tsx
          ├─ getEventsByUser()
          ├─ Usuario selecciona evento + "Usar"
          ├─ setDefaultEvent(userId, eventId)
          └─ localStorage.setItem('eventSession', eventId)
```

### 3️⃣ FLUJO DEL DASHBOARD
```
/(app)/layout.tsx
├─ Topbar (usuario + evento + settings)
├─ Sidebar (navegación)
├─ Floating Dock (acceso rápido)
│
└─ /(app)/page.tsx
   └─ dashboard-client.tsx
      ├─ getDashboardData(eventId)
      ├─ getGameActivityData(eventId)
      ├─ Animaciones Framer Motion
      ├─ Balance (Tarjeta héroe)
      ├─ Ingresos/Egresos (Cards)
      ├─ Disponible por método (Barras)
      ├─ Gráficos (Recharts)
      └─ Estadísticas
```

### 4️⃣ FLUJO DE MÓDULOS (Ejemplo: Transactions)
```
/transactions/page.tsx
  ↓
transactions-client.tsx
  ├─ useTransactions() → getTransactions(eventId)
  ├─ Tabla + Filtros
  ├─ Botón "Crear +"
  │  ├─ Modal
  │  ├─ Formulario
  │  └─ createTransaction(userId, eventId, ...)
  │
  ├─ Click en fila
  │  ├─ Modal de edición
  │  └─ updateTransaction(...)
  │
  └─ Click en basura
     └─ deleteTransaction(...)
```

### 5️⃣ FLUJO DE BASE DE DATOS
```
Usuario (en Better Auth)
  ↓
Events (eventos del camp)
  ├─ event_members (relación usuario-evento, + isDefault)
  │
  └─ Para cada evento:
     ├─ Attendees (camperos)
     ├─ Transactions (ingresos/egresos)
     ├─ Games (juegos)
     ├─ Teams (equipos)
     ├─ Rooms (habitaciones)
     ├─ Staff (personal)
     ├─ Categories (categorías)
     └─ Churches (iglesias)

Todos los datos filtrados por eventId
```

---

## 🔑 CONCEPTOS CLAVE

### EVENT MANAGEMENT
- 1 usuario = múltiples eventos (admin o miembro)
- event_members = relación usuario-evento
- 1 evento tiene `isDefault = true` por usuario
- EventSessionContext almacena eventId en localStorage
- **Todos los datos scopeados a eventId**

### AUTENTICACIÓN
- Better Auth = sesiones seguras
- UserProvider = user autenticado disponible
- Rutas (app) = protegidas
- Sign-in/Sign-up = públicas

### DATOS
- **Server Actions** = operaciones CRUD sin API REST
- **SWR** = caché cliente + revalidación
- **Hooks custom** = abstracción por módulo
- **Drizzle ORM** = queries type-safe

### UI/UX
- **Framer Motion** = animaciones spring
- **Mobile-first** = 375px+
- **Shadcn/ui** = componentes accesibles
- **Tailwind CSS** = utility-first styling

---

## 🎯 FLUJO COMPLETO DE USUARIO

```
1. Visita nccamp.space
   ↓
2. Sin sesión → /sign-in
   ↓
3. Email + Contraseña → Better Auth
   ↓
4. ✓ Login exitoso → EventSessionProvider + UserProvider
   ↓
5. ¿Evento default en BD?
   ├─ SÍ → Dashboard
   └─ NO → /select-event
            └─ Selecciona evento + setDefaultEvent()
                ↓
6. Dashboard cargado
   ├─ Animaciones Framer Motion
   ├─ Balance, Ingresos, Egresos, Gráficos
   ↓
7. Navega entre módulos
   ├─ Transactions (finanzas)
   ├─ Games (juegos)
   ├─ Attendees (camperos)
   ├─ Teams (equipos)
   ├─ Rooms (habitaciones)
   ├─ Staff (personal)
   ├─ Categories (categorías)
   ├─ Churches (iglesias)
   └─ Settings (cambiar evento default)
   ↓
8. Datos guardados en Neon (PostgreSQL)
   ↓
9. Cierra sesión → Limpiar + logout
```

---

## 📡 MODELOS DE DATOS (Simplificado)

### Users (Better Auth)
```typescript
- id: string
- email: string
- name: string
- createdAt: Date
```

### Events
```typescript
- id: number
- adminId: string (user id)
- name: string
- country: string
- startDate: Date
- endDate: Date
- status: 'active' | 'completed'
```

### event_members
```typescript
- id: number
- eventId: number
- userId: string
- role: 'admin' | 'member'
- isDefault: boolean  ← CLAVE para evento predeterminado
- createdAt: Date
```

### Attendees
```typescript
- id: number
- eventId: number
- name: string
- email: string
- churchId: number
- roomId: number | null
- paid: boolean
- amount: number
```

### Transactions
```typescript
- id: number
- eventId: number
- userId: string
- type: 'income' | 'expense'
- amount: number
- description: string
- categoryId: number
- date: Date
- method: 'cash' | 'bank'
- createdAt: Date
```

### Games
```typescript
- id: number
- eventId: number
- name: string
- type: 'team' | 'individual'
- createdAt: Date
```

---

## 🚀 PUNTOS IMPORTANTES

1. **Event Scoping**: Todos los datos están filtrados por `eventId`. No hay datos globales.
2. **Default Event**: Almacenado en `event_members.isDefault` + localStorage en EventSessionContext
3. **Server Actions**: No hay API REST, todo es Server Actions (type-safe)
4. **Mobile First**: App optimizada para 375px+, también funciona desktop
5. **Capacitor Ready**: Código diseñado para empaquetar con Capacitor (iOS/Android)
6. **Animaciones**: Dashboard con Framer Motion (spring easing, stagger, count-up)
7. **Auth**: Better Auth maneja todo (sesiones, passwords hasheados, etc)

---

## 📚 CÓMO AGREGAR UN NUEVO MÓDULO

1. Crear `/app/(app)/new-module/page.tsx`
2. Crear `/components/new-module-client.tsx`
3. Crear `/app/actions/new-module.ts` con Server Actions
4. Crear `/lib/hooks/useNewModule.ts` con hook de datos
5. Crear tabla en `/lib/db/schema.ts`
6. Filtrar por `eventId` siempre
7. Agregar enlace en Sidebar y Floating Dock

---

Generado automáticamente para referencia rápida.
