import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    select: { id: true, correo: true, rol: true, nombres: true },
  });
  console.log('USERS IN DB:', users);

  const comments = await prisma.comentario.findMany({
    include: { usuario: true },
  });
  console.log('COMMENTS IN DB:', comments.length);
  for (const c of comments) {
    console.log(`- [${c.mostrar_en_pagina ? 'VISIBLE' : 'HIDDEN'}] ${c.usuario?.nombres}: ${c.contenido.slice(0, 40)}`);
  }
}

main().finally(() => prisma.$disconnect());
