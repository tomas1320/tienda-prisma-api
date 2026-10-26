import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const usuario = await prisma.usuario.upsert({
    where: { email: "cliente@example.com" },
    update: {},
    create: { nombre: "Cliente de prueba", email: "cliente@example.com" },
  });
  const producto = await prisma.producto.findFirst({
    where: { nombre: "Producto de prueba" },
  });
  const productoDemo = producto ?? await prisma.producto.create({
    data: { nombre: "Producto de prueba", precio: "19.99", stock: 10 },
  });

  console.log(`Usuario de prueba: ${usuario.id}; producto de prueba: ${productoDemo.id}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });