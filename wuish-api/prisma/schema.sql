-- ==============================================================================
-- PROYECTO: WUISH - Ecosistema de Comunicación y Soluciones Tecnológicas
-- SCRIPT: Esquema de Base de Datos — Sincronizado con Prisma Schema
-- COMPATIBILIDAD: PostgreSQL 12+
-- ÚLTIMA ACTUALIZACIÓN: Sincronizado con schema.prisma actual
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: USUARIOS (Clientes y Administradores)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombres          VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    numero_cedula    VARCHAR(30)  NOT NULL UNIQUE,
    tipo_documento   VARCHAR(20)  NOT NULL,
    empresa          VARCHAR(150),
    cargo            VARCHAR(100),
    fecha_nacimiento DATE         NOT NULL,
    telefono         VARCHAR(20),
    correo           VARCHAR(150) NOT NULL UNIQUE,
    password_hash    VARCHAR(255),
    rol              VARCHAR(20)  NOT NULL DEFAULT 'usuario',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_correo   ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula   ON usuarios(numero_cedula);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol      ON usuarios(rol);

-- ==============================================================================
-- 3. TABLA: INFO GENERAL (CMS Institucional — Eslogan, Misión, Visión, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS info_general (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    seccion    VARCHAR(100) NOT NULL UNIQUE,
    contenido  TEXT,
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID         REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_info_general_seccion ON info_general(seccion);

-- ==============================================================================
-- 4. TABLA: TIPOS DE SERVICIO (Líneas de Negocio)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tipos_servicio (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ==============================================================================
-- 5. TABLA: PLANES (Plantillas del Cotizador y Paquetes Comerciales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS planes (
    id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_servicio_id UUID          NOT NULL REFERENCES tipos_servicio(id) ON DELETE CASCADE,
    nombre           VARCHAR(100)  NOT NULL,
    descripcion      TEXT,
    precio           NUMERIC(12,2) DEFAULT 0.00,
    caracteristicas  JSONB         DEFAULT '[]'::jsonb,
    activo           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_planes_tipo_servicio ON planes(tipo_servicio_id);
CREATE INDEX IF NOT EXISTS idx_planes_activo        ON planes(activo);

-- ==============================================================================
-- 6. TABLA: MÓDULOS DEL COTIZADOR (Servicios seleccionables en la cotización)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS cotizador_modulos (
    id          VARCHAR(60)   PRIMARY KEY,
    nombre      VARCHAR(150)  NOT NULL,
    categoria   VARCHAR(50)   NOT NULL,   -- 'comunicacion' | 'tecnologia'
    precio_base NUMERIC(12,2) NOT NULL,
    descripcion TEXT          NOT NULL,
    activo      BOOLEAN       NOT NULL DEFAULT TRUE,
    orden       INT           NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cotizador_modulos_categoria ON cotizador_modulos(categoria);
CREATE INDEX IF NOT EXISTS idx_cotizador_modulos_activo    ON cotizador_modulos(activo, orden);

-- ==============================================================================
-- 7. TABLA: SOLICITUDES & COTIZACIONES
--    tipo = 'cotizacion' → adquisición de servicios desde el Cotizador
--    tipo = otro        → solicitud de trabajo sobre un servicio contratado
-- ==============================================================================
CREATE TABLE IF NOT EXISTS solicitudes (
    id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id              UUID          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo                    VARCHAR(30)   NOT NULL DEFAULT 'cotizacion',
    estado                  VARCHAR(30)   NOT NULL DEFAULT 'pendiente',
    plan_id                 UUID          REFERENCES planes(id) ON DELETE SET NULL,
    empresa                 VARCHAR(150),
    telefono_contacto       VARCHAR(30),
    -- JSON array de módulos: [{ id, name, category, price }]
    -- O JSON objeto de solicitud: { servicio, titulo, plazo, notas }
    servicios_seleccionados JSONB,
    presupuesto_min         NUMERIC(12,2),
    presupuesto_max         NUMERIC(12,2),
    velocidad_entrega       VARCHAR(30),
    nivel_soporte           VARCHAR(30),
    descripcion             TEXT,
    admin_asignado_id       UUID          REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_solicitud         TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_limite_borrado    TIMESTAMPTZ,
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado  ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_tipo    ON solicitudes(tipo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_admin   ON solicitudes(admin_asignado_id);

-- ==============================================================================
-- 8. TABLA: HISTORIAL DE ESTADOS (Auditoría de trazabilidad en solicitudes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS solicitud_historial_estados (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id    UUID         NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(50),
    estado_nuevo    VARCHAR(50)  NOT NULL,
    motivo          VARCHAR(255),
    changed_at      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historial_solicitud ON solicitud_historial_estados(solicitud_id);

-- ==============================================================================
-- 9. TABLA: MENSAJES (Chat directo entre cliente y administración)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS mensajes (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id   UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    solicitud_id UUID         REFERENCES solicitudes(id) ON DELETE SET NULL,
    asunto       VARCHAR(150),
    contenido    TEXT         NOT NULL,
    es_admin     BOOLEAN      NOT NULL DEFAULT FALSE,
    leido        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mensajes_usuario   ON mensajes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_solicitud ON mensajes(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido     ON mensajes(leido);

-- ==============================================================================
-- 10. TABLA: PROYECTOS / PORTAFOLIO (Casos de éxito e impacto)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS proyectos_portafolio (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo      VARCHAR(150) NOT NULL,
    cliente     VARCHAR(150),
    categoria   VARCHAR(50)  NOT NULL,   -- 'comunicacion' | 'tecnologia'
    anio        VARCHAR(10),
    descripcion TEXT,
    imagen_url  VARCHAR(255),
    tags        JSONB,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    orden       INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portafolio_activo    ON proyectos_portafolio(activo, orden);
CREATE INDEX IF NOT EXISTS idx_portafolio_categoria ON proyectos_portafolio(categoria);

-- ==============================================================================
-- 11. TABLA: MÉTRICAS DE LA LANDING (Estadísticas dinámicas del hero)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS metricas_landing (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    valor      INT          NOT NULL,
    sufijo     VARCHAR(10)  NOT NULL DEFAULT '+',
    etiqueta   VARCHAR(100) NOT NULL,
    orden      INT          NOT NULL DEFAULT 0,
    activo     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metricas_activo ON metricas_landing(activo, orden);

-- ==============================================================================
-- 12. TABLA: COMENTARIOS / TESTIMONIOS (Reseñas aprobadas de clientes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS comentarios (
    id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id        UUID         REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_autor      VARCHAR(100),
    empresa_autor     VARCHAR(100),
    contenido         TEXT         NOT NULL,
    calificacion      INT          DEFAULT 5 CHECK (calificacion BETWEEN 1 AND 5),
    mostrar_en_pagina BOOLEAN      NOT NULL DEFAULT FALSE,
    orden             INT          DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comentarios_publicos ON comentarios(mostrar_en_pagina, orden);

-- ==============================================================================
-- 13. FUNCIÓN Y TRIGGERS — Actualización automática de updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_usuarios_updated_at       ON usuarios;
  DROP TRIGGER IF EXISTS trg_solicitudes_updated_at    ON solicitudes;
  DROP TRIGGER IF EXISTS trg_info_general_updated_at   ON info_general;
  DROP TRIGGER IF EXISTS trg_planes_updated_at         ON planes;
  DROP TRIGGER IF EXISTS trg_cotizador_modulos_updated_at ON cotizador_modulos;
  DROP TRIGGER IF EXISTS trg_portafolio_updated_at     ON proyectos_portafolio;
  DROP TRIGGER IF EXISTS trg_metricas_updated_at       ON metricas_landing;
END $$;

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_solicitudes_updated_at
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_info_general_updated_at
    BEFORE UPDATE ON info_general
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_planes_updated_at
    BEFORE UPDATE ON planes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cotizador_modulos_updated_at
    BEFORE UPDATE ON cotizador_modulos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portafolio_updated_at
    BEFORE UPDATE ON proyectos_portafolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_metricas_updated_at
    BEFORE UPDATE ON metricas_landing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 14. DATOS INICIALES (SEED)
-- ==============================================================================

-- 14.1 Usuarios (admin y cliente de prueba)
-- admin@wuish.com   → admin123
-- cliente@wuish.io  → cliente123
INSERT INTO usuarios (id, nombres, apellidos, numero_cedula, tipo_documento, fecha_nacimiento, telefono, correo, password_hash, rol)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Admin', 'Wuish', '9999999999', 'CC', '1988-01-01',
    '+57 300 000 0000', 'admin@wuish.com',
    '$2b$10$G2sCy2GnBxr4bByvn/mREOm9XgdYtgTEzTMzBj5bL8ATsPajAhGM.', 'admin'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Alejandro', 'Morales', '1020304050', 'CC', '1992-06-15',
    '+57 300 123 4567', 'cliente@wuish.io',
    '$2b$10$v9oK2lJ5Rqd4Yrj.tdsPvefvxyhGMupEsLATSJ6JPTIKdZbKPkOIe', 'usuario'
)
ON CONFLICT (correo) DO UPDATE
    SET rol = EXCLUDED.rol, password_hash = EXCLUDED.password_hash;

-- 14.2 Tipos de Servicio
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

-- 14.3 Planes (Plantillas base del Cotizador)
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

-- 14.4 Info General (CMS Institucional)
INSERT INTO info_general (seccion, contenido, updated_by)
VALUES
(
    'slogan',
    'Ecosistema integral que fusiona tecnología de punta y comunicación estratégica para empresas en crecimiento.',
    (SELECT id FROM usuarios WHERE correo = 'admin@wuish.com' LIMIT 1)
),
(
    'manifesto',
    'Creemos en la velocidad, en el código robusto y en historias memorables que impulsan organizaciones hacia el futuro.',
    (SELECT id FROM usuarios WHERE correo = 'admin@wuish.com' LIMIT 1)
),
(
    'mision',
    'Potenciar a negocios y líderes corporativos con soluciones digitales vanguardistas y resultados medibles.',
    (SELECT id FROM usuarios WHERE correo = 'admin@wuish.com' LIMIT 1)
)
ON CONFLICT (seccion) DO NOTHING;

-- 14.5 Métricas de la Landing
INSERT INTO metricas_landing (valor, sufijo, etiqueta, orden, activo)
VALUES
(120, '+',  'Proyectos Corporativos Ejecutados', 1, TRUE),
(98,  '%',  'Tasa de Retención de Clientes',     2, TRUE),
(3,   'x',  'Retorno de Inversión (ROI) Promedio',3, TRUE),
(72,  'h',  'Kickoff Técnico y Despliegue',       4, TRUE)
ON CONFLICT DO NOTHING;

-- 14.6 Testimonios Corporativos
INSERT INTO comentarios (usuario_id, contenido, calificacion, mostrar_en_pagina, orden)
VALUES
(
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'WUISH reestructuró por completo nuestra infraestructura digital y la narrativa de marca. Redujimos tiempos de respuesta en un 40% y el impacto ante nuestros inversores fue inmediato.',
    5, TRUE, 1
),
(
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'La implementación de la plataforma a medida y la automatización de procesos revolucionaron nuestra operación diaria. La dedicación técnica y el acompañamiento estratégico son de primer nivel.',
    5, TRUE, 2
),
(
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'Excelente nivel de ingeniería y estándares de seguridad corporativa. Cumplieron cada hito de entrega y construyeron una arquitectura sólida, escalable y sin fisuras.',
    5, TRUE, 3
),
(
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'Unificar producción audiovisual 4K y desarrollo tecnológico en un solo socio estratégico nos otorgó una ventaja competitiva decisiva en el mercado internacional.',
    5, TRUE, 4
),
(
    (SELECT id FROM usuarios WHERE correo = 'cliente@wuish.io' LIMIT 1),
    'El portal corporativo y los tableros analíticos en tiempo real nos permitieron triplicar la tasa de conversión en nuestro canal B2B durante el último trimestre.',
    5, TRUE, 5
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- FIN DEL SCRIPT — Sincronizado con schema.prisma
-- ==============================================================================
