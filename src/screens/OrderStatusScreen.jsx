import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ORDER_STEPS } from '../config/order';
import { formatCurrency } from '../utils/format';
import { EASE, DUR } from '../motion';
import OrderTimeline from '../components/OrderTimeline';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

export default function OrderStatusScreen() {
  const navigate = useNavigate();
  const { activeOrder, orderStep, setOrderStep, addToCart } = useCart();

  useEffect(() => {
    if (!activeOrder) navigate('/', { replace: true });
  }, [activeOrder, navigate]);

  // Simulate kitchen progress: advance through the lifecycle over time.
  useEffect(() => {
    if (!activeOrder) return undefined;
    if (orderStep >= ORDER_STEPS.length - 1) return undefined;
    const t = setTimeout(() => setOrderStep((s) => Math.min(s + 1, ORDER_STEPS.length - 1)), 9000);
    return () => clearTimeout(t);
  }, [activeOrder, orderStep, setOrderStep]);

  if (!activeOrder) return null;

  const isReady = orderStep >= ORDER_STEPS.length - 1;

  const handleReorder = () => {
    activeOrder.items.forEach((item) => addToCart({ ...item, cartItemId: undefined }));
    navigate('/cart');
  };

  return (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: DUR.component, ease: EASE.swift }}
      style={{ minHeight: '100dvh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}
    >
      <header style={{ height: '60px', display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative', flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.9 }} aria-label="Kembali" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', marginLeft: '-8px', display: 'flex' }}>
          <ChevronLeft color="var(--text-primary)" size={24} />
        </motion.button>
        <div style={{ flex: 1, textAlign: 'center', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
          <span className="text-section-title">Status Pesanan</span>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 32px' }} className="no-scrollbar">
        {/* Order header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span className="text-display" style={{ fontSize: '24px' }}># {activeOrder.orderId}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{activeOrder.deliveryOption}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isReady ? '#1F9D55' : 'var(--accent-gold)', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
          <Clock size={14} />
          {isReady ? 'Pesananmu siap!' : 'Estimasi siap 10–15 menit'}
        </div>

        {/* Timeline */}
        <div className="card" style={{ backgroundColor: 'var(--surface-1)', borderRadius: '20px', padding: '24px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
          <OrderTimeline steps={ORDER_STEPS} current={orderStep} />
        </div>

        {/* Items */}
        <div className="card" style={{ backgroundColor: 'var(--surface-1)', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Rincian Pesanan</div>
          {activeOrder.items.map((item) => (
            <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span style={{ minWidth: 0 }}>
                {item.quantity}x {item.name}
                {item.note && <span style={{ display: 'block', fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>{item.note}</span>}
              </span>
              <span style={{ flexShrink: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            <span>Total</span>
            <span>{formatCurrency(activeOrder.total)}</span>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleReorder} className="btn-primary" style={{ width: '100%', height: '52px', marginBottom: '12px' }}>
          Pesan Lagi
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/')} style={{ width: '100%', height: '48px', borderRadius: '14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
          Kembali ke Menu
        </motion.button>
      </div>
    </motion.div>
  );
}
