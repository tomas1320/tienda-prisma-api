import { Prisma, PrismaClient } from "@prisma/client";

export class UsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: number, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;
    return client.usuario.findUnique({ where: { id } });
  }

  findAll() {
    return this.prisma.usuario.findMany({ orderBy: { id: "asc" } });
  }

  create(data: { nombre: string; email: string }) {
    return this.prisma.usuario.create({ data });
  }

  update(id: number, data: { nombre?: string; email?: string }) {
    return this.prisma.usuario.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}