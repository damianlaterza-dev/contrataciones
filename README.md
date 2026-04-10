# Contrataciones 2026

Sistema de gestión de contrataciones, contratos y proyectos.

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma ORM v6 con MySQL
- NextAuth v5 (Google OAuth)
- Radix UI + Tailwind CSS v4
- React Query + React Hook Form

## Prerequisitos

- Node.js 20+
- MySQL corriendo localmente (XAMPP recomendado)
- Una base de datos `contrataciones` creada en MySQL (puede estar vacía — las migraciones crean las tablas)

## Setup inicial

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd contrataciones-2026
npm install
```

`npm install` ejecuta automáticamente `prisma generate` via el script `postinstall`.

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores locales. Como mínimo configurar `DATABASE_URL` y las credenciales de Google OAuth.

### 3. Crear la base de datos en MySQL

Usando phpMyAdmin o la CLI de MySQL:

```sql
CREATE DATABASE contrataciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Aplicar migraciones y poblar datos de referencia

```bash
npm run db:setup
```

Este comando aplica todos los archivos de migración (crea las tablas) y luego ejecuta el seed (roles, estados, etc.).

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Scripts de base de datos

| Comando | Descripción |
|---|---|
| `npm run db:setup` | Setup completo: aplica migraciones + seed |
| `npm run db:migrate` | Crear nueva migración después de cambios en el schema |
| `npm run db:migrate:deploy` | Aplicar migraciones sin prompts (CI/producción) |
| `npm run db:seed` | Re-ejecutar seed (idempotente) |
| `npm run db:reset` | Dropea la DB, re-aplica todas las migraciones y re-seedea |
| `npm run db:studio` | Abrir Prisma Studio GUI |

## Hacer cambios al schema

1. Editar `prisma/schema.prisma`
2. Ejecutar `npm run db:migrate` y darle un nombre descriptivo a la migración
3. Commitear el archivo generado en `prisma/migrations/`

El archivo de migración es el SQL portable — nunca editarlo manualmente después de crearlo.

## Estructura del proyecto

```
prisma/
  schema.prisma       # Fuente de verdad del schema de la DB
  migrations/         # Historial de migraciones SQL (commiteadas al repo)
  seed.ts             # Script para datos de referencia iniciales
src/
  app/api/            # API routes de Next.js
  lib/
    prisma.ts         # Singleton de Prisma (usar siempre este)
  services/           # Lógica de negocio y queries a la DB
```
