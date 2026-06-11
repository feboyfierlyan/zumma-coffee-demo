import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import ImageWithSkeleton from './ImageWithSkeleton';
import { EASE } from '../motion';
import { buildOptionNote, getOptionConfig, computeItemPrice, defaultOptionsFor, SIZE_DELTAS, MILK_DELTAS } from '../utils/itemOptions';
import { HotCupIcon, IcedCupIcon, CupSizeIcon, WholeMilkIcon, OatMilkIcon, AlmondMilkIcon, NoMilkIcon } from './OptionIcons';

const TEMP_ICONS = { Hot: HotCupIcon, Iced: IcedCupIcon };
const MILK_ICONS = { Whole: WholeMilkIcon, Oat: OatMilkIcon, Almond: AlmondMilkIcon, None: NoMilkIcon };

// Quantity readout that slides up on increment / down on decrement.
function SlidingNumber({ value, direction }) {
  return (
    <div style={{ position: 'relative', width: '22px', height: '22px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: direction > 0 ? '100%' : '-100%' }}
          animate={{ y: '0%' }}
          exit={{ y: direction > 0 ? '-100%' : '100%' }}
          transition={{ duration: 0.15, ease: EASE.snappy }}
          style={{ position: 'absolute', fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Aesthetic Colors for Modal
const colors = {
  bg: '#FFFFFF', // Clean white
  textPrimary: '#1A1A1A', // Stark contrast black
  textSecondary: '#888888',
  border: '#F0F0F0',
  selectedBg: '#F8F8F8',
  selectedBorder: '#1A1A1A',
  primarySolid: '#1A1A1A' // Black for primary actions
};

// Seamless Option Group: wraps segmented options
const OptionGroupContainer = ({ children }) => (
  <div style={{
    display: 'flex',
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '8px',
    backgroundColor: '#FFFFFF',
    gap: '4px'
  }}>
    {children}
  </div>
);

// Segmented Option: sleek variant without bounding boxes
const SegmentedOption = ({ icon: Icon, iconProps, label, extra, selected, onClick, iconSize = 50 }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.94 }}
    style={{
      flex: '1 1 0',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 4px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent'
    }}
  >
    <div style={{
      height: '68px', // Fixed height to align icons bottom
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <Icon color={selected ? '#9B4A34' : '#B7B2AD'} size={iconSize} {...iconProps} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '14px', fontWeight: selected ? 600 : 500, color: selected ? '#9B4A34' : colors.textSecondary, lineHeight: 1.1 }}>{label}</span>
      {extra && <span style={{ fontSize: '11px', color: colors.textSecondary, lineHeight: 1 }}>{extra}</span>}
    </div>
  </motion.button>
);

export default function MenuItemModal({ item, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [qtyDir, setQtyDir] = useState(1);
  const [temperature, setTemperature] = useState('Hot');
  const [size, setSize] = useState('Regular');
  const [milk, setMilk] = useState('Whole');
  const [sugar, setSugar] = useState(50);
  const [notes, setNotes] = useState('');

  const [currentItem, setCurrentItem] = useState(item);
  const dragControls = useDragControls();

  useEffect(() => {
    if (item) {
      setCurrentItem(item);
    }
  }, [item]);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item && item.options) {
        setQuantity(item.quantity || 1);
        setTemperature(item.options.temperature || 'Hot');
        setSize(item.options.size || 'Regular');
        setMilk(item.options.milk || 'Whole');
        setSugar(item.options.sugar ?? 50);
        setNotes(item.options.notes || '');
      } else {
        const d = defaultOptionsFor(item);
        setQuantity(1);
        setTemperature(d.temperature);
        setSize(d.size);
        setMilk(d.milk);
        setSugar(d.sugar);
        setNotes('');
      }
    }
  }, [isOpen, item]);

  const config = getOptionConfig(currentItem);
  const finalPrice = computeItemPrice(currentItem, { temperature, size, milk, sugar, notes });
  const totalPrice = finalPrice * quantity;
  const fmtDelta = (d) => (d > 0 ? `+${formatCurrency(d)}` : null);

  const handleAdd = () => {
    const options = { temperature, size, milk, sugar, notes };
    const finalNote = buildOptionNote(currentItem, options);

    onAddToCart({
      ...currentItem,
      price: finalPrice,
      note: finalNote,
      quantity,
      options,
    });
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]); // Success haptic
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && currentItem && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: '100dvh', zIndex: 100,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
          }}
        >
          {/* Dark Overlay Bleeding */}
          <div style={{ position: 'absolute', top: 0, bottom: '-200px', left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: -1 }} />

          {/* Modal Container */}
          <motion.div
            variants={{
              hidden: { y: '105%', transition: { duration: 0.28, ease: EASE.swift } },
              visible: { y: 0, transition: { duration: 0.38, ease: EASE.snappy } },
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ position: 'relative', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragTransition={{ bounceStiffness: 500, bounceDamping: 40 }}
            onDragEnd={(e, info) => {
              // Close when dragged past 40% of the sheet height (or a hard fling).
              const threshold = (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.9 * 0.4;
              if (info.offset.y > threshold || info.velocity.y > 700) {
                onClose();
              }
            }}
          >
            <div
              style={{
                backgroundColor: colors.bg,
                borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
                height: '90dvh', display: 'flex', flexDirection: 'column',
                overflow: 'hidden', position: 'relative'
              }}
            >
            
            {/* Drag Handle Area */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', 
                width: '100px', height: '48px', zIndex: 20,
                display: 'flex', justifyContent: 'center', paddingTop: '12px', touchAction: 'none',
                cursor: 'grab'
              }}
            >
              <div style={{ width: '40px', height: '5px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '3px' }} />
            </div>
            
            {/* Close Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <X size={20} color={colors.textPrimary} />
        </motion.button>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Hero Image */}
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            style={{
              height: '240px', width: '100%', touchAction: 'none', cursor: 'grab',
              position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '24px',
              overflow: 'hidden'
            }}>
            {/* Base Image with Skeleton */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <ImageWithSkeleton 
                src={currentItem?.image || '/featured.png'} 
                alt={currentItem?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                skeletonBorderRadius="0px"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 1 }} 
            />
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: '600',
                fontSize: '28px',
                letterSpacing: '-0.5px',
                color: '#FFFFFF',
                position: 'relative',
                zIndex: 1,
                margin: 0
              }}>
              {currentItem.name}
            </motion.h2>
          </div>

          <div style={{ padding: '24px' }}>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              {currentItem.description}
            </motion.p>

            {config.temps.length > 1 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', letterSpacing: '1px', color: colors.textSecondary, marginBottom: '12px', fontWeight: '500' }}>TEMPERATURE</div>
                <OptionGroupContainer>
                  {config.temps.map((t) => (
                    <SegmentedOption key={t} icon={TEMP_ICONS[t]} label={t} selected={temperature === t} onClick={() => setTemperature(t)} />
                  ))}
                </OptionGroupContainer>
              </div>
            )}

            {config.sizes && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', letterSpacing: '1px', color: colors.textSecondary, marginBottom: '12px', fontWeight: '500' }}>SIZE</div>
                <OptionGroupContainer>
                  <SegmentedOption icon={CupSizeIcon} label="Regular" selected={size === 'Regular'} onClick={() => setSize('Regular')} />
                  <SegmentedOption icon={CupSizeIcon} iconProps={{ large: true }} label="Large" extra={fmtDelta(SIZE_DELTAS.Large)} selected={size === 'Large'} onClick={() => setSize('Large')} />
                </OptionGroupContainer>
              </div>
            )}

            {config.milks && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', letterSpacing: '1px', color: colors.textSecondary, marginBottom: '12px', fontWeight: '500' }}>MILK</div>
                <OptionGroupContainer>
                  {['Whole', 'Oat', 'Almond', 'None'].map(m => (
                    <SegmentedOption key={m} icon={MILK_ICONS[m]} label={m} extra={fmtDelta(MILK_DELTAS[m])} selected={milk === m} onClick={() => setMilk(m)} iconSize={40} />
                  ))}
                </OptionGroupContainer>
              </div>
            )}

            {config.sugar && (
              <>
                {/* Sugar */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', letterSpacing: '1px', color: colors.textSecondary, fontWeight: '500' }}>SUGAR</span>
                    <span style={{ fontSize: '14px', color: colors.textPrimary, fontWeight: '600' }}>{sugar}%</span>
                  </div>
                  
                  {/* Custom Smooth Slider */}
                  <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    {/* Background Track */}
                    <div style={{ position: 'absolute', left: 0, right: 0, height: '6px', backgroundColor: '#EBE3DB', borderRadius: '3px' }} />
                    
                    {/* Animated Filled Track */}
                    <motion.div 
                      animate={{ width: `${sugar}%` }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      style={{ position: 'absolute', left: 0, height: '6px', backgroundColor: '#1A1A1A', borderRadius: '3px' }}
                    />

                    {/* Animated Thumb */}
                    <motion.div
                      animate={{ left: `${sugar}%` }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      style={{
                        position: 'absolute',
                        width: '20px', height: '20px',
                        backgroundColor: '#1A1A1A',
                        borderRadius: '50%',
                        x: '-50%', // center align thumb
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        border: '2px solid #FFFFFF',
                        pointerEvents: 'none' // let clicks pass through to input
                      }}
                    />

                    {/* Invisible Native Input (Interaction Layer) */}
                    <input 
                      type="range" min="0" max="100" step="25"
                      value={sugar} 
                      onChange={(e) => {
                        setSugar(Number(e.target.value));
                        if (navigator.vibrate) navigator.vibrate(10);
                      }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        margin: 0,
                        zIndex: 10,
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textSecondary, fontWeight: '500' }}>
                    <span style={{ color: sugar >= 0 ? colors.textPrimary : colors.textSecondary, transition: 'color 0.3s' }}>0%</span>
                    <span style={{ color: sugar >= 25 ? colors.textPrimary : colors.textSecondary, transition: 'color 0.3s' }}>25%</span>
                    <span style={{ color: sugar >= 50 ? colors.textPrimary : colors.textSecondary, transition: 'color 0.3s' }}>50%</span>
                    <span style={{ color: sugar >= 75 ? colors.textPrimary : colors.textSecondary, transition: 'color 0.3s' }}>75%</span>
                    <span style={{ color: sugar === 100 ? colors.textPrimary : colors.textSecondary, transition: 'color 0.3s' }}>100%</span>
                  </div>
                </div>
              </>
            )}
            {/* End option groups */}

            {/* Notes */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', letterSpacing: '1px', color: colors.textSecondary, marginBottom: '12px', fontWeight: '500' }}>NOTES</div>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                style={{
                  width: '100%', minHeight: '80px', padding: '16px',
                  backgroundColor: '#F5EFE9', border: `1px solid ${colors.border}`,
                  borderRadius: '12px', fontSize: '14px', color: colors.textPrimary,
                  fontFamily: 'DM Sans', resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar Fixed */}
        <div style={{
          padding: '16px 24px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          borderTop: `1px solid ${colors.border}`, backgroundColor: colors.bg,
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          {/* Quantity */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#EBE3DB', borderRadius: '24px', padding: '4px 8px', height: '48px'
          }}>
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { setQtyDir(-1); setQuantity(Math.max(1, quantity - 1)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}>
              <Minus size={16} color={colors.textPrimary} />
            </motion.button>
            <SlidingNumber value={quantity} direction={qtyDir} />
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { setQtyDir(1); setQuantity(quantity + 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}>
              <Plus size={16} color={colors.textPrimary} />
            </motion.button>
          </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="btn-primary"
              style={{
                flex: 1, 
                whiteSpace: 'nowrap'
              }}
            >
              <span>{currentItem?.cartItemId ? 'Update' : 'Add to Cart'}</span>
              <span>&bull;</span>
              <span>{formatCurrency(totalPrice)}</span>
            </motion.button>
          </div>
        </div>
        
        {/* Modal Bleeding Background */}
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: '200px', backgroundColor: colors.bg }} />
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
