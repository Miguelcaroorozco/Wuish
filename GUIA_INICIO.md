# 🚀 Guía de Inicio Rápido — WUISH

Bienvenido a la documentación de inicio del ecosistema **WUISH**. Este documento detalla todos los comandos necesarios para poner en marcha la aplicación, cómo configurar la base de datos PostgreSQL y la explicación de cada variable en los archivos `.env`.

---

## 📋 1. Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu equipo:
- **Node.js**: Versión 18.x o superior ([Descargar Node.js](https://nodejs.org/)).
- **PostgreSQL**: Versión 12 o superior ([Descargar PostgreSQL](https://www.postgresql.org/download/)).
- **pgAdmin 4** (opcional pero recomendado) o cualquier cliente SQL como DBeaver / TablePlus.
- **Git** para el control de versiones.

---

## 📂 2. Estructura de la Aplicación

El proyecto está diseñado como un monorepositorio ligero que contiene frontend y backend desacoplados:

```
Wuish/
├── src/                          # Código fuente del Frontend (React 19 + Vite)
├── public/                       # Activos estáticos públicos
├── wuish_database_schema.sql     # Script SQL con tablas, triggers y datos iniciales
├── package.json                  # Scripts principales y dependencias frontend
│
└── wuish-api/                    # Backend API (NestJS + Prisma ORM)
    ├── src/                      # Módulos, controladores y servicios NestJS
    ├── prisma/                   # Esquema Prisma y migraciones
    │   ├── schema.prisma         # Modelo de datos Prisma
    │   ├── schema.sql            # Copia del script SQL
    │   └── seed.ts               # Script de siembra de datos de prueba
    ├── package.json              # Dependencias y scripts del backend
    ├── .env                      # Variables de entorno activas del backend
    └── .env.example              # Plantilla de variables backend
```

---

## ⚙️ 3. Explicación Completa de los Archivos `.env`

Las variables de entorno permiten configurar conexiones a bases de datos, claves de seguridad y puertos sin exponer credenciales en el código fuente.

### 🟡 Backend API (`wuish-api/.env`)
Ubicación del archivo: `wuish-api/.env`

| Variable | Ejemplo / Valor por Defecto | Explicación |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:1234@localhost:5432/wuish` | **Cadena de conexión a PostgreSQL**. Indica cómo el ORM Prisma se conecta a la base de datos. |
| `JWT_SECRET` | `wuish_jwt_secret_2026` | **Clave secreta criptográfica**. Utilizada para firmar y verificar tokens de autenticación de usuario (JSON Web Tokens). En producción debe ser una cadena aleatoria y compleja. |
| `PORT` | `3001` | **Puerto TCP del backend**. Puerto en el que el servidor NestJS escucha peticiones HTTP. |

#### Desglose de la variable `DATABASE_URL`:
```
postgresql://postgres:1234@localhost:5432/wuish
  ▲           ▲        ▲       ▲        ▲     ▲
  │           │        │       │        │     └── Nombre de la base de datos
  │           │        │       │        └──────── Puerto de PostgreSQL (por defecto: 5432)
  │           │        │       └───────────────── Host o servidor (localhost en tu máquina)
  │           │        └───────────────────────── Contraseña del usuario de Postgres
  │           └────────────────────────────────── Usuario de Postgres (comúnmente: postgres)
  └────────────────────────────────────────────── Driver / protocolo de conexión
```

> **Nota:** Si al instalar PostgreSQL definiste una contraseña diferente a `1234`, cámbiala en `wuish-api/.env` respetando este formato.

---

> 💡 **Nota importante:** El Frontend **NO requiere ningún archivo `.env` para funcionar**, ya que por defecto se conecta directamente al backend en `http://localhost:3001/api`. Por esta razón, el **único archivo `.env` que necesita tu proyecto** es el del backend: `wuish-api/.env`.

---

## 🗄️ 4. Configuración de la Base de Datos PostgreSQL

Antes de iniciar el backend, asegúrate de que el servicio de PostgreSQL esté en ejecución y la base de datos exista:

### Paso 4.1: Crear la base de datos en PostgreSQL
Abre **pgAdmin 4** o la terminal `psql`:
```sql
CREATE DATABASE wuish;
```

### Paso 4.2: Ejecutar el esquema y datos iniciales
Tienes dos opciones equivalentes:

#### Opción A (Recomendada con pgAdmin):
1. En pgAdmin, haz clic derecho sobre la base de datos `wuish` y selecciona **Query Tool**.
2. Abre el archivo `wuish_database_schema.sql` (ubicado en la raíz del proyecto).
3. Presiona **F5** o haz clic en ▶ (**Execute**).
4. Todas las 13 tablas, triggers de actualización, índices y datos iniciales quedarán listos.

#### Opción B (Desde la terminal con Prisma):
```bash
# Entrar a la carpeta del backend
cd wuish-api

# Generar el cliente de Prisma
npx prisma generate

# Empujar el esquema a la base de datos
npx prisma db push

# Poblar con datos de prueba iniciales
npx ts-node prisma/seed.ts
```

---

## 💻 5. Comandos para Iniciar la Aplicación

### Paso 5.1: Instalación de dependencias (solo la primera vez)

1. **Instalar dependencias del Frontend (en la raíz):**
   ```bash
   npm install
   ```

2. **Instalar dependencias del Backend API:**
   ```bash
   cd wuish-api
   npm install
   cd ..
   ```

---

### Paso 5.2: Iniciar los Servidores en Modo Desarrollo

Desde la raíz del proyecto (`Wuish/`), puedes ejecutar:

#### ⚡ Opción 1: Iniciar Todo en un solo comando (Recomendado)
Inicia el Frontend (puerto 3000) y la API Backend (puerto 3001) simultáneamente con colores diferenciados:
```bash
npm run dev
```

#### 🌐 Opción 2: Iniciar cada servicio en terminales separadas

- **Terminal 1 (Frontend):**
  ```bash
  npm run dev:frontend
  ```
  *Disponible en:* `http://localhost:3000`

- **Terminal 2 (Backend API):**
  ```bash
  npm run dev:api
  ```
  *Disponible en:* `http://localhost:3001/api`

---

## 🛠️ 6. Otros Comandos Útiles

| Comando | Dónde ejecutarlo | Descripción |
|---|---|---|
| `npm run lint` | Raíz | Valida tipos de TypeScript sin emitir archivos (`tsc --noEmit`). |
| `npm run build` | Raíz | Compila la versión optimizada de producción del frontend (`dist/`). |
| `npm run preview` | Raíz | Previsualiza localmente el build de producción generado. |
| `npx prisma studio` | `wuish-api/` | Abre una interfaz visual en el navegador (`http://localhost:5555`) para ver y editar registros de la base de datos. |
| `npx prisma db push` | `wuish-api/` | Sincroniza cambios de `schema.prisma` directamente en PostgreSQL. |

---

## 🔑 7. Credenciales por Defecto

El script de base de datos incluye dos usuarios preconfigurados listos para iniciar sesión:

### 👑 Usuario Administrador
- **Correo:** `admin@wuish.com`
- **Contraseña:** `admin123`
- **Rol:** `admin` (Acceso completo al Panel de Administración: solicitudes, CMS, portafolio, resultados y testimonios).

### 👤 Usuario Cliente de Prueba
- **Correo:** `cliente@wuish.io`
- **Contraseña:** `cliente123`
- **Rol:** `usuario` (Acceso al Portal del Cliente: mis servicios, seguimiento de proyecto, mensajes de soporte y opiniones).

---

## ❓ 8. Preguntas Frecuentes y Solución de Problemas

### Error: `ECONNREFUSED 127.0.0.1:5432`
- **Causa:** El servicio de PostgreSQL no está iniciado o está en otro puerto.
- **Solución:** En Windows, abre *Servicios* (`services.msc`), busca `postgresql-x64-[versión]` y asegúrate de que su estado sea **En ejecución**.

### Error: `authentication failed for user "postgres"`
- **Causa:** La contraseña en `wuish-api/.env` no coincide con la configurada en tu instalación local de PostgreSQL.
- **Solución:** Edita `wuish-api/.env` y coloca tu contraseña real en `DATABASE_URL`.

### Error: `Port 3000 is already in use` o `Port 3001 is already in use`
- **Causa:** Hay otra instancia de Node.js corriendo en ese puerto.
- **Solución en Windows PowerShell:**
  ```powershell
  # Ver qué proceso usa el puerto 3001
  netstat -ano | findstr :3001
  # Cerrar el proceso por su PID
  taskkill /PID <NUMERO_PID> /F
  ```
