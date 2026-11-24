import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Heart,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  Truck,
} from 'lucide-react';
import { useAuth, useStore, StoreProvider } from './context';
import {
  AddButton,
  Logo,
  Modal,
  ProductCard,
  Rating,
  Spinner,
} from './components';
import { api } from './api';
import {
  categories,
  images,
  money,
  type Address,
  type Order,
  type Product,
} from './types';

function Layout() {
  const { user, signOut } = useAuth();
  const { cart, toast, notify } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [category, setCategory] = useState('');
  useEffect(() => setSearch(params.get('search') || ''), [params]);
  const count = cart.items.reduce((n, item) => n + item.quantity, 0);
  return (
    <>
      <header className="site-header">
        <div className="header-main">
          <Link to="/" aria-label="Amazon Clone home">
            <Logo />
          </Link>
          <div className="location">
            <MapPin size={20} />
            <span>
              <small>Deliver to</small>
              <strong>India</strong>
            </span>
          </div>
          <form
            className="header-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const p = new URLSearchParams();
              if (search.trim()) p.set('search', search.trim());
              if (category) p.set('category', category);
              navigate(`/?${p}`);
            }}
          >
            <select
              aria-label="Search category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              aria-label="Search products"
              maxLength={100}
              placeholder="Search Amazon Clone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button aria-label="Submit search">
              <Search size={23} />
            </button>
          </form>
          <div className="account">
            <Link to={user ? '/orders' : '/login'}>
              <small>Hello, {user?.name.split(' ')[0] || 'sign in'}</small>
              <strong>{user ? 'Your account' : 'Account & Lists'}</strong>
            </Link>
            {user && (
              <button
                onClick={() =>
                  void signOut()
                    .then(() => navigate('/'))
                    .catch((e) => notify(e.message))
                }
              >
                Sign out
              </button>
            )}
          </div>
          <Link to="/orders" className="orders-link">
            <small>Returns</small>
            <strong>& Orders</strong>
          </Link>
          <Link
            to="/cart"
            className="cart-link"
            aria-label={`Cart, ${count} items`}
          >
            <span className="cart-icon">
              <ShoppingCart size={31} />
              <b>{count}</b>
            </span>
            <strong>Cart</strong>
          </Link>
        </div>
        <nav className="subnav" aria-label="Product categories">
          <Link to="/" className="all-link">
            <Menu size={17} />
            All products
          </Link>
          {categories.map((c) => (
            <Link to={`/?category=${encodeURIComponent(c)}`} key={c}>
              {c}
            </Link>
          ))}
          <Link to="/?deals=1">Today’s deals</Link>
          {user?.role === 'admin' && (
            <Link className="admin-nav" to="/admin">
              Manage products
            </Link>
          )}
          <span>Great finds. Every day.</span>
        </nav>
      </header>
      <div className="site-content">
        <Outlet />
      </div>
      <footer>
        <button
          className="back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top
        </button>
        <div className="footer-content">
          <Logo />
          <p>A simple MERN stack shopping project.</p>
          <div className="footer-links">
            <Link to="/">Shop products</Link>
            <Link to="/cart">Your cart</Link>
            <Link to="/orders">Your orders</Link>
          </div>
          <small>
            Educational Amazon-inspired clone. Demo products and checkout; no
            real payments or deliveries.
          </small>
          <small>Bibek · SCA24CA0016 · BCA V · Section A</small>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
