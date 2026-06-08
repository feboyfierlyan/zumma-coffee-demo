import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.1 }
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
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', damping: 15 }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <motion.circle 
              cx="50" cy="50" r="40" 
              stroke="var(--accent-gold)" strokeWidth="6" 
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }} 
            />
            <motion.path 
              d="M30 50L45 65L70 35" 
              stroke="var(--accent-gold)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" 
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }} 
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
            <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>{item.quantity}x {item.name}</span>
            </div>
          ))}
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
          onClick={() => navigate('/')}
          className="btn-primary"
          style={{ height: '56px', fontSize: '16px' }}
        >
          Kembali ke Menu
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
