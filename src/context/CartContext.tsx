import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getCart,
  addCartItem,
  removeCartItem,
  updateCartItem,
  clearCartApi as apiClearCart, // ✅ FIX: الاسم الصحيح في cartService.ts
} from "@/services/cartService";
import { toast } from "sonner";

export interface CartItem {
  id: string; // سنستخدمه كـ product_id في السلة
  name: string;
  price: number;
  image: string;
  quantity: number;
  brand: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void> | void;
  removeItem: (id: string) => Promise<void> | void;
  updateQuantity: (id: string, quantity: number) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 1) Guest: load from localStorage once
  useEffect(() => {
    if (!user && !initialized) {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }
      setInitialized(true);
    }
  }, [user, initialized]);

  // 2) Logged-in: load from backend cart
  useEffect(() => {
    let mounted = true;

    const fetchCart = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const cart = await getCart(user.id);

        if (!mounted) return;

        const mapped: CartItem[] = (cart.items ?? []).map((it) => ({
          id: String(it.productId), // ✅ نستخدم productId كـ id
          name: it.name,
          price: Number(it.price) || 0,
          image: it.image,
          quantity: Number(it.quantity) || 1,
          brand: "", // backend لا يرجع brand حالياً
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Failed to fetch cart", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCart();

    return () => {
      mounted = false;
    };
  }, [user]);

  // 3) Persist locally only for guest
  useEffect(() => {
    if (!user && initialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, user, initialized]);

  const addItem = async (newItem: Omit<CartItem, "quantity">) => {
    // optimistic
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });

    // sync backend if logged in
    if (user) {
      try {
        await addCartItem({
          user_id: user.id,
          product_id: newItem.id,
          quantity: 1,
        });
      } catch (e) {
        console.error("Failed to add item to backend cart", e);
        toast.error("Failed to sync cart");
      }
    }
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));

    if (user) {
      try {
        await removeCartItem({ user_id: user.id, product_id: id });
      } catch (e) {
        console.error("Failed to remove item from backend cart", e);
        toast.error("Failed to sync cart");
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );

    if (user) {
      try {
        await updateCartItem({
          user_id: user.id,
          product_id: id,
          quantity,
        });
      } catch (e) {
        console.error("Failed to update quantity in backend cart", e);
        toast.error("Failed to sync cart");
      }
    }
  };

  const clearCart = async () => {
    setItems([]);

    if (user) {
      try {
        await apiClearCart(user.id);
      } catch (e) {
        console.error("Failed to clear backend cart", e);
        toast.error("Failed to clear cart");
      }
    } else {
      localStorage.removeItem("cart");
    }
  };

  const totalItems = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const totalPrice = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
