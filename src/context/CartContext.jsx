import React, { createContext, useContext, useState } from 'react';
import { VENUE_CONFIG, ORDER_STEPS, PROMO_CODES } from '../config/order';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('Ambil Sendiri');
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderStep, setOrderStep] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [tip, setTip] = useState(0);

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

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderNote('');
    setAppliedVoucher(null);
    setTip(0);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Centralized money math so Cart, Payment, and Success always agree.
  const discount = appliedVoucher
    ? (appliedVoucher.type === 'percent'
        ? Math.round(cartTotal * appliedVoucher.value)
        : appliedVoucher.value)
    : 0;
  const taxable = Math.max(0, cartTotal - discount);
  const tax = taxable * VENUE_CONFIG.taxRate;
  const total = taxable + tax + tip;

  const applyVoucher = (code) => {
    const found = PROMO_CODES[(code || '').trim().toUpperCase()];
    if (found) {
      setAppliedVoucher(found);
      return true;
    }
    return false;
  };
  const clearVoucher = () => setAppliedVoucher(null);

  const checkout = () => {
    const newOrder = {
      orderId: `B-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      items: [...cart],
      subtotal: cartTotal,
      discount,
      voucher: appliedVoucher,
      tip,
      tax,
      total,
      note: orderNote,
      deliveryOption: deliveryOption,
      status: ORDER_STEPS[0].label,
      time: new Date().toISOString()
    };
    setActiveOrder(newOrder);
    setOrderStep(0);
    clearCart();
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, 
      removeFromCart,
      clearCart,
      cartCount, 
      cartTotal,
      discount,
      tax,
      tip,
      setTip,
      total,
      taxRate: VENUE_CONFIG.taxRate,
      appliedVoucher,
      applyVoucher,
      clearVoucher,
      orderNote,
      setOrderNote,
      deliveryOption,
      setDeliveryOption,
      activeOrder,
      orderStep,
      setOrderStep,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};
