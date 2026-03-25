'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

type Customer = {
  id: number;
  name: string;
  email: string;
};

type CustomerOrder = {
  id: number;
  externalOrderId: number;
  status: string;
  totalAmount: number;
  orderedAt: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

type BackendService = 'product' | 'customer';

const productOrderApi =
  process.env.NEXT_PUBLIC_PRODUCT_ORDER_API_URL ?? 'http://localhost:3001/api';
const customerApi =
  process.env.NEXT_PUBLIC_CUSTOMER_API_URL ?? 'http://localhost:3002/api';

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<CustomerOrder[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading catalog...');
  const [serviceStatus, setServiceStatus] = useState<
    Record<BackendService, boolean>
  >({
    product: true,
    customer: true,
  });

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number((item.price * item.quantity).toFixed(2)),
        0,
      ),
    [cart],
  );

  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    void Promise.all([fetchProducts(), fetchCustomers()]);
  }, [isMounted]);

  useEffect(() => {
    if (isMounted && selectedCustomerId) {
      void fetchOrderHistory(selectedCustomerId);
    }
  }, [isMounted, selectedCustomerId]);

  if (!isMounted) {
    return (
      <main className="page-shell">
        <section className="hero">
          <p className="eyebrow">NestJS + RabbitMQ Assignment Demo</p>
          <h1>Microservices storefront with real checkout and synced customer history.</h1>
          <p className="hero-copy">
            Preparing the storefront and connecting to the backend services.
          </p>
          <p className="status-pill">Loading application...</p>
        </section>
      </main>
    );
  }

  async function fetchProducts() {
    try {
      const response = await fetch(`${productOrderApi}/products`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Unable to load products right now.');
      }

      const data = (await response.json()) as Product[];
      setProducts(data);
      setServiceStatus((current) => ({ ...current, product: true }));
      setStatusMessage('Catalog ready.');
    } catch {
      setProducts([]);
      setServiceStatus((current) => ({ ...current, product: false }));
      setStatusMessage(
        'Product service is not reachable. Start product-order-service on port 3001.',
      );
    }
  }

  async function fetchCustomers() {
    try {
      const response = await fetch(`${customerApi}/customers`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Unable to load customers right now.');
      }

      const data = (await response.json()) as Customer[];
      setCustomers(data);
      setServiceStatus((current) => ({ ...current, customer: true }));
      if (data.length > 0) {
        const firstCustomer = data[0];
        setSelectedCustomerId(firstCustomer.id);
        setCustomerName(firstCustomer.name);
        setCustomerEmail(firstCustomer.email);
      }
    } catch {
      setCustomers([]);
      setSelectedCustomerId(null);
      setCustomerName('');
      setCustomerEmail('');
      setOrderHistory([]);
      setServiceStatus((current) => ({ ...current, customer: false }));
      setStatusMessage(
        'Customer service is not reachable. Start customer-service on port 3002.',
      );
    }
  }

  async function retryServices(target: BackendService | 'all') {
    setStatusMessage('Retrying backend services...');

    if (target === 'product') {
      await fetchProducts();
      return;
    }

    if (target === 'customer') {
      await fetchCustomers();
      return;
    }

    await Promise.all([fetchProducts(), fetchCustomers()]);
  }

  const offlineServices = Object.entries(serviceStatus)
    .filter(([, isOnline]) => !isOnline)
    .map(([service]) => service as BackendService);

  const showOfflineBanner = offlineServices.length > 0;

  async function fetchOrderHistory(customerId: number) {
    try {
      const response = await fetch(
        `${customerApi}/customers/${customerId}/orders`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error('Unable to load order history right now.');
      }

      const data = (await response.json()) as CustomerOrder[];
      setOrderHistory(data);
    } catch {
      setOrderHistory([]);
    }
  }

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stock),
              }
            : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: number, quantity: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cart.length === 0) {
      setStatusMessage('Add at least one product before checkout.');
      return;
    }

    setIsSubmitting(true);

    try {
      let customerId = selectedCustomerId;

      if (!customerId) {
        const customerResponse = await fetch(`${customerApi}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customerName,
            email: customerEmail,
          }),
        });

        if (!customerResponse.ok) {
          const error = (await customerResponse.json()) as { message?: string };
          throw new Error(error.message ?? 'Customer creation failed.');
        }

        const customer = (await customerResponse.json()) as Customer;
        customerId = customer.id;
        setSelectedCustomerId(customer.id);
        await fetchCustomers();
      }

      const response = await fetch(`${productOrderApi}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          customerName,
          customerEmail,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? 'Checkout failed.');
      }

      setCart([]);
      setStatusMessage('Order placed successfully. Syncing customer history...');
      await fetchProducts();

      if (customerId) {
        setTimeout(() => {
          void fetchOrderHistory(customerId);
        }, 800);
      }
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Something went wrong.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">NestJS + RabbitMQ Assignment Demo</p>
        <h1>Microservices storefront with real checkout and synced customer history.</h1>
        <p className="hero-copy">
          Browse products, build a cart, check out as a customer, and watch the
          order history refresh from the customer service.
        </p>
        <p className="status-pill">{statusMessage}</p>
      </section>

      {showOfflineBanner ? (
        <section className="offline-banner">
          <div>
            <p className="offline-eyebrow">Backend offline</p>
            <h2>
              {offlineServices.length === 2
                ? 'Both backend services are currently unreachable.'
                : offlineServices[0] === 'product'
                  ? 'The product and order service is currently unreachable.'
                  : 'The customer service is currently unreachable.'}
            </h2>
            <p>
              Start the required NestJS service{offlineServices.length > 1 ? 's' : ''}{' '}
              and retry from here without refreshing the page.
            </p>
          </div>
          <div className="offline-actions">
            {offlineServices.includes('product') ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => void retryServices('product')}
              >
                Retry product service
              </button>
            ) : null}
            {offlineServices.includes('customer') ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => void retryServices('customer')}
              >
                Retry customer service
              </button>
            ) : null}
            {offlineServices.length > 1 ? (
              <button
                type="button"
                className="primary-button"
                onClick={() => void retryServices('all')}
              >
                Retry everything
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Products</h2>
            <span>{products.length} items</span>
          </div>
          <div className="product-list">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
                <div className="product-meta">
                  <strong>${product.price.toFixed(2)}</strong>
                  <span>{product.stock} in stock</span>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  Add to cart
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Checkout</h2>
            <span>{cart.length} cart lines</span>
          </div>
          <form className="checkout-form" onSubmit={handleCheckout}>
            <label>
              Existing customer
              <select
                suppressHydrationWarning
                value={selectedCustomerId ?? ''}
                onChange={(event) => {
                  const customer = customers.find(
                    (item) => item.id === Number(event.target.value),
                  );
                  setSelectedCustomerId(customer?.id ?? null);
                  setCustomerName(customer?.name ?? '');
                  setCustomerEmail(customer?.email ?? '');
                }}
              >
                <option value="">Create during checkout</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Customer name
              <input
                suppressHydrationWarning
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
              />
            </label>
            <label>
              Customer email
              <input
                suppressHydrationWarning
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                required
              />
            </label>

            <div className="cart-list">
              {cart.length === 0 ? (
                <p className="muted">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-row">
                    <div>
                      <strong>{item.name}</strong>
                      <p>${item.price.toFixed(2)} each</p>
                    </div>
                    <input
                      suppressHydrationWarning
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.id, Number(event.target.value))
                      }
                    />
                  </div>
                ))
              )}
            </div>

            <div className="checkout-footer">
              <strong>Total: ${cartTotal.toFixed(2)}</strong>
              <button
                suppressHydrationWarning
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                <span suppressHydrationWarning>
                  {isSubmitting ? 'Processing...' : 'Place order'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel history-panel">
        <div className="panel-header">
          <h2>Customer Order History</h2>
          <span>
            {selectedCustomer
              ? selectedCustomer.name
              : selectedCustomerId
                ? `Customer #${selectedCustomerId}`
                : 'No customer selected'}
          </span>
        </div>
        <div className="history-list">
          {orderHistory.length === 0 ? (
            <p className="muted">No synced orders yet for this customer.</p>
          ) : (
            orderHistory.map((order) => (
              <article key={order.id} className="history-card">
                <div className="history-top">
                  <div>
                    <h3>Order #{order.externalOrderId}</h3>
                    <p>{new Date(order.orderedAt).toLocaleString()}</p>
                  </div>
                  <strong>${order.totalAmount.toFixed(2)}</strong>
                </div>
                <ul>
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.productId}`}>
                      {item.productName} x {item.quantity} = ${item.lineTotal.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
