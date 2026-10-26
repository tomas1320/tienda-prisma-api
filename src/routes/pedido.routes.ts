import { Router } from "express";
import { PedidoController } from "../controllers/pedido.controller";

export function createPedidoRouter(controller: PedidoController): Router {
  const router = Router();
  router.post("/", controller.create);
  return router;
}