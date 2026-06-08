import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Copy, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { cartTotal, checkout } = useCart();
  const [activeTab, setActiveTab] = useState('QRIS');
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 32); // 14:32
  const [showToast, setShowToast] = useState(false);

  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulate successful payment by tapping the QR code
  const handleSimulatePayment = () => {
    checkout();
    navigate('/success');
  };

  const handleConfirm = () => {
    checkout();
    navigate('/success');
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("0000000000000");
    }
    setShowToast(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-2)' }}
    >
      {/* Header */}
      <header style={{
        height: '60px', display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative', flexShrink: 0
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', marginLeft: '-8px' }}>
          <ChevronLeft color="var(--text-primary)" size={24} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
          <span className="text-section-title">Pembayaran</span>
        </div>
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: '16px', left: '50%', zIndex: 100,
              backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', padding: '12px 24px',
              borderRadius: '24px', fontSize: '13px', fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            Kode berhasil disalin!
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="no-scrollbar">
        {/* Amount Hero */}
        <div style={{ textAlign: 'center', marginTop: '16px', padding: '0 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Pembayaran</div>
          <div className="text-display" style={{ fontSize: '32px' }}>{formatCurrency(total)}</div>
          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '16px auto', width: '60%' }} />
        </div>

        {/* Payment Method Tabs */}
        <div className="no-scrollbar" style={{
          display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto', padding: '0 16px', gap: '24px', flexShrink: 0
        }}>
          {['QRIS', 'Transfer Bank', 'Bayar di Kasir'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                paddingBottom: '12px', whiteSpace: 'nowrap', cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--accent-gold)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? '500' : '400',
                fontSize: '14px'
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* QRIS Panel */}
        {activeTab === 'QRIS' && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px', flex: 1 }}>
            
            {/* QR Code Container */}
            <motion.div 
              animate={{ boxShadow: ['0 4px 12px rgba(0,0,0,0.05)', '0 4px 20px rgba(155,74,52,0.15)', '0 4px 12px rgba(0,0,0,0.05)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              onClick={handleSimulatePayment}
              style={{
                width: '200px', height: '200px', backgroundColor: '#FFFFFF',
                borderRadius: '12px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: '16px',
                cursor: 'pointer'
              }}
            >
              <svg width="130" height="130" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white"/>
                <path d="M10 10H30V30H10V10ZM15 15V25H25V15H15Z" fill="black"/>
                <path d="M70 10H90V30H70V10ZM75 15V25H85V15H75Z" fill="black"/>
                <path d="M10 70H30V90H10V70ZM15 75V85H25V75H15Z" fill="black"/>
                <rect x="40" y="10" width="10" height="10" fill="black"/>
                <rect x="55" y="10" width="10" height="10" fill="black"/>
                <rect x="40" y="25" width="25" height="5" fill="black"/>
                <rect x="10" y="40" width="30" height="5" fill="black"/>
                <rect x="10" y="50" width="10" height="15" fill="black"/>
                <rect x="25" y="50" width="15" height="10" fill="black"/>
                <rect x="45" y="40" width="45" height="15" fill="black"/>
                <rect x="70" y="70" width="20" height="20" fill="black"/>
                <rect x="40" y="60" width="15" height="30" fill="black"/>
                <rect x="60" y="60" width="5" height="20" fill="black"/>
              </svg>
            </motion.div>

            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontSize: '13px' }}>
              <Clock size={14} />
              <span>Berlaku selama {formatTime(timeLeft)}</span>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="btn-secondary" style={{ marginTop: '24px', width: 'auto', padding: '0 24px', height: '44px', fontSize: '13px', gap: '8px' }}>
              <Copy size={16} /> Salin Kode QRIS
            </motion.button>
          </div>
        )}
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="glass"
        style={{
          borderTop: '1px solid var(--border)',
          padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          width: '100%', zIndex: 10, flexShrink: 0
        }}>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          className="btn-primary"
        >
          Konfirmasi Pembayaran
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
