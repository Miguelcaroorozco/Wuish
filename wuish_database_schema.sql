-- ==============================================================================
-- PROYECTO: WUISH - Ecosistema de Comunicación y Soluciones Tecnológicas
-- SCRIPT: Creación de Esquema de Base de Datos y Datos Iniciales
-- COMPATIBILIDAD: PostgreSQL 12+, pgAdmin 4, DBeaver, psql
-- ==============================================================================

-- 1. HABILITAR EXTENSIONES PARA GENERACIÓN DE UUID Y CRIPTOGRAFÍA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: USUARIOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    numero_cedula VARCHAR(30) NOT NULL UNIQUE,
    tipo_documento VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices de búsqueda para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON usuarios(numero_cedula);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- ==============================================================================
-- 3. TABLA: INFO GENERAL (CMS / Información Corporativa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS info_general (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seccion VARCHAR(100) NOT NULL,
    contenido TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_info_general_seccion ON info_general(seccion);

-- ==============================================================================
-- 4. TABLA: EQUIPO (Miembros del Equipo Wuish)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS equipo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    foto_url VARCHAR(255),
    descripcion TEXT,
    orden INT DEFAULT 0
);

-- ==============================================================================
-- 5. TABLA: TIPOS DE SERVICIO (Categorías de Negocio)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tipos_servicio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ==============================================================================
-- 6. TABLA: PLANES (Catálogo de Servicios y Planes Corporativos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS planes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_servicio_id UUID NOT NULL REFERENCES tipos_servicio(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12, 2) DEFAULT 0.00,
    caracteristicas JSONB DEFAULT '[]'::jsonb,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_planes_tipo_servicio ON planes(tipo_servicio_id);
CREATE INDEX IF NOT EXISTS idx_planes_activo ON planes(activo);

-- ==============================================================================
-- 7. TABLA: CARRITO ITEMS (Módulo de Compras / Solicitud de Planes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS carrito_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carrito_usuario ON carrito_items(usuario_id);

-- ==============================================================================
-- 8. TABLA: SOLICITUDES (Gestión de Servicios y Proyectos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'en_proceso', 'revision', 'completada', 'cancelada')),
    descripcion TEXT,
    plan_id UUID REFERENCES planes(id) ON DELETE SET NULL,
    admin_asignado_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_limite_borrado TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_admin ON solicitudes(admin_asignado_id);

-- ==============================================================================
-- 9. TABLA: SOLICITUD AJUSTES (Retroalimentación y Cambios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS solicitud_ajustes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    descripcion_ajuste TEXT NOT NULL,
    respondido_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ajustes_solicitud ON solicitud_ajustes(solicitud_id);

-- ==============================================================================
-- 10. TABLA: MENSAJES (Bandeja de Comunicación Soporte / Admin / Cliente)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL,
    asunto VARCHAR(150),
    contenido TEXT NOT NULL,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mensajes_usuario ON mensajes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_solicitud ON mensajes(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes(leido);

-- ==============================================================================
-- 11. TABLA: SOLICITUD HISTORIAL ESTADOS (Auditoría de Trazabilidad)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS solicitud_historial_estados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    motivo VARCHAR(255),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historial_solicitud ON solicitud_historial_estados(solicitud_id);

-- ==============================================================================
-- 12. TABLA: COMENTARIOS (Testimonios y Calificaciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL,
    calificacion INT DEFAULT 5 CHECK (calificacion BETWEEN 1 AND 5),
    mostrar_en_pagina BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comentarios_publicos ON comentarios(mostrar_en_pagina, orden);

-- ==============================================================================
-- 13. TABLA: RESULTADOS (Cifras y Métricas de Impacto de la Landing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS resultados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_resultados_activo ON resultados(activo, orden);

-- ==============================================================================
-- 14. TABLA: PASOS PROCESO (Metodología de Trabajo en la Landing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pasos_proceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_paso INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(100)
);

-- ==============================================================================
-- 15. FUNCIÓN Y TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_solicitudes_updated_at ON solicitudes;
CREATE TRIGGER trg_solicitudes_updated_at
BEFORE UPDATE ON solicitudes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_info_general_updated_at ON info_general;
CREATE TRIGGER trg_info_general_updated_at
BEFORE UPDATE ON info_general
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 16. DATOS INICIALES (SEED / CARGA INICIAL)
-- ==============================================================================

-- 16.1. Usuarios (Administrador y Cliente de Prueba)
-- Contraseñas:
-- admin@wuish.com  -> admin123
-- cliente@wuish.io -> cliente123
INSERT INTO usuarios (id, nombres, apellidos, numero_cedula, tipo_documento, fecha_nacimiento, telefono, correo, password_hash, rol)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Admin',
    'Wuish',
    '9999999999',
    'CC',
    '1988-01-01',
    '+57 300 000 0000',
    'admin@wuish.com',
    '$2b$10$G2sCy2GnBxr4bByvn/mREOm9XgdYtgTEzTMzBj5bL8ATsPajAhGM.',
    'admin'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Alejandro',
    'Morales',
    '1020304050',
    'CC',
    '1992-06-15',
    '+57 300 123 4567',
    'cliente@wuish.io',
    '$2b$10$v9oK2lJ5Rqd4Yrj.tdsPvefvxyhGMupEsLATSJ6JPTIKdZbKPkOIe',
    'usuario'
)
ON CONFLICT (correo) DO UPDATE 
SET rol = EXCLUDED.rol, password_hash = EXCLUDED.password_hash;

-- 16.2. Tipos de Servicio
INSERT INTO tipos_servicio (id, nombre, descripcion)
VALUES 
(
    '11111111-1111-1111-1111-111111111101',
    'Tecnología & Software',
    'Desarrollo web a medida, arquitecturas cloud, microservicios y automatización de procesos corporativos.'
),
(
    '11111111-1111-1111-1111-111111111102',
    'Comunicación Estratégica',
    'Campañas de posicionamiento institucional, producción multimedia 4K y narrativa de marca.'
)
ON CONFLICT (id) DO NOTHING;

-- 16.3. Planes Corporativos
INSERT INTO planes (id, tipo_servicio_id, nombre, descripcion, precio, caracteristicas, activo)
VALUES 
(
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'Plataforma Core & Web',
    'Diseño y desarrollo de aplicación web transaccional de alto rendimiento.',
    1200.00,
    '["Arquitectura React / Next.js", "Base de datos PostgreSQL de alta disponibilidad", "Panel de administración CMS", "SLA 99.9% y soporte técnico 24/7"]'::jsonb,
    TRUE
),
(
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'Ecosistema Enterprise Growth',
    'Solución completa con integraciones CRM, ERP y flujos automatizados de alta disponibilidad.',
    2800.00,
    '["Todo lo de Plataforma Core", "Integraciones API personalizadas", "Webhooks y microservicios dedicados", "Auditoría de seguridad y pruebas de carga"]'::jsonb,
    TRUE
),
(
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111102',
    'Narrativa & Posicionamiento 360',
    'Estrategia de comunicación omnicanal y producción de contenidos de alto impacto.',
    950.00,
    '["Estrategia de marca e identidad verbal", "Producción audiovisual 4K", "Kit de activos digitales multiformato", "Reporte mensual de métricas de alcance"]'::jsonb,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 16.4. Info General (CMS Institucional)
INSERT INTO info_general (id, seccion, contenido, updated_by)
VALUES 
(
    uuid_generate_v4(),
    'slogan',
    'Ecosistema integral que fusiona tecnología de punta y comunicación estratégica para empresas en crecimiento.',
    (SELECT id FROM usuarios WHERE correo = 'admin@wuish.com' LIMIT 1)
),
(
    uuid_generate_v4(),
    'manifesto',
    'Creemos en la velocidad, en el código robusto y en historias memorables que impulsan organizaciones hacia el futuro.',
    (SELECT id FROM usuarios WHERE correo = 'admin@wuish.com' LIMIT 1)
),
(
    uuid_generate_v4(),
    'mision',
    'Potenciar a negocios y líderes corporativos con soluciones digitales vanguardistas y resultados medibles.',
    (SELECT id FROM usuarios WHERE correo = 'admin@wuish.com' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- 16.5. Resultados y Métricas de Impacto (Barra estadística de la Landing)
INSERT INTO resultados (id, titulo, descripcion, activo, orden)
VALUES 
(uuid_generate_v4(), '120+', 'Proyectos Corporativos Ejecutados', TRUE, 1),
(uuid_generate_v4(), '98%',  'Tasa de Retención de Clientes', TRUE, 2),
(uuid_generate_v4(), '3x',   'Retorno de Inversión (ROI) Promedio', TRUE, 3),
(uuid_generate_v4(), '72h',  'Kickoff Técnico y Despliegue', TRUE, 4)
ON CONFLICT DO NOTHING;

-- 16.6. Testimonios Corporativos para el Carrusel del Inicio
INSERT INTO comentarios (id, usuario_id, contenido, calificacion, mostrar_en_pagina, orden)
VALUES 
(
    uuid_generate_v4(),
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'WUISH reestructuró por completo nuestra infraestructura digital y la narrativa de marca. Redujimos tiempos de respuesta en un 40% y el impacto ante nuestros inversores fue inmediato.',
    5,
    TRUE,
    1
),
(
    uuid_generate_v4(),
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'La implementación de la plataforma a medida y la automatización de procesos revolucionaron nuestra operación diaria. La dedicación técnica y el acompañamiento estratégico son de primer nivel.',
    5,
    TRUE,
    2
),
(
    uuid_generate_v4(),
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'Excelente nivel de ingeniería y estándares de seguridad corporativa. Cumplieron cada hito de entrega y construyeron una arquitectura sólida, escalable y sin fisuras.',
    5,
    TRUE,
    3
),
(
    uuid_generate_v4(),
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'Unificar producción audiovisual 4K y desarrollo tecnológico en un solo socio estratégico nos otorgó una ventaja competitiva decisiva en el mercado internacional.',
    5,
    TRUE,
    4
),
(
    uuid_generate_v4(),
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'El portal corporativo y los tableros analíticos en tiempo real nos permitieron triplicar la tasa de conversión en nuestro canal B2B durante el último trimestre.',
    5,
    TRUE,
    5
)
ON CONFLICT DO NOTHING;

-- 16.7. Pasos del Proceso Metodológico
INSERT INTO pasos_proceso (id, numero_paso, titulo, descripcion, icono)
VALUES 
(uuid_generate_v4(), 1, 'Diagnóstico & Estrategia', 'Evaluamos el estado actual de tu negocio y definimos el roadmap de ejecución.', 'Search'),
(uuid_generate_v4(), 2, 'Diseño & Arquitectura', 'Modelamos la experiencia de usuario y estructuramos la tecnología para escalar.', 'Layers'),
(uuid_generate_v4(), 3, 'Desarrollo & Producción', 'Desarrollo ágil con entregas continuas y validaciones en tiempo real.', 'Code'),
(uuid_generate_v4(), 4, 'Despliegue & Monitoreo', 'Puesta en marcha con alta disponibilidad y acompañamiento analítico.', 'Rocket')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- FIN DEL SCRIPT SQL
-- ==============================================================================
