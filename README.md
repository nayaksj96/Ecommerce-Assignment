# E-Commerce System Using NestJS Microservices

This project is a complete assignment submission for a microservice-based e-commerce workflow built with NestJS, PostgreSQL, RabbitMQ, and Next.js.

It demonstrates:

- product and order management in one NestJS service
- customer management and synced order history in a second NestJS service
- asynchronous service-to-service communication through RabbitMQ
- a simple Next.js frontend for browsing products, placing an order, and viewing customer history

## What This Shows

- clean separation of concerns across two backend services
- database-per-service design
- event-driven synchronization using RabbitMQ
- practical CRUD APIs with validation and error handling
- a lightweight frontend connected to both services

## Services

- `product-order-service`
  Handles products, checkout, stock updates, and publishing the `order.created` event.
- `customer-service`
  Handles customers and stores a synced order-history snapshot after consuming `order.created`.
- `frontend`
  Displays products, cart/checkout flow, and customer order history.

## Architecture

Each microservice owns its own PostgreSQL database.

- Product/order database: `product_order_db`
- Customer database: `customer_db`
- Message broker: RabbitMQ

The frontend communicates over REST with both services. The backend services communicate asynchronously through RabbitMQ.

### Checkout Flow

1. The frontend sends a checkout request to `product-order-service`.
2. The product/order service validates the request, updates stock, saves the order, and publishes `order.created`.
3. The customer service consumes `order.created`.
4. The customer service stores the synced order snapshot in its own database.
5. The frontend fetches the customer order history from `customer-service`.

## Tech Stack

- Backend: NestJS, TypeORM
- Frontend: Next.js App Router
- Database: PostgreSQL
- Messaging: RabbitMQ

## Verified Local Setup

The project was verified locally with:

- RabbitMQ running in Docker on `5672`
- Product/order PostgreSQL running in Docker on host port `5435`
- Customer PostgreSQL running in Docker on host port `5434`
- Product/order API on `3001`
- Customer API on `3002`
- Frontend on `3000`

## Local Run

### 1. Start infrastructure

```bash
docker compose up -d
```

RabbitMQ management UI:

- URL: `http://localhost:15672`
- Username: `guest`
- Password: `guest`

### 2. Configure environment files

Use these env files:

- [product-order-service/.env](/c:/Users/SJ/Desktop/ecommerce-assignment/product-order-service/.env)
- [customer-service/.env](/c:/Users/SJ/Desktop/ecommerce-assignment/customer-service/.env)
- [frontend/.env](/c:/Users/SJ/Desktop/ecommerce-assignment/frontend/.env)

Important local ports:

- `product-order-service` DB port: `5435`
- `customer-service` DB port: `5434`

### 3. Install dependencies

Run inside each project:

```bash
npm install
```

Projects:

- `product-order-service`
- `customer-service`
- `frontend`

### 4. Run migrations and seeds

```bash
cd product-order-service
npm run migration:run
npm run seed
```

```bash
cd customer-service
npm run migration:run
npm run seed
```

### 5. Start the applications

```bash
cd product-order-service
npm run start:dev
```

```bash
cd customer-service
npm run start:dev
```

```bash
cd frontend
npm run dev
```

## API Summary

### Product & Order Service

Base URL: `http://localhost:3001/api`

- `GET /health`
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `GET /orders`
- `GET /orders/:id`
- `POST /orders`

Example checkout payload:

```json
{
  "customerId": 1,
  "customerName": "Sara Johnson",
  "customerEmail": "sara.johnson@example.com",
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

### Customer Service

Base URL: `http://localhost:3002/api`

- `GET /health`
- `GET /customers`
- `GET /customers/:id`
- `GET /customers/:id/orders`
- `POST /customers`
- `PATCH /customers/:id`

## Design Decisions

- Each service owns its own schema and persists only the data it needs.
- The customer service stores a denormalized order snapshot instead of making synchronous calls back to the order service.
- RabbitMQ uses event-driven communication so the services remain loosely coupled.
- The frontend is intentionally simple so the focus stays on architecture and workflow.
- Validation is handled explicitly in the service layer to keep the code readable and predictable.

## Verified Workflow

The following flow was verified locally:

- seeded products loaded from `product-order-service`
- seeded customers loaded from `customer-service`
- checkout request created an order successfully
- `order.created` was published and consumed
- customer order history was updated in the customer service after checkout

## Helpful Docs

- [docs/api-examples.md](/c:/Users/SJ/Desktop/ecommerce-assignment/docs/api-examples.md)
- [docs/demo-script.md](/c:/Users/SJ/Desktop/ecommerce-assignment/docs/demo-script.md)
- [docs/github-submission.md](/c:/Users/SJ/Desktop/ecommerce-assignment/docs/github-submission.md)

## Suggested Demo

Use the short recording script here:

- [docs/demo-script.md](/c:/Users/SJ/Desktop/ecommerce-assignment/docs/demo-script.md)

## Notes

- If `5433` is already used by a local PostgreSQL instance, this project uses `5435` for the product/order Docker database to avoid conflicts.
- On Windows, `127.0.0.1` is used instead of `localhost` in the backend env files to avoid IPv6 connection issues.
