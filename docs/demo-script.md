# Loom Demo Script

## Goal

Record a short 4 to 6 minute demo that shows the project working and explains the architecture clearly.

## Opening

This project is a basic e-commerce system built with two NestJS microservices, PostgreSQL, RabbitMQ, and a Next.js frontend. The main workflow is that the product and order service creates the order, then the customer service receives the `order.created` event through RabbitMQ and updates the customer order history in its own database.

## Demo Flow

### 1. Show the repository structure

Say:

This repository has three parts: `product-order-service`, `customer-service`, and `frontend`. The backend services are separated by responsibility, and each service has its own database.

### 2. Show Docker infrastructure

Open [docker-compose.yml](/c:/Users/SJ/Desktop/ecommerce-assignment/docker-compose.yml).

Say:

RabbitMQ is running for asynchronous communication. I also use two separate PostgreSQL containers, one for the product/order service and one for the customer service. On my machine, the product database is exposed on port `5435` and the customer database is exposed on port `5434`.

### 3. Show the env files

Open:

- [product-order-service/.env](/c:/Users/SJ/Desktop/ecommerce-assignment/product-order-service/.env)
- [customer-service/.env](/c:/Users/SJ/Desktop/ecommerce-assignment/customer-service/.env)
- [frontend/.env](/c:/Users/SJ/Desktop/ecommerce-assignment/frontend/.env)

Say:

The backend services point to separate databases, while the frontend points to the two REST APIs.

### 4. Show the running app

Open the frontend at `http://localhost:3000`.

Say:

The frontend lets me browse products, choose a customer, place an order, and then view customer order history after checkout.

### 5. Show products and customer list

Say:

The initial products and customers are seeded into the databases. This gives a working catalog and test users for the demo.

### 6. Perform checkout

Use customer `Sara Johnson` and place an order with:

- `Minimal Desk Lamp`
- `Canvas Tote Bag`

Say:

When I place the order, the product/order service validates the request, updates stock, stores the order, and publishes an `order.created` event.

### 7. Show synced customer history

Say:

The customer service consumes that RabbitMQ event and stores the order snapshot in its own database. That is why the customer history is now updated without the frontend calling the product/order database directly.

### 8. Show the key backend files

Open:

- [orders.service.ts](/c:/Users/SJ/Desktop/ecommerce-assignment/product-order-service/src/orders/orders.service.ts)
- [rabbitmq.publisher.ts](/c:/Users/SJ/Desktop/ecommerce-assignment/product-order-service/src/messaging/rabbitmq.publisher.ts)
- [customers.service.ts](/c:/Users/SJ/Desktop/ecommerce-assignment/customer-service/src/customers/customers.service.ts)
- [rabbitmq.consumer.ts](/c:/Users/SJ/Desktop/ecommerce-assignment/customer-service/src/messaging/rabbitmq.consumer.ts)

Say:

This service creates the order and publishes the event. This other service consumes the event and syncs the customer order history.

### 9. Close

Say:

This project demonstrates a simple but complete microservice workflow with isolated databases, event-driven communication, and a working frontend connected to both services.
