import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('Ambil Sendiri');
  const [activeOrder, setActiveOrder] = useState(null);

  const addToCart = (item) => {
    setCart((prev) => {
      if (item.cartItemId) {
        // This is an edit of an existing cart item
        const index = prev.findIndex(i => i.cartItemId === item.cartItemId);
        if (index >= 0) {
          const newCart = [...prev];
          newCart[index] = item;
          return newCart;
        }
      }
      
      const existing = prev.find((i) => i.id === item.id && i.note === item.note);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.note === item.note ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      return [...prev, { ...item, cartItemId: Date.now().toString(), quantity: item.quantity || 1 }];
    });
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setCart([]);
    setOrderNote('');
  };

  const checkout = () => {
    const tax = cartTotal * 0.1;
    const total = cartTotal + tax;
    const newOrder = {
      orderId: `B-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      items: [...cart],
      total: total,
      subtotal: cartTotal,
      tax: tax,
      note: orderNote,
      deliveryOption: deliveryOption,
      status: 'Sedang Disiapkan',
      time: new Date().toISOString()
    };
    setActiveOrder(newOrder);
    clearCart();
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, 
      clearCart,
      cartCount, 
      cartTotal,
      orderNote,
      setOrderNote,
      deliveryOption,
      setDeliveryOption,
      activeOrder,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};
