import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Copy, RefreshCw, Building2, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { motion } from 'framer-motion';
import { EASE, DUR } from '../motion';
import Toast from '../components/Toast';

const INITIAL_TIME = 14 * 60 + 32; // 14:32

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 }
};

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { total, checkout } = useCart();
  const [activeTab, setActiveTab] = useState('QRIS');
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [showToast, setShowToast] = useState(false);

  const expired = timeLeft <= 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const regenerate = () => setTimeLeft(INITIAL_TIME);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulate successful payment by tapping the QR code
  const handleSimulatePayment = () => {
    if (expired) { regenerate(); return; }
    checkout();
    navigate('/success');
  };

  const handleConfirm = () => {
    checkout();
    navigate('/success');
  };

  const handleCopy = (value) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value || "0000000000000");
    }
    setShowToast(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: DUR.component, ease: EASE.swift }}
      style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-2)' }}
    >
      {/* Header */}
      <header style={{
        height: '60px', display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative', flexShrink: 0
      }}>
        <motion.button aria-label="Kembali" whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', marginLeft: '-8px', display: 'flex' }}>
          <ChevronLeft color="var(--text-primary)" size={24} />
        </motion.button>
        <div style={{ flex: 1, textAlign: 'center', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
          <span className="text-section-title">Pembayaran</span>
        </div>
      </header>

      <Toast show={showToast} message="Kode berhasil disalin!" />

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
              animate={expired ? {} : { boxShadow: ['0 4px 12px rgba(0,0,0,0.05)', '0 4px 20px rgba(155,74,52,0.15)', '0 4px 12px rgba(0,0,0,0.05)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              onClick={handleSimulatePayment}
              style={{
                width: '200px', height: '200px', backgroundColor: '#FFFFFF',
                borderRadius: '12px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: '16px',
                cursor: 'pointer', position: 'relative', overflow: 'hidden'
              }}
            >
              {expired && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', zIndex: 2, padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Kode QRIS kedaluwarsa</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    <RefreshCw size={14} /> Ketuk untuk perbarui
                  </span>
                </div>
              )}
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

            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: expired ? '#C0392B' : 'var(--accent-gold)', fontSize: '13px', fontWeight: expired ? 600 : 400 }}>
              <Clock size={14} />
              <span>{expired ? 'Kode kedaluwarsa' : `Berlaku selama ${formatTime(timeLeft)}`}</span>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={expired ? regenerate : () => handleCopy('00020101021126...QRIS')}
              className="btn-secondary" style={{ marginTop: '24px', width: 'auto', padding: '0 24px', height: '44px', fontSize: '13px', gap: '8px' }}>
              {expired ? <><RefreshCw size={16} /> Perbarui Kode QRIS</> : <><Copy size={16} /> Salin Kode QRIS</>}
            </motion.button>
          </div>
        )}

        {/* Transfer Bank Panel */}
        {activeTab === 'Transfer Bank' && (
          <div style={{ marginTop: '24px', padding: '0 16px', flex: 1 }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Building2 size={20} color="var(--accent-gold)" />
                <span style={{ fontSize: '15px', fontWeight: 700 }}>Bank Central Asia (BCA)</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nomor Virtual Account</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.5px' }}>8808 0812 3456 7890</span>
                <motion.button whileTap={{ scale: 0.9 }} aria-label="Salin nomor VA" onClick={() => handleCopy('8808081234567890')} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Copy size={18} color="var(--accent-gold)" />
                </motion.button>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Jumlah Transfer</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(total)}</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.5, textAlign: 'center' }}>
              Transfer sesuai jumlah di atas, lalu tekan <b>Saya Sudah Bayar</b>. Pembayaran terverifikasi otomatis.
            </p>
          </div>
        )}

        {/* Cashier Panel */}
        {activeTab === 'Bayar di Kasir' && (
          <div style={{ marginTop: '24px', padding: '0 16px', flex: 1 }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <Store size={28} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tunjukkan kode ini ke kasir</div>
              <div className="text-display" style={{ fontSize: '34px', letterSpacing: '2px', marginBottom: '12px' }}>ZUM-0739</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', backgroundColor: 'var(--surface-2)', padding: '8px 16px', borderRadius: '12px' }}>
                Total {formatCurrency(total)}
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.5, textAlign: 'center' }}>
              Bayar tunai / kartu di kasir, lalu tekan <b>Saya Sudah Bayar</b> untuk menyelesaikan pesanan.
            </p>
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
          {activeTab === 'QRIS' ? 'Konfirmasi Pembayaran' : 'Saya Sudah Bayar'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
