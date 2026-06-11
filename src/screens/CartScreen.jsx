import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, MapPin, ShoppingBag, ChevronRight, Plus, Minus, Ticket, Trash2, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import MenuItemModal from '../components/MenuItemModal';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import Toast from '../components/Toast';
import { EASE, DUR, SPRING, TAP } from '../motion';
import { mockMenu } from '../data/mockData';
import { defaultOptionsFor, buildOptionNote, computeItemPrice, requiresChoice } from '../utils/itemOptions';

const TIP_OPTIONS = [0, 5000, 10000, 15000];

// Curated picks surfaced on the empty cart so it becomes a discovery moment
// instead of a dead-end. Resolved against the menu so prices/images stay in sync.
const EMPTY_PICK_NAMES = ['Honeycomb Latte', 'Signature Matcha', 'Burnt Caramel Latte', 'Sea Salt Butterscotch'];
const emptyPicks = EMPTY_PICK_NAMES
  .map((name) => mockMenu.find((m) => m.name === name))
  .filter(Boolean);

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

  // Quick-add a recommended pick straight from the empty cart. Items with a
  // real choice (e.g. Hot vs Iced) open the detail sheet; everything else adds
  // with priced defaults — mirroring the menu's quick-add for consistent lines.
  const quickAdd = useCallback((item) => {
    if (requiresChoice(item)) {
      setSelectedItem(item);
      return;
    }
    if (navigator.vibrate) navigator.vibrate(18);
    const options = defaultOptionsFor(item);
    const note = buildOptionNote(item, options);
    const price = computeItemPrice(item, options);
    addToCart({ ...item, price, note, options, quantity: 1 });
  }, [addToCart]);

  if (cart.length === 0) {
    return (
      <motion.div
        initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: DUR.component, ease: EASE.swift }}
        style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}
      >
        {/* Navigation header — matches the populated cart for a consistent frame */}
        <header style={{ height: '60px', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
          <motion.button aria-label="Kembali" whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', marginLeft: '-8px', display: 'flex' }}>
            <ChevronLeft color="var(--text-primary)" size={24} />
          </motion.button>
          <div style={{ flex: 1, textAlign: 'center', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
            <span className="text-section-title">Keranjang</span>
          </div>
        </header>

        {/* Hero — composed empty state */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 28px 24px', position: 'relative', overflow: 'hidden' }}>
          {/* Soft, slowly-breathing brand orb */}
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 68%)', filter: 'blur(56px)', zIndex: 0 }}
          />

          {/* Layered ring + icon composition */}
          <div style={{ position: 'relative', width: '212px', height: '212px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '34px' }}>
            {/* Concentric guide rings */}
            <motion.div
              aria-hidden
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING.soft, delay: 0.05 }}
              style={{ position: 'absolute', width: '212px', height: '212px', borderRadius: '50%', border: '1px solid var(--border)' }}
            />
            <motion.div
              aria-hidden
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING.soft, delay: 0.12 }}
              style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid var(--border)', background: 'radial-gradient(circle at 50% 35%, rgba(155,74,52,0.06), transparent 70%)' }}
            />

            {/* Floating accent specks (coffee beans) */}
            <motion.span aria-hidden animate={{ y: [0, -9, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '14px', right: '34px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', opacity: 0.5 }} />
            <motion.span aria-hidden animate={{ y: [0, 8, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              style={{ position: 'absolute', bottom: '26px', left: '28px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--brand-deep)', opacity: 0.35 }} />
            <motion.span aria-hidden animate={{ y: [0, -7, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              style={{ position: 'absolute', bottom: '52px', right: '18px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', opacity: 0.4 }} />

            {/* Central disc — pops in, then idly floats */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING.pop, delay: 0.15 }}
              style={{ zIndex: 1 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '108px', height: '108px', borderRadius: '50%', background: 'linear-gradient(160deg, #FFFFFF 0%, var(--surface-2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-float)' }}
              >
                <ShoppingBag size={40} color="var(--accent-gold)" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          </div>

          <motion.h2 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.28, duration: DUR.component, ease: EASE.smoothOut }} className="text-display" style={{ fontSize: '26px', marginBottom: '10px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            Keranjang Masih Kosong
          </motion.h2>
          <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.36, duration: DUR.component, ease: EASE.smoothOut }} style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', textAlign: 'center', maxWidth: '260px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            Belum ada menu pilihanmu. Mulai dari rekomendasi di bawah, atau jelajahi seluruh menu kami.
          </motion.p>
          <motion.button whileTap={TAP} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.44, duration: DUR.component, ease: EASE.smoothOut }} onClick={() => navigate(-1)} className="btn-primary" style={{ width: '100%', maxWidth: '320px', position: 'relative', zIndex: 1, height: '54px', fontSize: '15px' }}>
            Jelajahi Menu
            <ArrowRight size={18} strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* Recommendations — turn the dead-end into a discovery moment */}
        {emptyPicks.length > 0 && (
          <motion.section
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.52, duration: DUR.sheet, ease: EASE.smoothOut }}
            style={{ flexShrink: 0, paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 16px 12px' }}>
              <h3 className="text-section-title" style={{ fontSize: '16px', margin: 0 }}>Rekomendasi untukmu</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Geser →</span>
            </div>
            <div className="no-scrollbar snap-x" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 16px 4px' }}>
              {emptyPicks.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 + i * 0.05, duration: DUR.component, ease: EASE.smoothOut }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedItem(item)}
                  className="will-animate"
                  style={{ flex: '0 0 auto', width: '150px', borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: 'var(--shadow-card)', backgroundColor: '#000' }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                    <ImageWithSkeleton src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} skeletonBorderRadius="0px" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.08) 58%, transparent 100%)' }} />
                  </div>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 12px' }}>
                    <div style={{ color: '#FFF', fontSize: '13px', fontWeight: 700, lineHeight: 1.25, marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--brand-cream)', fontSize: '12.5px', fontWeight: 600 }}>{formatCurrency(item.price)}</span>
                      <motion.button
                        aria-label={`Tambah ${item.name}`}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); quickAdd(item); }}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-cream)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Plus size={17} color="var(--brand-deep)" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        <MenuItemModal
          isOpen={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(updatedItem) => { addToCart(updatedItem); setSelectedItem(null); }}
        />
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
