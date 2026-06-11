import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { EASE, SPRING } from '../motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.96 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.04 }
};

export default function SuccessScreen() {
  const navigate = useNavigate();
  const { activeOrder } = useCart();

  useEffect(() => {
    if (!activeOrder) {
      navigate('/', { replace: true });
    }
  }, [activeOrder, navigate]);

  if (!activeOrder) return null;

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ 
        minHeight: '100dvh', backgroundColor: 'var(--bg-main)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING.pop, delay: 0.1 }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <motion.circle 
              cx="50" cy="50" r="40" 
              stroke="var(--accent-gold)" strokeWidth="6" 
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.5, ease: EASE.smoothOut }} 
            />
            <motion.path 
              d="M30 50L45 65L70 35" 
              stroke="var(--accent-gold)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" 
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.35, ease: EASE.smoothOut }} 
            />
          </svg>
        </motion.div>

        {/* Confetti Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`confetti-${i}`}
            style={{
              position: 'absolute', top: '50%', left: '50%', width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? 'var(--accent-gold)' : '#D0A37A'
            }}
            initial={{ scale: 0, x: '-50%', y: '-50%' }}
            animate={{ 
              scale: [0, 1.5, 0],
              x: `calc(-50% + ${Math.cos(i * 45 * Math.PI / 180) * 80}px)`,
              y: `calc(-50% + ${Math.sin(i * 45 * Math.PI / 180) * 80}px)`
            }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </div>

      <motion.h2 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="text-display" style={{ fontSize: '26px', marginBottom: '8px', textAlign: 'center' }}
      >
        Pesanan Diterima!
      </motion.h2>
      
      <div style={{ fontSize: '20px', fontWeight: '500', color: 'var(--accent-gold)', marginBottom: '28px' }}>
        # {activeOrder.orderId}
      </div>

      {/* Detail Card */}
      <div className="card glass" style={{
        width: '100%',
        backgroundColor: 'var(--surface-1)',
        padding: '24px',
        borderRadius: '24px',
        textAlign: 'center',
        marginBottom: '32px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Estimasi siap dalam
        </div>
        <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>
          10–15 menit
        </div>
        <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '16px' }} />
        
        <div style={{ textAlign: 'left', width: '100%', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>Rincian Pesanan:</div>
          {activeOrder.items.map(item => (
            <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', gap: '12px' }}>
              <span style={{ minWidth: 0 }}>
                {item.quantity}x {item.name}
                {item.note && (
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.75, marginTop: '2px' }}>{item.note}</span>
                )}
              </span>
              <span style={{ flexShrink: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '16px' }} />

        <div style={{ textAlign: 'left', width: '100%', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Subtotal</span><span>{formatCurrency(activeOrder.subtotal)}</span>
          </div>
          {activeOrder.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px' }}>
              <span>Diskon{activeOrder.voucher ? ` (${activeOrder.voucher.code})` : ''}</span><span>− {formatCurrency(activeOrder.discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Pajak</span><span>{formatCurrency(activeOrder.tax)}</span>
          </div>
          {activeOrder.tip > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Tip Barista</span><span>{formatCurrency(activeOrder.tip)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
            <span>Total</span><span>{formatCurrency(activeOrder.total)}</span>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '16px' }} />

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Cara terima: {activeOrder.deliveryOption}
        </div>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#25D36620',
          color: '#25D366',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Notifikasi WhatsApp akan dikirim
        </div>
      </div>

      {/* Bottom Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        style={{ marginTop: '48px', width: '100%', maxWidth: '300px' }}
      >
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/status')}
          className="btn-primary"
          style={{ height: '56px', fontSize: '16px', width: '100%' }}
        >
          Lihat Status Pesanan
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{ marginTop: '12px', height: '52px', fontSize: '15px', width: '100%', borderRadius: '14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Kembali ke Menu
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
