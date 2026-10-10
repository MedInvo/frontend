import { useEffect, useState } from "react";
import "./style.css";

const PRODUCT_API = "/api/products";
const ORDER_API = "/api/orders";

const emptyProduct = { name: "", category: "", quantity: "", price: "" };
const emptyOrder = { product_id: "", quantity: "", customer_name: "" };

async function request(url, options) {
  const response = await fetch(url, options);
  if (response.ok) return response.status === 204 ? null : response.json();

  const body = await response.json().catch(() => ({}));
  throw new Error(body.detail || "Request failed. Please try again.");
}

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productData, orderData] = await Promise.all([
        request(PRODUCT_API),
        request(ORDER_API),
      ]);
      setProducts(productData);
      setOrders(orderData);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addProduct = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await request(PRODUCT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          quantity: Number(productForm.quantity),
          price: Number(productForm.price),
        }),
      });
      setProductForm(emptyProduct);
      setNotice("Product added to inventory.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const createOrder = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await request(ORDER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderForm,
          product_id: Number(orderForm.product_id),
          quantity: Number(orderForm.quantity),
        }),
      });
      setOrderForm(emptyOrder);
      setNotice("Order created successfully.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateProductForm = (event) =>
    setProductForm({ ...productForm, [event.target.name]: event.target.value });

  const updateOrderForm = (event) =>
    setOrderForm({ ...orderForm, [event.target.name]: event.target.value });

  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">Pharma operations</p>
          <h1>Inventory & orders</h1>
          <p>Manage stock and create customer orders through the microservices.</p>
        </div>
        <button className="secondary" type="button" onClick={loadData} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh data"}
        </button>
      </header>

      {error && <p role="alert">{error}</p>}
      {notice && <p className="notice">{notice}</p>}

      <section className="forms" aria-label="Inventory and order forms">
        <form onSubmit={addProduct}>
          <h2>Add inventory</h2>
          <label>Name<input name="name" value={productForm.name} onChange={updateProductForm} minLength="2" required /></label>
          <label>Category<input name="category" value={productForm.category} onChange={updateProductForm} minLength="2" required /></label>
          <div className="row">
            <label>Quantity<input name="quantity" type="number" min="0" value={productForm.quantity} onChange={updateProductForm} required /></label>
            <label>Price (₹)<input name="price" type="number" min="0.01" step="0.01" value={productForm.price} onChange={updateProductForm} required /></label>
          </div>
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Add product"}</button>
        </form>

        <form onSubmit={createOrder}>
          <h2>Create order</h2>
          <label>Product
            <select name="product_id" value={orderForm.product_id} onChange={updateOrderForm} required>
              <option value="">Choose a product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.quantity} in stock)</option>)}
            </select>
          </label>
          <label>Customer name<input name="customer_name" value={orderForm.customer_name} onChange={updateOrderForm} minLength="2" required /></label>
          <label>Quantity<input name="quantity" type="number" min="1" value={orderForm.quantity} onChange={updateOrderForm} required /></label>
          <button type="submit" disabled={submitting || products.length === 0}>{submitting ? "Saving…" : "Create order"}</button>
        </form>
      </section>

      <section>
      <h2>Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.quantity}</td>
              <td>₹{product.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && products.length === 0 && <p className="empty">No products yet. Add your first item above.</p>}
      </section>

      <section>
      <h2>Recent orders</h2>
      <table>
        <thead><tr><th>ID</th><th>Customer</th><th>Product ID</th><th>Quantity</th><th>Total</th></tr></thead>
        <tbody>
          {orders.map((order) => <tr key={order.id}><td>{order.id}</td><td>{order.customer_name}</td><td>{order.product_id}</td><td>{order.quantity}</td><td>₹{order.total_price.toFixed(2)}</td></tr>)}
        </tbody>
      </table>
      {!loading && orders.length === 0 && <p className="empty">No orders yet.</p>}
      </section>
    </main>
  );
}

export default App;