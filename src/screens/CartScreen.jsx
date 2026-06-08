import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, MapPin, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import MenuItemModal from '../components/MenuItemModal';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import { useState } from 'react';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function CartScreen() {
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    updateQuantity,
    cartTotal,
    orderNote,
    setOrderNote,
    deliveryOption,
    setDeliveryOption
  } = useCart();

  const [selectedItem, setSelectedItem] = useState(null);

  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  const handleCheckout = () => {
    navigate('/payment');
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
            filter: 'blur(40px)',
            zIndex: 0,
            top: '30%'
          }}
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
          style={{
            width: '100px', height: '100px', borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            marginBottom: '32px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <ShoppingBag size={40} color="var(--text-primary)" strokeWidth={1.5} />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: 'DM Sans', fontWeight: '600', fontSize: '24px',
            color: 'var(--text-primary)', marginBottom: '12px', textAlign: 'center',
            position: 'relative', zIndex: 1
          }}
        >
          Keranjang Kosong
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5',
            textAlign: 'center', maxWidth: '240px', marginBottom: '40px',
            position: 'relative', zIndex: 1
          }}
        >
          Sepertinya kamu belum memilih menu. Yuk, temukan kopi favoritmu hari ini!
        </motion.p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate(-1)}
          className="btn-primary"
          style={{ width: '100%', maxWidth: '300px', position: 'relative', zIndex: 1, height: '56px', fontSize: '15px' }}
        >
          Jelajahi Menu
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Navigation Header */}
      <header style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        position: 'relative',
        borderBottom: '1px solid var(--border)'
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', marginLeft: '-8px' }}>
          <ChevronLeft color="var(--text-primary)" size={24} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
          <span className="text-section-title">Keranjang</span>
        </div>
      </header>

      {/* Order Summary Section */}
      <div style={{ padding: '24px 16px 0' }}>
        <h2 className="text-section-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Pesanan Kamu</h2>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {cart.map((item, idx) => (
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedItem(item)}
              key={`${item.id}-${idx}`}
              style={{
                display: 'flex',
                padding: '16px 0',
                borderBottom: '1px solid var(--border)',
                gap: '12px',
                cursor: 'pointer'
              }}>
              {/* Image thumbnail */}
              {item.image ? (
                <ImageWithSkeleton
                  src={item.image}
                  alt={item.name}
                  style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                  skeletonBorderRadius="8px"
                />
              ) : (
                <div style={{ width: '56px', height: '56px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', flexShrink: 0 }} />
              )}

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="text-item-name" style={{ paddingRight: '8px' }}>{item.name}</div>
                    <ChevronRight size={16} color="#D1D1D1" style={{ flexShrink: 0, marginTop: '2px' }} />
                  </div>
                  {item.note && <div className="text-item-desc" style={{ fontSize: '12px', marginTop: '4px' }}>{item.note}</div>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div className="text-price">{formatCurrency(item.price)}</div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--surface-2)', borderRadius: '16px', padding: '4px 8px' }}>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartItemId, -1); }}
                      style={{ background: 'none', border: 'none', fontSize: '16px', color: 'var(--accent-gold)', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >−</motion.button>
                    <div style={{ position: 'relative', width: '16px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AnimatePresence>
                        <motion.span
                          key={item.quantity}
                          initial={{ opacity: 0, y: -10, position: 'absolute' }}
                          animate={{ opacity: 1, y: 0, position: 'relative' }}
                          exit={{ opacity: 0, y: 10, position: 'absolute' }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
                          {item.quantity}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartItemId, 1); }}
                      style={{ background: 'none', border: 'none', fontSize: '16px', color: 'var(--accent-gold)', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >+</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notes Field */}
      <div style={{ padding: '20px 16px 0' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Catatan untuk dapur
        </label>
        <motion.textarea
          whileFocus={{ scale: 1.01, borderColor: 'var(--accent-gold)' }}
          transition={{ type: 'spring', bounce: 0.2 }}
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="Contoh: alergi kacang, minta ekstra saus…"
          style={{
            width: '100%',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            minHeight: '80px',
            padding: '12px',
            fontFamily: 'DM Sans',
            fontSize: '14px',
            color: 'var(--text-primary)',
            resize: 'vertical',
            outline: 'none'
          }}
        />
      </div>

      {/* Delivery Option */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>Cara Terima Pesanan</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeliveryOption('Ambil Sendiri')}
            className="card"
            style={{
              flex: 1, height: '72px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '4px',
              border: deliveryOption === 'Ambil Sendiri' ? '1px solid var(--accent-gold)' : '1px solid var(--border)',
              position: 'relative',
              transition: 'border 0.2s'
            }}
          >
            <Store size={20} color={deliveryOption === 'Ambil Sendiri' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
            <span style={{ fontSize: '13px', color: deliveryOption === 'Ambil Sendiri' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Ambil Sendiri</span>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeliveryOption('Antar ke Meja')}
            className="card"
            style={{
              flex: 1, height: '72px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '4px',
              border: deliveryOption === 'Antar ke Meja' ? '1px solid var(--accent-gold)' : '1px solid var(--border)',
              position: 'relative',
              transition: 'border 0.2s'
            }}
          >
            <MapPin size={20} color={deliveryOption === 'Antar ke Meja' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
            <span style={{ fontSize: '13px', color: deliveryOption === 'Antar ke Meja' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Antar ke Meja</span>
          </motion.div>
        </div>
      </div>

      {/* Order Breakdown */}
      <div style={{ padding: '24px 16px 24px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>Subtotal</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>Pajak (10%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total</span>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Bottom Action */}
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="glass"
        style={{
          position: 'sticky', bottom: 0, left: 0, right: 0,
          borderTop: '1px solid var(--border)',
          padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          width: '100%', zIndex: 10
        }}>
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Pembayaran aman via QRIS / Transfer
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleCheckout} className="btn-primary" style={{ width: '100%' }}>
          Bayar Sekarang
        </motion.button>
      </motion.div>

      <MenuItemModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={(updatedItem) => {
          addToCart(updatedItem);
          setSelectedItem(null);
        }}
      />
    </motion.div>
  );
}
