import { PrismaClient } from "@prisma/client";

export class ProductoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.producto.findMany({ orderBy: { id: "asc" } });
  }

  findById(id: number) {
    return this.prisma.producto.findUnique({ where: { id } });
  }

  create(data: { nombre: string; precio: string; stock: number }) {
    return this.prisma.producto.create({ data });
  }

  update(id: number, data: { nombre?: string; precio?: string; stock?: number }) {
    return this.prisma.producto.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.producto.delete({ where: { id } });
  }
}