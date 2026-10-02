# WUISH — Plataforma de Comunicación y Soluciones Tecnológicas

Ecosistema integral que fusiona tecnología de punta y comunicación estratégica. Plataforma moderna desarrollada con **React 19**, **NestJS**, **Prisma ORM** y **PostgreSQL**.

## Requisitos previos

- **Node.js** 18.x o superior ([Descargar Node.js](https://nodejs.org/)).
- **PostgreSQL** 12 o superior ([Descargar PostgreSQL](https://www.postgresql.org/download/)).
- **pgAdmin 4** (opcional) o cualquier cliente SQL como DBeaver / TablePlus.
- **Git**.

## Estructura de la aplicación

```text
Wuish/
├── src/                          # Frontend (React 19 + Vite)
├── public/                       # Activos estáticos
├── package.json                  # Dependencias y scripts frontend
└── wuish-api/                    # Backend (NestJS + Prisma ORM)
    ├── src/                      # Módulos, controladores y servicios
    ├── prisma/
    │   ├── schema.prisma         # Modelo de datos Prisma
    │   ├── schema.sql            # Script SQL de la base de datos
    │   └── seed.ts               # Datos iniciales de prueba
    ├── package.json
    ├── .env                      # Variables activas del backend
    └── .env.example              # Plantilla de variables
```

## Inicio rápido

### 1. Instalar dependencias

Desde la raíz del proyecto:

```bash
npm install
cd wuish-api
npm install
cd ..
```

### 2. Configurar el backend

Copia `wuish-api/.env.example` como `wuish-api/.env` y configura:

| Variable | Ejemplo | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:1234@localhost:5432/wuish` | Conexión a PostgreSQL. |
| `JWT_SECRET` | `cambia-esta-clave` | Clave para firmar tokens JWT. Usa una cadena aleatoria en producción. |
| `PORT` | `3001` | Puerto del backend NestJS. |

El frontend no necesita un archivo `.env`; por defecto usa `http://localhost:3001/api`.

### 3. Crear y preparar la base de datos

Primero crea la base de datos:

```sql
CREATE DATABASE wuish;
```

Después elige una de estas opciones:

**Opción recomendada con Prisma:**

```bash
cd wuish-api
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
cd ..
```

**Opción con pgAdmin:**

1. Abre la base de datos `wuish` y selecciona **Query Tool**.
2. Ejecuta [schema.sql](wuish-api/prisma/schema.sql).
3. Ejecuta el script y, si necesitas datos de prueba, ejecuta también `npx ts-node prisma/seed.ts` desde `wuish-api`.

> Antes de usar `prisma db push` en producción, realiza una copia de seguridad. Este proyecto usa `db push` y no migraciones formales.

### 4. Iniciar la aplicación

Para iniciar frontend y backend juntos:

```bash
npm run dev
```

URLs disponibles:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`

También puedes iniciar cada servicio por separado:

```bash
npm run dev:frontend
npm run dev:api
```

## Comandos útiles

| Comando | Ubicación | Descripción |
|---|---|---|
| `npm run lint` | Raíz | Valida TypeScript sin emitir archivos. |
| `npm run build` | Raíz | Genera el build optimizado del frontend. |
| `npm run preview` | Raíz | Previsualiza el build de producción. |
| `npx prisma studio` | `wuish-api/` | Abre el navegador visual de Prisma. |
| `npx prisma db push` | `wuish-api/` | Sincroniza `schema.prisma` con PostgreSQL. |
| `npx prisma generate` | `wuish-api/` | Regenera el cliente Prisma. |
| `npx ts-node prisma/seed.ts` | `wuish-api/` | Carga datos de prueba. |

## Actualizar la base de datos

Cuando se modifica `wuish-api/prisma/schema.prisma`, ejecuta:

```bash
cd wuish-api
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

Solo es necesario actualizar la base de datos cuando se cambia el schema: se agregan modelos, columnas, relaciones, tipos o restricciones. Los cambios únicamente en `src/` o en servicios/controladores del backend no requieren `db push`.

Para revisar la base de datos:

```bash
cd wuish-api
npx prisma studio
```

## Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@wuish.com` | `admin123` |
| Cliente | `cliente@wuish.io` | `cliente123` |

## Solución de problemas

### `ECONNREFUSED 127.0.0.1:5432`

PostgreSQL no está iniciado o usa otro puerto. En Windows, abre `services.msc` y verifica que el servicio `postgresql-x64-[versión]` esté en ejecución.

### `authentication failed for user "postgres"`

La contraseña de `wuish-api/.env` no coincide con la de PostgreSQL. Actualiza `DATABASE_URL` con la contraseña correcta.

### `Port 3000 is already in use` o `Port 3001 is already in use`

En PowerShell:

```powershell
netstat -ano | findstr :3001
taskkill /PID <NUMERO_PID> /F
```

Reemplaza `<NUMERO_PID>` por el PID del proceso que ocupa el puerto.

### `P3009` o campos desconocidos después de modificar Prisma

Regenera el cliente y vuelve a sincronizar la base de datos:

```bash
cd wuish-api
npx prisma generate
npx prisma db push
```
