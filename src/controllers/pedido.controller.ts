import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { PedidoService } from "../services/pedido.service";

export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { usuarioId, productosComprados } = request.body ?? {};
    if (usuarioId === undefined || !Array.isArray(productosComprados)) {
      next(new AppError("Se requieren usuarioId y productosComprados."));
      return;
    }

    try {
      const pedido = await this.pedidoService.checkout(usuarioId, productosComprados);
      response.status(201).json(pedido);
    } catch (error) {
      next(error);
    }
  };
}