import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, MapPin, ShoppingBag, ChevronRight, Plus, Minus, Ticket, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import MenuItemModal from '../components/MenuItemModal';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import Toast from '../components/Toast';
import { EASE, DUR, SPRING, TAP } from '../motion';

const TIP_OPTIONS = [0, 5000, 10000, 15000];

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

// Quantity readout that slides up on increment / down on decrement.
function SlidingQty({ value, direction }) {
  return (
    <div style={{ position: 'relative', width: '18px', height: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: direction > 0 ? '100%' : '-100%' }}
          animate={{ y: '0%' }}
          exit={{ y: direction > 0 ? '-100%' : '100%' }}
          transition={{ duration: 0.15, ease: EASE.snappy }}
          style={{ position: 'absolute', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function CartScreen() {
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    discount,
    tax,
    tip,
    setTip,
    total,
    taxRate,
    appliedVoucher,
    applyVoucher,
    clearVoucher,
    orderNote,
    setOrderNote,
    deliveryOption,
    setDeliveryOption,
  } = useCart();

  const [selectedItem, setSelectedItem] = useState(null);
  const [dirMap, setDirMap] = useState({});
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  const step = (cartItemId, delta) => {
    setDirMap((prev) => ({ ...prev, [cartItemId]: delta }));
    updateQuantity(cartItemId, delta);
  };

  const handleApplyVoucher = () => {
    if (applyVoucher(voucherInput)) {
      setVoucherError('');
      setVoucherInput('');
    } else {
      setVoucherError('Kode voucher tidak valid');
    }
  };

  // Swipe-to-delete with a 5s undo window (item is re-added if undone).
  const handleSwipeDelete = (item) => {
    removeFromCart(item.cartItemId);
    setUndo(item);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  };
  const handleUndo = () => {
    if (undo) addToCart({ ...undo, cartItemId: undefined });
    setUndo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const handleCheckout = () => navigate('/payment');

  if (cart.length === 0) {
    return (
      <motion.div
        initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: DUR.component, ease: EASE.swift }}
        style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', padding: '24px', position: 'relative', overflow: 'hidden' }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0, top: '28%' }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING.pop, delay: 0.1 }}
          style={{ width: '104px', height: '104px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)', marginBottom: '32px', position: 'relative', zIndex: 1 }}
        >
          <ShoppingBag size={40} color="var(--accent-gold)" strokeWidth={1.5} />
        </motion.div>
        <motion.h2 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-display" style={{ fontSize: '24px', marginBottom: '12px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          Keranjang Kosong
        </motion.h2>
        <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', textAlign: 'center', maxWidth: '240px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
          Sepertinya kamu belum memilih menu. Yuk, temukan kopi favoritmu hari ini!
        </motion.p>
        <motion.button whileTap={TAP} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} onClick={() => navigate(-1)} className="btn-primary" style={{ width: '100%', maxWidth: '300px', position: 'relative', zIndex: 1, height: '56px', fontSize: '15px' }}>
          Jelajahi Menu
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: DUR.component, ease: EASE.swift }} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Navigation Header */}
      <header style={{ height: '60px', display: 'flex', alignItems: 'center', padding: '0 16px', position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <motion.button aria-label="Kembali" whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', marginLeft: '-8px', display: 'flex' }}>
          <ChevronLeft color="var(--text-primary)" size={24} />
        </motion.button>
        <div style={{ flex: 1, textAlign: 'center', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
          <span className="text-section-title">Keranjang</span>
        </div>
      </header>

      {/* Order Summary Section */}
      <div style={{ padding: '20px 16px 0' }}>
        <h2 className="text-section-title" style={{ fontSize: '16px', marginBottom: '12px' }}>Pesanan Kamu</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AnimatePresence initial={false}>
            {cart.map((item, idx) => (
              <motion.div
                layout
                key={item.cartItemId || `${item.id}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: DUR.component, ease: EASE.smoothOut }}
                style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden' }}
              >
                {/* Reveal-on-swipe delete affordance */}
                <div style={{ position: 'absolute', inset: 0, backgroundColor: '#C0392B', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '22px', color: '#FFF', gap: '8px' }}>
                  <Trash2 size={18} /> <span style={{ fontSize: '13px', fontWeight: 600 }}>Hapus</span>
                </div>
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.7, right: 0 }}
                onDragEnd={(e, info) => { if (info.offset.x < -100) handleSwipeDelete(item); }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedItem(item)}
                className="will-animate"
                style={{ display: 'flex', padding: '12px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', gap: '12px', cursor: 'pointer', position: 'relative', touchAction: 'pan-y' }}
              >
                {item.image ? (
                  <ImageWithSkeleton src={item.image} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} skeletonBorderRadius="12px" />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: 'var(--surface-2)', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="text-item-name" style={{ paddingRight: '8px', fontSize: '15px' }}>{item.name}</div>
                      <ChevronRight size={16} color="#D1D1D1" style={{ flexShrink: 0, marginTop: '2px' }} />
                    </div>
                    {item.note && <div className="text-item-desc" style={{ fontSize: '12px', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.note}</div>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div className="text-price" style={{ fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '18px', padding: '4px 6px' }}>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); step(item.cartItemId, -1); }} style={{ background: '#FFF', border: 'none', width: '26px', height: '26px', borderRadius: '50%', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <Minus size={14} />
                      </motion.button>
                      <SlidingQty value={item.quantity} direction={dirMap[item.cartItemId] ?? 1} />
                      <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); step(item.cartItemId, 1); }} style={{ background: '#FFF', border: 'none', width: '26px', height: '26px', borderRadius: '50%', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <Plus size={14} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center', opacity: 0.7 }}>Geser kartu ke kiri untuk menghapus</div>
      </div>

      {/* Notes Field */}
      <div style={{ padding: '20px 16px 0' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Catatan untuk dapur</label>
        <textarea
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="Contoh: alergi kacang, minta ekstra saus…"
          style={{ width: '100%', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', minHeight: '80px', padding: '12px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)', resize: 'vertical', outline: 'none' }}
        />
      </div>

      {/* Delivery Option */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Cara Terima Pesanan</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[{ label: 'Ambil Sendiri', Icon: Store }, { label: 'Antar ke Meja', Icon: MapPin }].map(({ label, Icon }) => {
            const active = deliveryOption === label;
            return (
              <motion.div
                key={label}
                whileTap={{ scale: 0.96 }}
                onClick={() => setDeliveryOption(label)}
                style={{ flex: 1, height: '76px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px', borderRadius: 'var(--r-md)', backgroundColor: active ? 'rgba(155,74,52,0.06)' : 'var(--surface-1)', border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border)', transition: 'background-color 0.2s, border-color 0.2s' }}
              >
                <Icon size={20} color={active ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Voucher */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Voucher</div>
        {appliedVoucher ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--r-md)', backgroundColor: 'rgba(155,74,52,0.06)', border: '1px solid var(--accent-gold)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-gold)' }}>
              <Ticket size={16} /> {appliedVoucher.code} — {appliedVoucher.label}
            </span>
            <button aria-label="Hapus voucher" onClick={clearVoucher} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
              <X size={16} color="var(--text-secondary)" />
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '0 12px' }}>
                <Ticket size={16} color="var(--text-secondary)" />
                <input
                  value={voucherInput}
                  onChange={(e) => { setVoucherInput(e.target.value); setVoucherError(''); }}
                  placeholder="Masukkan kode (ZUMMA10)"
                  aria-label="Kode voucher"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', height: '46px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)' }}
                />
              </div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleApplyVoucher} style={{ height: '46px', padding: '0 18px', borderRadius: 'var(--r-sm)', border: 'none', backgroundColor: 'var(--text-primary)', color: '#FFF', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Pakai
              </motion.button>
            </div>
            {voucherError && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '6px' }}>{voucherError}</div>}
          </>
        )}
      </div>

      {/* Tip */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Beri Tip untuk Barista</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {TIP_OPTIONS.map((amt) => {
            const active = tip === amt;
            return (
              <motion.button
                key={amt}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTip(amt)}
                aria-pressed={active}
                style={{ flex: 1, height: '44px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border)', backgroundColor: active ? 'rgba(155,74,52,0.06)' : 'var(--surface-1)', color: active ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
              >
                {amt === 0 ? 'Tanpa' : formatCurrency(amt)}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Order Breakdown */}
      <div style={{ padding: '24px 16px 24px', flex: 1 }} aria-live="polite">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>Subtotal</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600 }}>
            <span>Diskon{appliedVoucher ? ` (${appliedVoucher.code})` : ''}</span>
            <span>− {formatCurrency(discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>Pajak ({Math.round(taxRate * 100)}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        {tip > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Tip Barista</span>
            <span>{formatCurrency(tip)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total</span>
          <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={SPRING.pop} style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(total)}</motion.span>
        </div>
      </div>

      {/* Bottom Action */}
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: DUR.sheet, ease: EASE.smoothOut }}
        className="glass"
        style={{ position: 'sticky', bottom: 0, left: 0, right: 0, borderTop: '1px solid var(--border)', padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', width: '100%', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pembayaran aman via QRIS / Transfer</div>
        <motion.button whileTap={TAP} onClick={handleCheckout} className="btn-primary" style={{ width: '100%' }}>
          Bayar Sekarang &bull; {formatCurrency(total)}
        </motion.button>
      </motion.div>

      <Toast show={!!undo} message="Item dihapus" actionLabel="Urungkan" onAction={handleUndo} />

      <MenuItemModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={(updatedItem) => { addToCart(updatedItem); setSelectedItem(null); }}
      />
    </motion.div>
  );
}
