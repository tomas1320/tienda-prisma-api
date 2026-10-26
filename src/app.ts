import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { AppError } from "./errors/app-error";
import { prisma } from "./lib/prisma";
import { PedidoController } from "./controllers/pedido.controller";
import { createPedidoRouter } from "./routes/pedido.routes";
import { PedidoService } from "./services/pedido.service";

const app = express();
const openApiDocument = parse(
  readFileSync(resolve(process.cwd(), "docs/openapi.yaml"), "utf8"),
);
const pedidoService = new PedidoService(prisma);
const pedidoController = new PedidoController(pedidoService);

app.use(express.json());
app.use("/api/pedidos", createPedidoRouter(pedidoController));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: "El cuerpo JSON no es válido." });
    return;
  }
  console.error(error);
  response.status(500).json({ error: "Error interno del servidor." });
});

export { app };