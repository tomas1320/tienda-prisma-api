import { Prisma, PrismaClient } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export class PedidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(usuarioId: number, transaction: TransactionClient) {
    return transaction.pedido.create({
      data: { usuario: { connect: { id: usuarioId } } },
    });
  }

  updateTotal(id: number, total: Prisma.Decimal, transaction: TransactionClient) {
    return transaction.pedido.update({ where: { id }, data: { total } });
  }

  findById(id: number) {
    return this.prisma.pedido.findUnique({
      where: { id },
      include: { usuario: true, detalles: { include: { producto: true } } },
    });
  }
}