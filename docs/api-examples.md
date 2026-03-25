# API Examples

## Product service

### Get all products

```bash
curl http://localhost:3001/api/products
```

### Create a product

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Noise-Cancelling Headphones",
    "description": "Wireless over-ear headphones with travel case.",
    "price": 199.99,
    "stock": 12
  }'
```

## Customer service

### Get all customers

```bash
curl http://localhost:3002/api/customers
```

### Create a customer

```bash
curl -X POST http://localhost:3002/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sara Johnson",
    "email": "sara.johnson@example.com",
    "phone": "+1-555-1010",
    "address": "245 Market Street, San Francisco, CA"
  }'
```

## Checkout flow

### Place an order

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "customerName": "Sara Johnson",
    "customerEmail": "sara.johnson@example.com",
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 3, "quantity": 1 }
    ]
  }'
```

### Read synced customer order history

```bash
curl http://localhost:3002/api/customers/1/orders
```