function Home() {
  const { products, loading, error, refresh } = useStore();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const deals = params.get('deals') === '1';
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) &&
            (!category || p.category === category) &&
            (!deals || p.price < p.originalPrice),
        )
        .sort((a, b) =>
          sort === 'price-low'
            ? a.price - b.price
            : sort === 'price-high'
              ? b.price - a.price
              : sort === 'rating'
                ? b.rating - a.rating
                : 0,
        ),
    [products, search, category, deals, sort],
  );
  return (
    <main className="home-container">
      {!search && !category && !deals && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <span className="hero-tag">
                EVERYDAY FINDS. EXTRAORDINARY PRICES.
              </span>
              <h1>
                Little things.
                <br />
                Big happiness.
              </h1>
              <p>
                Discover essentials you’ll love,
                <br />
                at prices that make you smile.
              </p>
              <Link to="/?deals=1" className="button hero-button">
                Explore today’s deals
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-products" aria-hidden="true">
              <div className="hero-circle" />
              <img
                className="hero-headphones"
                src="/images/headphones.jpg"
                alt=""
              />
              <div className="hero-watch">
                <img src="/images/watch.jpg" alt="" />
              </div>
              <span className="hero-sticker">
                Up to
                <br />
                <strong>50%</strong>
                <br />
                off on selected finds
              </span>
            </div>
          </section>
          <div className="benefits">
            <span>
              <Truck size={20} />
              <strong>Free delivery</strong>
              <small>On every demo order</small>
            </span>
            <span>
              <ShieldCheck size={20} />
              <strong>Shop with confidence</strong>
              <small>Simple, secure sign-in</small>
            </span>
            <span>
              <Package size={20} />
              <strong>Everyday essentials</strong>
              <small>Picked for your day-to-day</small>
            </span>
            <span>
              <Heart size={20} />
              <strong>More for less</strong>
              <small>Great finds, better prices</small>
            </span>
          </div>
        </>
      )}
      <section className="catalog">
        <div className="catalog-heading">
          <div>
            <span className="eyebrow">
              {search
                ? 'SEARCH RESULTS'
                : category
                  ? 'SHOP BY CATEGORY'
                  : 'A LITTLE SOMETHING FOR EVERYONE'}
            </span>
            <h2>
              {search
                ? `Results for “${search}”`
                : category ||
                  (deals ? 'Today’s deals' : 'Discover your next favourite')}
            </h2>
            <p>
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              {category && ` in ${category}`}
              {deals && ' at special demo prices'}
            </p>
          </div>
          <label className="sort-control">
            <SlidersHorizontal size={15} />
            <span>Sort by:</span>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>
        <div className="category-tabs">
          <button
            className={!category && !deals ? 'active' : ''}
            onClick={() => setParams(search ? { search } : {})}
          >
            All products
          </button>
          {categories.map((c) => (
            <button
              className={category === c ? 'active' : ''}
              key={c}
              onClick={() =>
                setParams({ category: c, ...(search ? { search } : {}) })
              }
            >
              {c}
            </button>
          ))}
          <button
            className={deals ? 'active' : ''}
            onClick={() => setParams({ deals: '1' })}
          >
            Today’s deals
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="empty">
            <h3>Couldn’t load products</h3>
            <p>{error}</p>
            <button className="button yellow" onClick={() => void refresh()}>
              Try again
            </button>
          </div>
        ) : filtered.length ? (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <Search size={35} />
            <h3>No products found</h3>
            <p>Try another search or browse all products.</p>
            <Link className="button yellow" to="/">
              View all products
            </Link>
          </div>
        )}
      </section>
      <div className="home-bottom">
        <ShoppingBag size={24} />
        <div>
          <strong>Your everyday shopping, made simple.</strong>
          <p>Browse. Add to cart. Check out. All in one place.</p>
        </div>
        <Link to="/cart">
          Go to your cart
          <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
