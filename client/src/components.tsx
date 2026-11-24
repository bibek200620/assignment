import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, LoaderCircle, ShoppingCart, Star, X } from 'lucide-react';
import { useAuth, useStore } from './context';
import { money, type Product } from './types';
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`logo ${dark ? 'dark' : ''}`}>
      amazon<span className="logo-in">.in</span>
      <span className="smile" />
      <small>clone</small>
    </span>
  );
}
export function Spinner() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={26} />
      Loading…
    </div>
  );
}
export function Rating({ product }: { product: Product }) {
  return (
    <div
      className="rating"
      aria-label={`${product.rating} out of 5 stars, ${product.reviewCount} sample ratings`}
    >
      <span>{product.rating.toFixed(1)}</span>
      <span className="rating-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            size={14}
            key={n}
            fill={n <= Math.round(product.rating) ? 'currentColor' : 'none'}
          />
        ))}
      </span>
      <small>({product.reviewCount.toLocaleString('en-IN')})</small>
    </div>
  );
}
export function AddButton({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addToCart, cartBusy, notify } = useStore();
  const navigate = useNavigate();
  return (
    <button
      className="button yellow"
      disabled={!product.inStock || cartBusy}
      onClick={async () => {
        if (!user) {
          navigate(
            `/login?next=${encodeURIComponent(`/product/${product._id}`)}`,
          );
          return;
        }
        try {
          await addToCart(product._id);
        } catch (e) {
          notify((e as Error).message);
        }
      }}
    >
      <ShoppingCart size={15} />
      {product.inStock ? 'Add to cart' : 'Currently unavailable'}
    </button>
  );
}
export function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100,
  );
  return (
    <article className="product-card">
      <Link className="product-image" to={`/product/${product._id}`}>
        <img src={product.image} alt={product.title} loading="lazy" />
        {discount > 0 && <span className="image-badge">{discount}% off</span>}
      </Link>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link className="product-title" to={`/product/${product._id}`}>
          {product.title}
        </Link>
        <Rating product={product} />
        <div className="price">
          <span>{money(product.price)}</span>
          <del>{money(product.originalPrice)}</del>
        </div>
        <span className="delivery">
          <Check size={13} />
          FREE delivery
        </span>
        <AddButton product={product} />
      </div>
    </article>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const elements = () => [
      ...(ref.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, select, textarea',
      ) || []),
    ];
    const els = elements();
    (els.find((e) => e.tagName === 'INPUT') || els[0])?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
      if (e.key === 'Tab') {
        const els = elements();
        if (e.shiftKey && document.activeElement === els[0]) {
          e.preventDefault();
          els.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
          e.preventDefault();
          els[0]?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="icon-button"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
