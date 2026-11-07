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

$branch = git branch --show-current
if (-not $branch) {
    throw 'El repositorio está en detached HEAD. Cambia a una rama antes de actualizar.'
}

Write-Host "Actualizando el código desde $remote/$branch..."
Write-Host "Rama local: $branch"
Invoke-Step 'git' @('fetch', $remote, $branch)
Invoke-Step 'git' @('pull', '--ff-only', $remote, $branch)

Write-Host 'Instalando dependencias del frontend...'
Invoke-Step 'npm' @('ci')

Write-Host 'Instalando dependencias del backend...'
Invoke-Step 'npm' @('--prefix', $apiDir, 'ci')

Write-Host 'Generando Prisma Client...'
Push-Location $apiDir
try {
    Invoke-Step 'npx' @('prisma', 'generate')

    Write-Host 'Sincronizando la base de datos local...'
    Invoke-Step 'npx' @('prisma', 'db', 'push')
}
finally {
    Pop-Location
}

Write-Host 'Validando TypeScript del frontend...'
Invoke-Step 'npm' @('run', 'lint')

Write-Host 'Compilando el backend...'
Invoke-Step 'npm' @('--prefix', $apiDir, 'run', 'build')

Write-Host 'Compilando el frontend...'
Invoke-Step 'npm' @('run', 'build')

Write-Host 'Actualización local completada correctamente.'
