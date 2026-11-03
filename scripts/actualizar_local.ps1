$ErrorActionPreference = 'Stop'

$scriptPath = $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent $scriptPath)
$apiDir = Join-Path $rootDir 'wuish-api'

function Invoke-Step {
    param(
        [string]$Command,
        [string[]]$Arguments
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "El comando falló: $Command $($Arguments -join ' ')"
    }
}

if (-not (Test-Path (Join-Path $apiDir '.env'))) {
    throw "Falta el archivo local $apiDir\.env. Configúralo con la base de datos de pruebas."
}

Set-Location $rootDir

$status = git status --porcelain
if ($status) {
    git status --short
    throw 'Hay cambios locales. Haz commit, stash o elimina esos cambios antes de actualizar.'
}

$remote = git remote | Select-Object -First 1
if (-not $remote) {
    throw 'El repositorio no tiene un remoto configurado.'
}

Write-Host "Actualizando el código desde $remote/main..."
Invoke-Step 'git' @('fetch', $remote, 'main')
Invoke-Step 'git' @('switch', 'main')
Invoke-Step 'git' @('pull', '--ff-only', $remote, 'main')

Write-Host 'Instalando dependencias del frontend...'
Invoke-Step 'npm' @('ci')

Write-Host 'Instalando dependencias del backend...'
Invoke-Step 'npm' @('--prefix', $apiDir, 'ci')

Write-Host 'Generando Prisma Client...'
Invoke-Step 'npx' @('--prefix', $apiDir, 'prisma', 'generate', '--schema', (Join-Path $apiDir 'prisma\schema.prisma'))

Write-Host 'Sincronizando la base de datos local...'
Invoke-Step 'npx' @('--prefix', $apiDir, 'prisma', 'db', 'push', '--schema', (Join-Path $apiDir 'prisma\schema.prisma'))

Write-Host 'Validando TypeScript del frontend...'
Invoke-Step 'npm' @('run', 'lint')

Write-Host 'Compilando el backend...'
Invoke-Step 'npm' @('--prefix', $apiDir, 'run', 'build')

Write-Host 'Compilando el frontend...'
Invoke-Step 'npm' @('run', 'build')

Write-Host 'Actualización local completada correctamente.'
