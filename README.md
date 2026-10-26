# API de pedidos con Prisma

API por capas con Express, PostgreSQL, Prisma ORM y documentación interactiva con Swagger UI.

## Requisitos

- Node.js 20 o superior
- Docker Desktop, o una instancia PostgreSQL propia

## Preparar el proyecto

```bash
npm install
docker compose up -d db
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

La API queda en `http://localhost:3000` y Swagger UI en `http://localhost:3000/api-docs`. Para usar otra base, modifica `DATABASE_URL` en `.env`.

## Endpoint

`POST /api/pedidos`

```json
{
  "usuarioId": 1,
  "productosComprados": [
    { "productoId": 1, "cantidad": 2 }
  ]
}
```

La respuesta exitosa es `201`. Los errores de entrada y stock insuficiente responden `400`; los cambios de inventario y pedido se revierten si falla cualquier operación.

La semilla crea un usuario y un producto de prueba. Puedes consultar sus IDs con `npm run prisma:studio`.

## Comandos útiles

- `npm run build`: generar Prisma Client y compilar TypeScript.
- `npm run prisma:studio`: abrir Prisma Studio.
- `docker compose down`: detener PostgreSQL sin borrar sus datos.