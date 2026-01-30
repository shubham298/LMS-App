import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
});

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = async (reqData) => {
    // Call backend API with only the added item
    try {
      const response = await api.post(`/cart`, reqData);

      if (response.data && response.data.cart) {
        setCart(response.data.cart);
      }
    } catch (err) {
      console.error("Failed to sync cart with backend:", err);
    }
  };

  const removeFromCart = async (course) => {
    try {
      const response = await api.delete(
        `/cart/${course.id}`
      );
      if (response.data && response.data.cart) {
        setCart(response.data.cart);
      }
    } catch (err) {
      console.error("Failed to sync cart removal with backend:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCart(response.data.cart || []);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, cartCount, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
