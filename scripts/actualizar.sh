#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$ROOT_DIR/wuish-api"
BRANCH="${BRANCH:-main}"
PM2_APP="${PM2_APP:-wuish-api}"
API_PORT="${PORT:-3001}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/.backups}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}

trap 'printf "\nERROR: actualización detenida en la línea %s. No se reinició PM2.\n" "$LINENO" >&2' ERR

command -v git >/dev/null 2>&1 || fail "git no está instalado."
command -v npm >/dev/null 2>&1 || fail "npm no está instalado."
command -v npx >/dev/null 2>&1 || fail "npx no está disponible."
command -v pm2 >/dev/null 2>&1 || fail "pm2 no está instalado."
command -v curl >/dev/null 2>&1 || fail "curl no está instalado."

[[ -d "$API_DIR" ]] || fail "No existe el backend en $API_DIR."
[[ -f "$API_DIR/.env" ]] || fail "Falta $API_DIR/.env."

cd "$ROOT_DIR"
[[ "$(git rev-parse --show-toplevel)" == "$ROOT_DIR" ]] || fail "La carpeta no es la raíz del repositorio."
REMOTE="${REMOTE:-$(git remote | head -n 1)}"
[[ -n "$REMOTE" ]] || fail "El repositorio no tiene un remoto configurado."

if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  fail "Hay cambios locales. Haz commit, stash o elimina esos cambios antes de actualizar."
fi

log "Actualizando el código desde $REMOTE/$BRANCH"
git fetch "$REMOTE" "$BRANCH"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git switch "$BRANCH"
else
  git switch --create "$BRANCH" --track "$REMOTE/$BRANCH"
fi
git pull --ff-only "$REMOTE" "$BRANCH"

log "Instalando dependencias del frontend"
npm ci

log "Instalando dependencias del backend"
npm --prefix "$API_DIR" ci

log "Generando Prisma Client"
npx --prefix "$API_DIR" prisma generate

set -a
# Prisma y la copia de seguridad necesitan las variables del entorno de producción.
# shellcheck disable=SC1091
source "$API_DIR/.env"
set +a
[[ -n "${DATABASE_URL:-}" ]] || fail "DATABASE_URL no está definido en $API_DIR/.env."

mkdir -p "$BACKUP_DIR"
if command -v pg_dump >/dev/null 2>&1; then
  backup_file="$BACKUP_DIR/wuish_$(date '+%Y%m%d_%H%M%S').dump"
  log "Creando copia de seguridad en $backup_file"
  pg_dump --format=custom --file="$backup_file" "$DATABASE_URL"
else
  fail "pg_dump no está instalado; no se puede actualizar la base de datos sin copia de seguridad."
fi

log "Verificando y sincronizando la base de datos con Prisma"
npx --prefix "$API_DIR" prisma db push

log "Compilando el backend"
npm --prefix "$API_DIR" run build

log "Compilando el frontend"
npm run build

log "Reiniciando $PM2_APP"
if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env
else
  pm2 start "$API_DIR/dist/main.js" --name "$PM2_APP"
fi
pm2 save

log "Comprobando disponibilidad de la API"
for attempt in {1..15}; do
  if curl --silent --show-error --fail \
    --max-time 5 "http://127.0.0.1:${PORT:-$API_PORT}/api/planes" >/dev/null; then
    log "API disponible en http://127.0.0.1:${PORT:-$API_PORT}/api"
    pm2 status "$PM2_APP"
    exit 0
  fi
  sleep 2
done

pm2 logs "$PM2_APP" --lines 50 --nostream || true
fail "La API no respondió después de reiniciar PM2."
