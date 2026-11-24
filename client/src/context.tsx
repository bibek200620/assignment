import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { Cart, Product, User } from './types';
type Auth = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ user: User }>('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    const expired = () => setUser(null);
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  const signIn = async (email: string, password: string, name?: string) => {
    const data = await api<{ user: User }>(
      `/auth/${name ? 'register' : 'login'}`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
      },
    );
    setUser(data.user);
  };
  const signOut = async () => {
    await api('/auth/logout', { method: 'POST', body: '{}' });
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('Missing AuthProvider');
  return ctx;
}
type Store = {
  products: Product[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  cart: Cart;
  cartLoading: boolean;
  cartBusy: boolean;
  cartError: string;
  reloadCart: () => Promise<void>;
  addToCart: (id: string) => Promise<void>;
  updateCart: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  toast: string;
  notify: (message: string) => void;
};
const StoreContext = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [cartLoading, setCartLoading] = useState(false);
  const [cartUser, setCartUser] = useState<string | null>(null);
  const [cartBusy, setBusy] = useState(false);
  const [cartError, setCartError] = useState('');
  const [toast, setToast] = useState('');
  const notify = useCallback((message: string) => setToast(message), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const refresh = useCallback(async () => {
    setError('');
    try {
      const data = await api<{ products: Product[] }>('/products');
      setProducts(data.products);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const reloadCart = useCallback(async () => {
    setCartError('');
    const data = await api<Cart>('/cart');
    setCart(data);
  }, []);
  useEffect(() => {
    let active = true;
    if (!user) {
      setCart({ items: [], total: 0 });
      setCartUser(null);
      setCartError('');
      setCartLoading(false);
      return;
    }
    setCartLoading(true);
    api<Cart>('/cart')
      .then((data) => {
        if (active) setCart(data);
      })
      .catch((e) => {
        if (active) setCartError(e.message);
      })
      .finally(() => {
        if (active) {
          setCartLoading(false);
          setCartUser(user._id);
        }
      });
    return () => {
      active = false;
    };
  }, [user]);
  const mutateCart = async (url: string, method: string, body: object) => {
    setBusy(true);
    try {
      setCart(await api<Cart>(url, { method, body: JSON.stringify(body) }));
      setCartError('');
    } finally {
      setBusy(false);
    }
  };
  const addToCart = async (id: string) => {
    await mutateCart('/cart', 'POST', { productId: id, quantity: 1 });
    notify('Added to your cart');
  };
  const updateCart = async (id: string, quantity: number) => {
    await mutateCart(`/cart/${id}`, 'PATCH', { quantity });
  };
  const removeFromCart = async (id: string) => {
    await mutateCart(`/cart/${id}`, 'DELETE', {});
    notify('Item removed');
  };
  return (
    <StoreContext.Provider
      value={{
        products,
        loading,
        error,
        refresh,
        cart,
        cartLoading: cartLoading || (!!user && cartUser !== user._id),
        cartBusy,
        cartError,
        reloadCart,
        addToCart,
        updateCart,
        removeFromCart,
        toast,
        notify,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('Missing StoreProvider');
  return ctx;
}
