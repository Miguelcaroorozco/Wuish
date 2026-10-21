# GUÍA DE SEGURIDAD DEL PROYECTO WUISH (20 PUNTOS)

De ahora en adelante, todo desarrollo, auditoría y refactorización en Wuish debe adherirse estrictamente a los 20 puntos de seguridad definidos a continuación:

## 1. SECRETOS Y CREDENCIALES
1. **Ocultar API keys:** Ninguna key, secreto o credencial directa en código o frontend. Solo variables de entorno (`.env`), con `.env.example` documentado.
2. **Eliminar secretos de Git:** Evitar o purgar credenciales en el historial de Git, configurar `.gitignore` estricto y pre-commit hooks.
3. **Key pública para la DB:** Frontend solo utiliza keys públicas o interactúa a través de la API backend (NestJS). Claves privadas residen exclusivamente en el backend.

## 2. BASE DE DATOS Y DATOS SENSIBLES
4. **Row-Level Security (RLS) / Aislamiento:** Políticas para que cada usuario solo pueda leer, crear, editar y borrar sus propios registros (aislamiento por `usuario_id`).
5. **Encriptar datos sensibles:** Proteger datos sensibles (teléfonos, documentos, etc.) en reposo y en tránsito.

## 3. AUTENTICACIÓN Y ACCESO
6. **Forzar autenticación:** Endpoints protegidos con Guards/Middlewares (`JwtAuthGuard`, etc.). Bloquear usuarios no autenticados con 401 consistente.
7. **Restringir acceso a registros (Anti-IDOR):** Verificar siempre la propiedad del recurso (`usuario_id === req.user.id` o rol `admin`).
8. **Bloquear manipulación de campos (Anti-Mass Assignment):** Lista blanca de campos permitidos vía DTOs (`ValidationPipe` con `whitelist: true`, `forbidNonWhitelisted: true`). Prohibir alteración de `rol`, `id`, `created_at`, etc. por clientes estándar.
9. **Proteger sesiones / cookies / tokens:** Tokens seguros con expiración controlada, mitigación CSRF y transporte seguro.
10. **Hashear contraseñas:** Uso de `bcrypt` o `argon2` con salt y costo seguro. Nunca texto plano ni contraseñas devueltas en respuestas.

## 4. PROTECCIÓN CONTRA ABUSO
11. **Rate limiting:** Limitar peticiones abusivas en endpoints críticos (login, registro, recuperación de contraseña) y generales vía Throttler.
12. **Protección contra bots:** Honeypots o CAPTCHA en formularios públicos.

## 5. VALIDACIÓN DE DATOS
13. **Parametrizar queries (Anti-SQLi):** Uso exclusivo de consultas parametrizadas u ORM (Prisma). Nunca concatenación de strings en SQL.
14. **Validar inputs:** Validación estricta en servidor con `class-validator` / `ValidationPipe` en NestJS para tipo, formato, rango y longitud.
15. **Sanitizar contenido (Anti-XSS):** Sanitización de inputs y Content Security Policy (CSP).
16. **Restringir archivos:** Validación de tipos MIME reales, tamaño máximo, renombramiento aleatorio y almacenamiento seguro fuera del árbol de ejecución.
17. **Devolver solo datos necesarios:** Uso de DTOs, exclusión explícita de `password_hash` y datos sensibles de terceros.

## 6. INFRAESTRUCTURA
18. **Security headers:** Configuración de cabeceras seguras (Helmet, CSP, X-Frame-Options, X-Content-Type-Options, HSTS).
19. **Forzar HTTPS:** Redirección segura, HSTS y sin contenido mixto (mixed content).
20. **Escanear dependencias:** Auditoría periódica con `npm audit` y actualización de librerías vulnerables.
