import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../errors/app-error";
import { PedidoRepository } from "../repositories/pedido.repository";
import { UsuarioRepository } from "../repositories/usuario.repository";

export interface ProductoComprado {
  productoId: number;
  cantidad: number;
}

export class PedidoService {
  private readonly pedidoRepository: PedidoRepository;
  private readonly usuarioRepository: UsuarioRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.pedidoRepository = new PedidoRepository(prisma);
    this.usuarioRepository = new UsuarioRepository(prisma);
  }

  async checkout(usuarioId: number, productosComprados: ProductoComprado[]) {
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      throw new AppError("usuarioId debe ser un entero positivo.");
    }
    if (!Array.isArray(productosComprados) || productosComprados.length === 0) {
      throw new AppError("productosComprados debe contener al menos un producto.");
    }

    const cantidadesPorProducto = new Map<number, number>();
    for (const item of productosComprados) {
      if (
        !item ||
        !Number.isInteger(item.productoId) ||
        item.productoId <= 0 ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad <= 0
      ) {
        throw new AppError("Cada producto requiere productoId y cantidad enteros positivos.");
      }
      cantidadesPorProducto.set(
        item.productoId,
        (cantidadesPorProducto.get(item.productoId) ?? 0) + item.cantidad,
      );
    }

    try {
      return await this.prisma.$transaction(async (transaction) => {
        const usuario = await this.usuarioRepository.findById(usuarioId, transaction);
        if (!usuario) {
          throw new AppError("El usuario indicado no existe.");
        }

        const pedido = await this.pedidoRepository.create(usuarioId, transaction);
        let total = new Prisma.Decimal(0);

        for (const [productoId, cantidad] of cantidadesPorProducto) {
          const producto = await transaction.producto.findUnique({
            where: { id: productoId },
          });
          if (!producto) {
            throw new AppError(`El producto ${productoId} no existe.`);
          }

          const actualizado = await transaction.producto.updateMany({
            where: { id: productoId, stock: { gte: cantidad } },
            data: { stock: { decrement: cantidad } },
          });
          if (actualizado.count !== 1) {
            throw new AppError(`Stock insuficiente para el producto ${producto.nombre}.`);
          }

          await transaction.detallePedido.create({
            data: {
              pedidoId: pedido.id,
              productoId,
              cantidad,
              precioUnitario: producto.precio,
            },
          });
          total = total.add(producto.precio.mul(cantidad));
        }

        await this.pedidoRepository.updateTotal(pedido.id, total, transaction);
        return transaction.pedido.findUniqueOrThrow({
          where: { id: pedido.id },
          include: {
            usuario: true,
            detalles: { include: { producto: true } },
          },
        });
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new AppError("El usuario o producto indicado no existe.");
      }
      throw error;
    }
  }
}