function AuthPage({ register = false }: { register?: boolean }) {
  const { user, signIn, loading } = useAuth();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const destination =
    /^\/(?:cart|checkout|orders|admin|product\/[a-f0-9]{24})$/.test(next)
      ? next
      : '/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const login = async (demo?: 'customer' | 'admin') => {
    setBusy(true);
    setError('');
    try {
      await signIn(
        demo === 'admin'
          ? 'admin@example.com'
          : demo
            ? 'demo@example.com'
            : email,
        demo === 'admin' ? 'Admin12345!' : demo ? 'Demo12345!' : password,
        register && !demo ? name : undefined,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <Spinner />;
  if (user) return <Navigate to={destination} replace />;
  return (
    <main className="auth-page">
      <Link to="/">
        <Logo dark />
      </Link>
      <div className="auth-card">
        <h1>{register ? 'Create account' : 'Sign in'}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          {register && (
            <label>
              Your name
              <input
                required
                autoComplete="name"
                minLength={2}
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First and last name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength={8}
              maxLength={72}
              required
              autoComplete={register ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={register ? 'At least 8 characters' : ''}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button yellow full" disabled={busy}>
            {busy
              ? 'Please wait…'
              : register
                ? 'Create your account'
                : 'Sign in'}
          </button>
        </form>
        <p className="auth-note">
          This is a college project. Use demo details to explore the app.
        </p>
        <div className="demo-actions">
          <button
            disabled={busy}
            className="button outline"
            onClick={() => void login('customer')}
          >
            Try customer demo
          </button>
          <button
            disabled={busy}
            className="button outline"
            onClick={() => void login('admin')}
          >
            Try admin demo
          </button>
        </div>
        <p className="auth-switch">
          {register ? 'Already have an account?' : 'New to Amazon Clone?'}{' '}
          <Link
            to={`${register ? '/login' : '/register'}?next=${encodeURIComponent(destination)}`}
          >
            {register ? 'Sign in' : 'Create an account'}
            <ChevronRight size={12} />
          </Link>
        </p>
      </div>
      <Link className="back-link" to="/">
        <ArrowLeft size={14} />
        Back to shopping
      </Link>
    </main>
  );
}
function Protected({ admin = false }: { admin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user)
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  if (admin && user.role !== 'admin')
    return (
      <div className="empty">
        <ShieldCheck size={34} />
        <h2>Administrator access required</h2>
        <Link to="/" className="button yellow">
          Continue shopping
        </Link>
      </div>
    );
  return <Outlet />;
}
function ProductPage() {
  const { id } = useParams();
  const { products, loading, error } = useStore();
  const product = products.find((p) => p._id === id);
  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="empty">
        <p>{error}</p>
      </div>
    );
  if (!product) return <NotFound />;
  return (
    <main className="content-container">
      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/?category=${encodeURIComponent(product.category)}`}>
          {product.category}
        </Link>
        <ChevronRight size={12} />
        <span>Product details</span>
      </div>
      <div className="product-detail">
        <div className="detail-image">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="detail-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.title}</h1>
          <Rating product={product} />
          <hr />
          <div className="deal-label">Limited time demo deal</div>
          <div className="detail-price">
            <span className="discount">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
            <strong>{money(product.price)}</strong>
          </div>
          <p className="mrp">
            M.R.P.: <del>{money(product.originalPrice)}</del>
          </p>
          <p className="tax-note">Inclusive of all taxes</p>
          <div className="detail-perks">
            <span>
              <Truck size={23} />
              Free delivery
            </span>
            <span>
              <ShieldCheck size={23} />
              Secure sign-in
            </span>
            <span>
              <Package size={23} />
              Demo product
            </span>
          </div>
          <h3>About this item</h3>
          <p className="description">{product.description}</p>
          <p className="sample-note">
            Ratings and product claims are sample data for this educational
            project.
          </p>
        </div>
        <aside className="buy-box">
          <strong className="buy-price">{money(product.price)}</strong>
          <p>
            <span className="teal">FREE delivery</span> on your demo order.
          </p>
          <div className="deliver-location">
            <MapPin size={15} />
            Deliver to India
          </div>
          <h3 className={product.inStock ? 'in-stock' : 'out-stock'}>
            {product.inStock ? 'In stock' : 'Currently unavailable'}
          </h3>
          <p>
            Sold by <strong>Amazon Clone Store</strong>
          </p>
          <AddButton product={product} />
          <Link to="/cart" className="button orange">
            Go to cart
            <ArrowRight size={14} />
          </Link>
          <small>
            <ShieldCheck size={13} />
            Demo checkout. No real payment.
          </small>
        </aside>
      </div>
      <section className="related">
        <h2>You might also like</h2>
        <div className="product-grid">
          {products
            .filter((p) => p._id !== id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
        </div>
      </section>
    </main>
  );
}
function CartPage() {
  const {
    cart,
    cartLoading,
    cartBusy,
    cartError,
    updateCart,
    removeFromCart,
    notify,
    reloadCart,
  } = useStore();
  if (cartLoading) return <Spinner />;
  if (cartError)
    return (
      <div className="empty">
        <p>{cartError}</p>
        <button
          className="button yellow"
          onClick={() => void reloadCart().catch((e) => notify(e.message))}
        >
          Retry
        </button>
      </div>
    );
  const count = cart.items.reduce((n, item) => n + item.quantity, 0);
  return (
    <main className="content-container cart-layout">
      <section className="cart-panel">
        <h1>Shopping Cart</h1>
        <span className="cart-price-heading">Price</span>
        {!cart.items.length ? (
          <div className="empty">
            <ShoppingCart size={40} />
            <h2>Your cart is empty</h2>
            <p>Find something you love and add it to your cart.</p>
            <Link className="button yellow" to="/">
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            {cart.items.map(({ product, quantity }) => (
              <article className="cart-item" key={product._id}>
                <Link to={`/product/${product._id}`} className="cart-image">
                  <img src={product.image} alt={product.title} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${product._id}`}>
                    <h2>{product.title}</h2>
                  </Link>
                  <strong className="mobile-cart-price">
                    {money(product.price * quantity)}
                  </strong>
                  <span className={product.inStock ? 'in-stock' : 'out-stock'}>
                    {product.inStock ? 'In stock' : 'Currently unavailable'}
                  </span>
                  <small>Eligible for FREE delivery</small>
                  <span className="category-caption">{product.category}</span>
                  <div className="cart-controls">
                    <div className="quantity">
                      <button
                        disabled={cartBusy || quantity <= 1}
                        aria-label={`Decrease quantity of ${product.title}`}
                        onClick={() =>
                          void updateCart(product._id, quantity - 1).catch(
                            (e) => notify(e.message),
                          )
                        }
                      >
                        <Minus size={13} />
                      </button>
                      <span aria-label={`Quantity of ${product.title}`}>
                        {quantity}
                      </span>
                      <button
                        disabled={cartBusy || quantity >= 10}
                        aria-label={`Increase quantity of ${product.title}`}
                        onClick={() =>
                          void updateCart(product._id, quantity + 1).catch(
                            (e) => notify(e.message),
                          )
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      className="text-button"
                      disabled={cartBusy}
                      onClick={() =>
                        void removeFromCart(product._id).catch((e) =>
                          notify(e.message),
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <strong className="cart-item-price">
                  {money(product.price * quantity)}
                </strong>
              </article>
            ))}
            <div className="cart-subtotal">
              Subtotal ({count} {count === 1 ? 'item' : 'items'}):{' '}
              <strong>{money(cart.total)}</strong>
            </div>
          </>
        )}
      </section>
      {cart.items.length > 0 && (
        <aside className="summary-card">
          <p className="free-message">
            <CheckCircle2 size={18} />
            Your order qualifies for FREE delivery.
          </p>
          <h2>
            Subtotal ({count} {count === 1 ? 'item' : 'items'}):{' '}
            <strong>{money(cart.total)}</strong>
          </h2>
          <Link className="button yellow full" to="/checkout">
            Proceed to checkout
            <ArrowRight size={15} />
          </Link>
          <small>Demo orders only. No payment collected.</small>
        </aside>
      )}
    </main>
  );
}
function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartLoading, cartError, reloadCart } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    phone: '',
    line: '',
    city: '',
    postalCode: '',
  });
  const [requestId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (cartLoading) return <Spinner />;
  if (cartError)
    return (
      <div className="empty">
        <p>{cartError}</p>
      </div>
    );
  if (!cart.items.length && !busy) return <Navigate to="/cart" replace />;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ address, requestId }),
      });
      await reloadCart();
      navigate('/orders?placed=1');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <main className="content-container">
      <div className="page-title">
        <h1>Checkout</h1>
        <Link to="/cart">
          <ArrowLeft size={14} />
          Back to cart
        </Link>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form panel" onSubmit={submit}>
          <h2>
            <span>1</span>Delivery address
          </h2>
          <p className="muted">Use sample details for this college project.</p>
          <label>
            Full name
            <input
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              value={address.fullName}
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
            />
          </label>
          <label>
            Mobile number
            <input
              required
              type="tel"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              autoComplete="tel-national"
              placeholder="10-digit Indian mobile number"
              value={address.phone}
              onChange={(e) =>
                setAddress({ ...address, phone: e.target.value })
              }
            />
          </label>
          <label>
            Address
            <input
              required
              minLength={5}
              maxLength={250}
              autoComplete="street-address"
              placeholder="Flat, house number, street, area"
              value={address.line}
              onChange={(e) => setAddress({ ...address, line: e.target.value })}
            />
          </label>
          <div className="form-grid">
            <label>
              City
              <input
                required
                minLength={2}
                maxLength={80}
                autoComplete="address-level2"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
            </label>
            <label>
              PIN code
              <input
                required
                pattern="[1-9][0-9]{5}"
                maxLength={6}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="6 digits"
                value={address.postalCode}
                onChange={(e) =>
                  setAddress({ ...address, postalCode: e.target.value })
                }
              />
            </label>
          </div>
          <h2 className="payment-heading">
            <span>2</span>Payment method
          </h2>
          <div className="payment-method">
            <span className="radio-dot" />
            <div>
              <strong>Cash on delivery (demo)</strong>
              <p>No payment will be collected. No order will be shipped.</p>
            </div>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="button yellow">
            {busy ? 'Placing order…' : 'Place your demo order'}
            <ArrowRight size={16} />
          </button>
        </form>
        <aside className="summary-card">
          <h2>Order summary</h2>
          {cart.items.map((item) => (
            <div className="summary-item" key={item.product._id}>
              <span>
                {item.product.title}
                <small>Qty: {item.quantity}</small>
              </span>
              <strong>{money(item.product.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="summary-total">
            <span>Delivery</span>
            <span className="in-stock">FREE</span>
          </div>
          <div className="summary-total order-total">
            <strong>Order total</strong>
            <strong>{money(cart.total)}</strong>
          </div>
          <small>
            Prices are calculated by the server from the current product
            catalog.
          </small>
        </aside>
      </div>
    </main>
  );
}
function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  useEffect(() => {
    let active = true;
    api<{ orders: Order[] }>('/orders')
      .then((data) => {
        if (active) setOrders(data.orders);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className="content-container orders-page">
      <div className="page-title">
        <h1>Your Orders</h1>
        <span>{orders.length} orders</span>
      </div>
      {params.get('placed') && (
        <div className="success-banner">
          <CheckCircle2 size={23} />
          <div>
            <strong>Order placed. Thank you!</strong>
            <p>
              Your demo order has been saved. No payment or delivery will take
              place.
            </p>
          </div>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="error">{error}</p>
      ) : !orders.length ? (
        <div className="empty panel">
          <Package size={40} />
          <h2>No orders yet</h2>
          <p>Your shopping story starts here.</p>
          <Link className="button yellow" to="/">
            Start shopping
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <article className="order-card" key={order._id}>
            <div className="order-header">
              <span>
                ORDER PLACED
                <strong>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </span>
              <span>
                TOTAL<strong>{money(order.total)}</strong>
              </span>
              <span>
                SHIP TO<strong>{order.address.fullName}</strong>
              </span>
              <span className="order-number">
                ORDER # {order._id.slice(-10).toUpperCase()}
                <strong className="in-stock">
                  {order.status} · Demo order
                </strong>
              </span>
            </div>
            <div className="order-items">
              {order.items.map((item, i) => (
                <div key={i}>
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      Quantity: {item.quantity} · {money(item.price)} each
                    </p>
                  </div>
                  <strong>{money(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="order-address">
              <MapPin size={14} />
              {order.address.line}, {order.address.city} -{' '}
              {order.address.postalCode}
              <span>{order.paymentMethod}</span>
            </div>
          </article>
        ))
      )}
    </main>
  );
}
function ProductForm({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const { refresh, reloadCart, notify } = useStore();
  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [originalPrice, setOriginalPrice] = useState(
    String(product?.originalPrice || ''),
  );
  const [category, setCategory] = useState(product?.category || categories[0]);
  const [image, setImage] = useState(
    product?.image || '/images/headphones.jpg',
  );
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <Modal title={product ? 'Edit product' : 'Add a product'} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await api(`/products${product ? `/${product._id}` : ''}`, {
              method: product ? 'PATCH' : 'POST',
              body: JSON.stringify({
                title,
                description,
                price: Number(price),
                originalPrice: Number(originalPrice),
                category,
                image,
                inStock,
              }),
            });
            await Promise.all([refresh(), reloadCart()]);
            notify(product ? 'Product updated' : 'Product created');
            onClose();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Product title
          <input
            required
            minLength={3}
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            required
            minLength={10}
            maxLength={3000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            Selling price (₹)
            <input
              required
              type="number"
              step="0.01"
              min="1"
              max="10000000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label>
            Original price (₹)
            <input
              required
              type="number"
              step="0.01"
              min={price || 1}
              max="10000000"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
            />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Product photo
            <select value={image} onChange={(e) => setImage(e.target.value)}>
              {images.map((i) => (
                <option key={i} value={`/images/${i}.jpg`}>
                  {i[0].toUpperCase() + i.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          Available in stock
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button className="button outline" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button yellow" disabled={busy}>
            {busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function AdminPage() {
  const { products, loading, error, refresh, reloadCart, notify } = useStore();
  const [editor, setEditor] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <main className="content-container">
      <div className="page-title">
        <div>
          <h1>Manage products</h1>
          <p className="muted">Add, edit, and delete products in your store.</p>
        </div>
        <button className="button yellow" onClick={() => setEditor('new')}>
          <Plus size={17} />
          Add product
        </button>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img src={p.image} alt="" />
                    <Link to={`/product/${p._id}`}>{p.title}</Link>
                  </td>
                  <td>{p.category}</td>
                  <td>{money(p.price)}</td>
                  <td>
                    <span className={p.inStock ? 'in-stock' : 'out-stock'}>
                      {p.inStock ? 'In stock' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => setEditor(p)}
                      aria-label={`Edit ${p.title}`}
                    >
                      Edit
                    </button>
                    <button
                      className="text-button danger-text"
                      onClick={() => setDeleting(p)}
                      aria-label={`Delete ${p.title}`}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && (
            <div className="empty">
              <p>Your catalog is empty. Add your first product.</p>
            </div>
          )}
        </div>
      )}
      {editor && (
        <ProductForm
          product={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}{' '}
      {deleting && (
        <Modal title="Delete product?" onClose={() => setDeleting(null)}>
          <p className="muted">
            Remove <strong>{deleting.title}</strong> from the catalog and all
            carts? Existing order records will be preserved.
          </p>
          <div className="modal-footer">
            <button
              className="button outline"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api(`/products/${deleting._id}`, {
                    method: 'DELETE',
                    body: '{}',
                  });
                  await Promise.all([refresh(), reloadCart()]);
                  notify('Product deleted');
                  setDeleting(null);
                } catch (e) {
                  notify((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Deleting…' : 'Delete product'}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
function NotFound() {
  return (
    <main className="empty">
      <Package size={38} />
      <h1>We couldn’t find that page</h1>
      <p>The product or page may have been removed.</p>
      <Link to="/" className="button yellow">
        Back to shopping
      </Link>
    </main>
  );
}
export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage register />} />
          <Route element={<Protected />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>
          <Route element={<Protected admin />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}
