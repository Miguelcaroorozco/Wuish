import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING WUISH DATABASE ---');

  // 1. Get or create a sample client user for the comments
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
        fecha_nacimiento: new Date('1990-05-15'),
        telefono: '+57 300 123 4567',
        password_hash: '$2b$10$abcdefghijklmnopqrstuv',
        rol: 'usuario',
      },
    });
    console.log('Created sample user:', user.nombres);
  }

  // 2. Check and seed Comentarios (Testimonios)
  const countComentarios = await prisma.comentario.count();
  console.log(`Current comentarios count: ${countComentarios}`);

  const testimoniosData = [
    {
      contenido: 'WUISH reestructuró por completo nuestra infraestructura digital y la narrativa de marca. Redujimos tiempos de respuesta en un 40% y el impacto ante nuestros inversores fue inmediato.',
      calificacion: 5,
      mostrar_en_pagina: true,
      orden: 1,
    },
    {
      contenido: 'La implementación de la plataforma a medida y la automatización de procesos revolucionaron nuestra operación diaria. La dedicación técnica y el acompañamiento estratégico son de primer nivel.',
      calificacion: 5,
      mostrar_en_pagina: true,
      orden: 2,
    },
    {
      contenido: 'Excelente nivel de ingeniería y estándares de seguridad corporativa. Cumplieron cada hito de entrega y construyeron una arquitectura sólida, escalable y sin fisuras.',
      calificacion: 5,
      mostrar_en_pagina: true,
      orden: 3,
    },
    {
      contenido: 'Unificar producción audiovisual 4K y desarrollo tecnológico en un solo socio estratégico nos otorgó una ventaja competitiva decisiva en el mercado internacional.',
      calificacion: 5,
      mostrar_en_pagina: true,
      orden: 4,
    },
    {
      contenido: 'El portal corporativo y los tableros analíticos en tiempo real nos permitieron triplicar la tasa de conversión en nuestro canal B2B durante el último trimestre.',
      calificacion: 5,
      mostrar_en_pagina: true,
      orden: 5,
    },
  ];

  if (countComentarios === 0) {
    for (const t of testimoniosData) {
      await prisma.comentario.create({
        data: {
          usuario_id: user.id,
          contenido: t.contenido,
          calificacion: t.calificacion,
          mostrar_en_pagina: t.mostrar_en_pagina,
          orden: t.orden,
        },
      });
    }
    console.log(`Successfully seeded ${testimoniosData.length} testimonios in database.`);
  } else {
    // Ensure existing comentarios have mostrar_en_pagina: true
    await prisma.comentario.updateMany({
      data: { mostrar_en_pagina: true },
    });
    console.log('Updated existing comentarios to mostrar_en_pagina: true.');
  }

  // 3. Seed Resultados
  const countResultados = await prisma.resultado.count();
  console.log(`Current resultados count: ${countResultados}`);

  const resultadosData = [
    { titulo: '120+', descripcion: 'Proyectos Corporativos Ejecutados', orden: 1 },
    { titulo: '98%', descripcion: 'Tasa de Retención de Clientes', orden: 2 },
    { titulo: '3x', descripcion: 'Retorno de Inversión (ROI) Promedio', orden: 3 },
    { titulo: '72h', descripcion: 'Kickoff Técnico y Despliegue', orden: 4 },
  ];

  if (countResultados === 0) {
    for (const r of resultadosData) {
      await prisma.resultado.create({
        data: {
          titulo: r.titulo,
          descripcion: r.descripcion,
          activo: true,
          orden: r.orden,
        },
      });
    }
    console.log(`Successfully seeded ${resultadosData.length} resultados in database.`);
  }

  console.log('--- SEED COMPLETED ---');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
