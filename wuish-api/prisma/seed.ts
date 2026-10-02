import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING & SYNCING WUISH REORGANIZED DATABASE ---');

  // 1. Seed or find sample user
  let user = await prisma.usuario.findFirst({
    where: { correo: 'cliente@wuish.io' },
  });

  if (!user) {
    user = await prisma.usuario.create({
      data: {
        nombres: 'Alejandro',
        apellidos: 'Morales',
        correo: 'cliente@wuish.io',
        numero_cedula: '1020304050',
        tipo_documento: 'CC',
        empresa: 'Grupo Nexo Capital',
        cargo: 'CEO & Founder',
        fecha_nacimiento: new Date('1990-05-15'),
        telefono: '+57 300 123 4567',
        password_hash: '$2b$10$abcdefghijklmnopqrstuv',
        rol: 'usuario',
      },
    });
    console.log('Created sample user:', user.nombres);
  }

  // 2. Seed Cotizador Modulos
  const countModulos = await prisma.cotizadorModulo.count();
  console.log(`Current cotizadorModulos count: ${countModulos}`);

  const defaultServices = [
    {
      id: 'ads',
      nombre: 'Marketing & Pauta Omnicanal',
      categoria: 'comunicacion',
      precio_base: 1200,
      descripcion: 'Meta, Google Ads, LinkedIn B2B + ROAS Tracking',
      activo: true,
      orden: 1,
    },
    {
      id: 'video',
      nombre: 'Producción de Video Cinemático',
      categoria: 'comunicacion',
      precio_base: 1450,
      descripcion: 'Brand films 4K, Motion Design y comerciales 3D',
      activo: true,
      orden: 2,
    },
    {
      id: 'branding',
      nombre: 'Identidad & Branding Corporativo',
      categoria: 'comunicacion',
      precio_base: 950,
      descripcion: 'Manual de marca, tipografía y activos gráficos',
      activo: true,
      orden: 3,
    },
    {
      id: 'web',
      nombre: 'Desarrollo Web & E-Commerce',
      categoria: 'tecnologia',
      precio_base: 1800,
      descripcion: 'Headless Next.js, pasarelas globales y alta velocidad',
      activo: true,
      orden: 4,
    },
    {
      id: 'mobile',
      nombre: 'Apps Móviles (iOS & Android)',
      categoria: 'tecnologia',
      precio_base: 2600,
      descripcion: 'Flutter / Swift nativo, offline-first y push notifications',
      activo: true,
      orden: 5,
    },
    {
      id: 'erp',
      nombre: 'Software ERP / CRM a Medida',
      categoria: 'tecnologia',
      precio_base: 2900,
      descripcion: 'Gestión de inventarios, roles RBAC y facturación multi-país',
      activo: true,
      orden: 6,
    },
    {
      id: 'automatizacion',
      nombre: 'Automatización & Business Intelligence',
      categoria: 'tecnologia',
      precio_base: 1600,
      descripcion: 'Flujos automatizados, integraciones API y dashboards en tiempo real',
      activo: true,
      orden: 7,
    },
    {
      id: 'sec',
      nombre: 'Ciberseguridad & Auditoría Cloud',
      categoria: 'tecnologia',
      precio_base: 1350,
      descripcion: 'Pentesting, SOC2, blindaje de datos y certificación',
      activo: true,
      orden: 8,
    },
  ];

  for (const s of defaultServices) {
    await prisma.cotizadorModulo.upsert({
      where: { id: s.id },
      create: s,
      update: {
        nombre: s.nombre,
        categoria: s.categoria,
        precio_base: s.precio_base,
        descripcion: s.descripcion,
      },
    });
  }
  console.log('Seeded 8 Cotizador Modulos in database.');

  // 3. Seed Proyectos Portafolio
  const countProyectos = await prisma.proyectoPortafolio.count();
  console.log(`Current proyectosPortafolio count: ${countProyectos}`);

  if (countProyectos === 0) {
    const defaultProjects = [
      {
        titulo: 'Ecosistema Transaccional & Core Digital',
        cliente: 'Nexo Capital',
        categoria: 'tecnologia',
        anio: '2026',
        descripcion: 'Arquitectura escalable en microservicios, portal de clientes con encriptación bancaria y liquidación de operaciones en tiempo real.',
        tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Cloud'],
        orden: 1,
      },
      {
        titulo: 'Campaña Global de Rebranding & Video 4K',
        cliente: 'Krea Brands',
        categoria: 'comunicacion',
        anio: '2026',
        descripcion: 'Producción audiovisual cinematográfica, manual de identidad corporativa y estrategia de pauta omnicanal de alto impacto.',
        tags: ['Video 4K', 'Branding', 'Estrategia', 'Pauta'],
        orden: 2,
      },
      {
        titulo: 'Automatización Logística & ERP Cloud',
        cliente: 'Andina Logistics',
        categoria: 'tecnologia',
        anio: '2025',
        descripcion: 'Sistema ERP a medida para tracking de flotas en tiempo real, integración aduanera y optimización operativa continua.',
        tags: ['ERP', 'Logística', 'Dashboards BI', 'APIs'],
        orden: 3,
      },
      {
        titulo: 'Estrategia de Comunicación Institucional & PR',
        cliente: 'Fintech Aurora',
        categoria: 'comunicacion',
        anio: '2025',
        descripcion: 'Relacionamiento estratégico, media training y posicionamiento de marca en medios económicos internacionales.',
        tags: ['PR', 'Comunicación', 'Medios', 'B2B'],
        orden: 4,
      },
    ];

    for (const p of defaultProjects) {
      await prisma.proyectoPortafolio.create({ data: p });
    }
    console.log('Seeded 4 default portfolio projects in database.');
  }

  // 4. Seed Metricas Landing
  const countMetricas = await prisma.metricaLanding.count();
  console.log(`Current metricasLanding count: ${countMetricas}`);

  if (countMetricas === 0) {
    const defaultMetricas = [
      { valor: 120, sufijo: '+', etiqueta: 'Proyectos Corporativos', orden: 1 },
      { valor: 98, sufijo: '%', etiqueta: 'Retención de Clientes', orden: 2 },
      { valor: 3, sufijo: 'x', etiqueta: 'ROI Promedio Garantizado', orden: 3 },
      { valor: 72, sufijo: 'h', etiqueta: 'Kickoff y Despliegue', orden: 4 },
    ];

    for (const m of defaultMetricas) {
      await prisma.metricaLanding.create({ data: m });
    }
    console.log('Seeded 4 default landing metrics in database.');
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
