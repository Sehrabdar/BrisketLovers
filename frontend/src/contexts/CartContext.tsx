import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  subtotal: number;
  /** -1 = no recipe (stock unlimited); >=0 = max servings available from stock */
  availableServings: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (menuItemId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (menuItemId: string, quantity: number = 1) => {
    if (!user || user.role !== 'CUSTOMER') return;
    setIsLoading(true);
    try {
      const res = await api.post('/cart/items', { menuItemId, quantity });
      setCart(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || user.role !== 'CUSTOMER') return;
    setIsLoading(true);
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      setCart(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user || user.role !== 'CUSTOMER') return;
    setIsLoading(true);
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user || user.role !== 'CUSTOMER') return;
    setIsLoading(true);
    try {
      await api.delete('/cart/clear');
      setCart({
        id: cart?.id || '',
        userId: user.id,
        items: [],
        totalPrice: 0,
        totalItems: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
