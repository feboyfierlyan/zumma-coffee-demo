import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Plus, Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { mockMenu, mockCategories } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import MenuItemModal from '../components/MenuItemModal';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import Skeleton from '../components/Skeleton';
import { motion, useScroll, useTransform, AnimatePresence, useAnimationControls } from 'framer-motion';
import { EASE, DUR, SPRING, TAP } from '../motion';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

// Curated hero line-up for the "food is the hero" featured rail.
const FEATURED_NAMES = [
  'Honeycomb Latte',
  'Signature Matcha',
  'Beef Pizza',
  'Loco Moco Salted Egg',
  'Hot Pan Brownies',
  'Thai Beef Salad',
];
const featuredItems = FEATURED_NAMES
  .map((name) => mockMenu.find((m) => m.name === name))
  .filter(Boolean);

const CategoryBanner = ({ category }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-18%', '18%']);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-card)' }}>
      <motion.div
        className="will-animate"
        style={{
          position: 'absolute',
          inset: -50,
          backgroundImage: `url(/banner-${category.toLowerCase()}.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)' }} />
      <h2 className="text-section-title" style={{ position: 'absolute', bottom: '18px', left: '18px', color: '#FFFFFF', margin: 0, fontSize: '22px', letterSpacing: '0.3px' }}>
        {category}
      </h2>
    </div>
  );
};

export default function MenuScreen() {
  const navigate = useNavigate();
  const { cartCount, cartTotal, addToCart, cart, activeOrder } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDataLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showCartBar, setShowCartBar] = useState(false);

  // Item-fly add-to-cart machinery
  const cartIconRef = useRef(null);
  const cartBarRef = useRef(null);
  const cartControls = useAnimationControls();
  const [flyers, setFlyers] = useState([]);
  const flyId = useRef(0);

  // Category pill center-scroll
  const pillStripRef = useRef(null);
  const pillRefs = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => setShowCartBar(true), 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const strip = pillStripRef.current;
    const el = pillRefs.current[activeCategory];
    if (strip && el) {
      strip.scrollTo({
        left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  const handleNavigateToCart = () => {
    setIsExiting(true);
    setTimeout(() => navigate('/cart'), 250);
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setDebouncedSearchQuery('');
      setIsSearching(false);
      return undefined;
    }
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const searchResults = debouncedSearchQuery.trim() !== ''
    ? mockMenu.filter((item) => {
        const q = debouncedSearchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      })
    : [];

  const categoriesToRender = activeCategory === 'All'
    ? mockCategories.filter((cat) => cat !== 'All')
    : [activeCategory];

  const handleItemClick = (item) => setSelectedItem(item);

  // Clone the tapped thumbnail and let it glide into the bottom cart bar, then add to cart.
  const quickAdd = useCallback((item, originEl) => {
    if (originEl) {
      const from = originEl.getBoundingClientRect();
      const bar = cartBarRef.current;
      // Land in the bottom cart bar; fall back to bottom-center before the bar mounts.
      const toX = bar ? bar.getBoundingClientRect().left + 44 : window.innerWidth / 2;
      const toY = bar
        ? bar.getBoundingClientRect().top + bar.getBoundingClientRect().height / 2
        : window.innerHeight - 56;
      const dx = toX - (from.left + from.width / 2);
      const dy = toY - (from.top + from.height / 2);
      const id = ++flyId.current;
      setFlyers((prev) => [...prev, {
        id,
        src: item.image,
        from: { top: from.top, left: from.left, width: from.width, height: from.height },
        dx,
        dy,
      }]);
      setTimeout(() => setFlyers((prev) => prev.filter((f) => f.id !== id)), 900);
    }
    if (navigator.vibrate) navigator.vibrate(18);
    addToCart({ ...item, quantity: 1 });
    cartControls.start({
      scale: [1, 1.32, 0.94, 1],
      transition: { duration: DUR.component, ease: EASE.spring },
    });
  }, [addToCart, cartControls]);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: DUR.component, ease: EASE.swift }}
      style={{ paddingBottom: '120px' }}
    >
      {/* Header */}
      <header style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--brand-deep)',
        boxShadow: '0 4px 18px rgba(140, 51, 34, 0.28)',
      }}>
        <div style={{ width: '40px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '34px' }}>
          <svg viewBox="0 0 332 177" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <path d="M124.455 0.0657654L124.707 0.0641449C125.407 0.576008 131.758 21.7179 132.571 24.2621L147.015 69.4252C149.414 77.0167 151.675 85.3849 154.645 92.796C155.834 95.575 159.028 97.7955 161.799 98.7394C167.815 100.788 173.672 97.3707 176.105 91.7542C177.383 88.8105 178.121 85.7569 179.111 82.7348C181.569 75.3455 183.919 67.9209 186.162 60.4637L205.546 0C209.597 1.20594 213.67 2.32238 217.694 3.61862C221.858 4.96094 225.885 6.58656 230.141 7.61218C229.637 8.64776 229.308 9.56906 228.912 10.6424C225.489 19.9047 222.837 29.3633 219.823 38.7598L213.516 58.4373C210.285 68.7778 207.304 79.0156 203.63 89.217C201.371 95.4944 200.468 100.003 197.218 106.083C193.221 113.547 183.744 120.988 175.577 123.153C158.977 127.551 141.589 121.059 133.039 105.817C129.118 98.8252 127.192 89.4445 124.434 81.8326C120.002 69.6042 116.393 57.0634 112.421 44.6712C108.479 32.3703 104.225 19.8627 100.837 7.41487C104.55 6.43939 108.305 5.03507 111.973 3.83775C116.118 2.52939 120.279 1.27197 124.455 0.0657654Z" fill="#F8ECDD" />
            <path d="M39.1165 52.6823C42.1318 54.3335 47.414 58.4161 50.2684 60.5295L71.8945 76.8183L103.691 100.369C109.78 104.947 116.601 109.672 121.915 115.069C128.048 121.297 131.567 131.552 131.358 140.253C131.115 150.318 127.621 158.9 120.324 165.919C115.513 170.547 109.735 174.065 103.253 175.782C97.5143 177.299 89.1165 176.903 82.9763 176.838L64.7269 176.633L11.4486 176.14L0 176.046L0.228832 150.372C30.6002 150.18 61.2798 151.558 91.6835 151.555C96.0566 151.555 99.6349 151.008 102.752 147.73C104.926 145.434 106.072 142.35 105.926 139.19C105.659 132.584 99.3907 128.538 94.4731 125.124C80.2661 115.26 66.8357 104.235 52.8532 94.1093L35.6975 81.466C32.5065 79.1272 27.4553 75.7043 24.7883 73.2218C26.0893 70.5245 28.145 68.0873 29.912 65.6751C33.0434 61.4007 36.4072 57.2403 39.1165 52.6823Z" fill="#F8ECDD" />
            <path d="M291.908 52.4265C292.245 52.7515 294.681 56.2656 295.261 57.0087C299.158 62.0074 302.918 67.6638 306.918 72.5414C305.277 74.0015 303.409 75.4538 301.622 76.7331C295.339 81.2342 289.145 85.8771 282.946 90.4976C268.246 101.455 253.586 112.463 238.891 123.424C233.732 127.271 225.485 131.723 225.191 138.869C225.075 141.891 226.191 144.829 228.282 147.012C233.112 152.142 239.285 151.244 245.724 151.131L260.133 150.905C273.461 150.794 286.787 150.611 300.112 150.358C310.204 150.161 321.136 149.77 331.2 150.088C331.171 158.619 331.214 167.147 331.324 175.676C328.157 175.657 324.907 175.719 321.729 175.743C302.735 176.15 283.542 176.083 264.529 176.285L246.274 176.509C241.096 176.568 234.727 176.921 229.786 175.832C209.267 171.312 196.699 152.118 200.973 131.434C204.095 116.333 214.488 109.631 225.919 101.32L241.94 89.4817C252.357 81.5619 262.844 73.7363 273.402 66.0055C279.857 61.2004 285.135 57.0184 291.908 52.4265Z" fill="#F8ECDD" />
          </svg>
        </div>

        <motion.button
          ref={cartIconRef}
          whileTap={TAP}
          onClick={() => navigate('/cart')}
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginRight: '-8px' }}
        >
          <motion.div animate={cartControls} className="will-animate" style={{ display: 'flex' }}>
            <ShoppingBag color="#FFFFFF" size={24} strokeWidth={1.6} />
          </motion.div>
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.div
                key={cartCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={SPRING.pop}
                style={{
                  position: 'absolute', top: '2px', right: '2px',
                  backgroundColor: 'var(--brand-cream)', color: 'var(--brand-deep)',
                  minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                }}
              >
                {cartCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </header>

      {/* Search */}
      <div style={{ padding: '16px 16px 0 16px', backgroundColor: '#FFFFFF', position: 'relative', zIndex: 40 }}>
        <motion.div
          animate={{
            boxShadow: isSearchFocused || searchQuery ? 'var(--shadow-card)' : '0 2px 8px rgba(0,0,0,0.02)',
            backgroundColor: isSearchFocused || searchQuery ? '#FFFFFF' : '#F7F7F7',
            borderColor: isSearchFocused || searchQuery ? 'rgba(0,0,0,0.08)' : 'transparent',
            scale: isSearchFocused ? 1.01 : 1,
          }}
          transition={SPRING.soft}
          className="will-animate"
          style={{
            display: 'flex', alignItems: 'center', height: '48px', borderRadius: '100px',
            padding: '0 16px', border: '1px solid transparent', overflow: 'hidden', position: 'relative', zIndex: 41,
          }}
        >
          <Search size={18} color={isSearchFocused || searchQuery ? '#1A1A1A' : '#888888'} style={{ transition: 'color 0.3s' }} />
          <input
            type="text"
            placeholder="Cari minuman atau makanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              padding: '0 12px', fontSize: '14px', color: '#1A1A1A', fontFamily: 'DM Sans, sans-serif',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} color="#888888" />
            </button>
          )}
        </motion.div>

        {/* Search results sheet */}
        <AnimatePresence>
          {searchQuery.trim() !== '' && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE.swift }}
              className="will-animate"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: '16px', right: '16px',
                backgroundColor: '#FFFFFF', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-float)',
                border: '1px solid rgba(0,0,0,0.05)', maxHeight: '60vh', overflowY: 'auto', zIndex: 40, padding: '8px',
              }}
            >
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                        <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton-shimmer" style={{ width: '60%', height: '14px', borderRadius: '4px', marginBottom: '8px' }} />
                          <div className="skeleton-shimmer" style={{ width: '30%', height: '12px', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : searchResults.length > 0 ? (
                  <motion.div key="results" variants={{ visible: { transition: { staggerChildren: 0.04 } }, exit: { opacity: 0, transition: { duration: 0.2 } } }} initial="hidden" animate="visible" exit="exit">
                    {searchResults.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: DUR.component, ease: EASE.smoothOut } } }}
                        onMouseDown={() => { handleItemClick(item); setSearchQuery(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{formatCurrency(item.price)}</div>
                        </div>
                        <Plus size={18} color="var(--accent-gold)" />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : debouncedSearchQuery.trim() !== '' ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Menu tidak ditemukan.
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table indicator */}
      <div style={{ padding: '14px 20px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', backgroundColor: 'var(--surface-2)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <MapPin size={14} color="var(--accent-gold)" /> Meja 07
        </span>
      </div>

      {/* Featured rail (food is the hero) */}
      <AnimatePresence>
        {activeCategory === 'All' && searchQuery.trim() === '' && featuredItems.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
            <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h2 className="text-section-title" style={{ margin: 0 }}>Pilihan Hari Ini</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Geser →</span>
            </div>
            <div className="no-scrollbar snap-x" style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '12px 16px 8px' }}>
              {featuredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: DUR.component, ease: EASE.smoothOut }}
                  whileTap={{ scale: 0.97 }}
                  data-fly-card
                  onClick={() => handleItemClick(item)}
                  className="will-animate"
                  style={{
                    flex: '0 0 auto', width: '208px', borderRadius: 'var(--r-lg)', overflow: 'hidden',
                    position: 'relative', cursor: 'pointer', boxShadow: 'var(--shadow-card)', backgroundColor: '#000',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5' }}>
                    <ImageWithSkeleton src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} skeletonBorderRadius="0px" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
                  </div>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px' }}>
                    <div style={{ color: '#FFF', fontSize: '16px', fontWeight: 700, lineHeight: 1.2, marginBottom: '6px' }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--brand-cream)', fontSize: '14px', fontWeight: 600 }}>{formatCurrency(item.price)}</span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); quickAdd(item, e.currentTarget.closest('[data-fly-card]').querySelector('img')); }}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--brand-cream)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Plus size={18} color="var(--brand-deep)" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category pills */}
      <div ref={pillStripRef} className="no-scrollbar" style={{ display: 'flex', overflowX: 'auto', padding: '12px 16px', gap: '10px' }}>
        {mockCategories.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              ref={(el) => { pillRefs.current[cat] = el; }}
              onClick={() => { setActiveCategory(cat); setActiveSubcategory('All'); }}
              style={{
                position: 'relative', height: '38px', padding: '0 20px', borderRadius: '24px',
                border: active ? '1px solid transparent' : '1px solid var(--border)',
                backgroundColor: 'transparent', color: active ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px', whiteSpace: 'nowrap',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flex: '0 0 auto',
              }}
            >
              {active && (
                <motion.span
                  layoutId="activePill"
                  transition={{ duration: 0.2, ease: EASE.swift }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '24px', backgroundColor: 'var(--text-primary)', zIndex: -1 }}
                />
              )}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Subcategory pills */}
      <AnimatePresence>
        {activeCategory !== 'All' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div className="no-scrollbar" style={{ display: 'flex', overflowX: 'auto', padding: '0 16px 12px 16px', gap: '8px' }}>
              {['All', ...new Set(mockMenu.filter((item) => item.category === activeCategory).map((item) => item.subcategory).filter(Boolean))].map((subcat) => {
                const active = activeSubcategory === subcat;
                return (
                  <button
                    key={subcat}
                    onClick={() => setActiveSubcategory(subcat)}
                    style={{
                      position: 'relative', height: '32px', padding: '0 16px', borderRadius: '16px',
                      border: active ? '1px solid transparent' : '1px solid var(--border)',
                      backgroundColor: 'transparent', color: active ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent', flex: '0 0 auto',
                    }}
                  >
                    {active && (
                      <motion.span layoutId="activeSubPill" transition={{ duration: 0.2, ease: EASE.swift }} style={{ position: 'absolute', inset: 0, borderRadius: '16px', backgroundColor: 'var(--accent-gold)', zIndex: -1 }} />
                    )}
                    {subcat}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu sections */}
      <div style={{ padding: '0 16px', paddingBottom: 'calc(140px + env(safe-area-inset-bottom))' }}>
        {categoriesToRender.map((category) => {
          const categoryItems = mockMenu.filter((item) => {
            if (item.category !== category) return false;
            if (activeCategory !== 'All' && activeSubcategory !== 'All' && item.subcategory !== activeSubcategory) return false;
            return true;
          });
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} style={{ marginBottom: '32px' }}>
              {category === 'Makanan' || category === 'Minuman' ? (
                <CategoryBanner category={category} />
              ) : (
                <h2 className="text-section-title" style={{ marginBottom: '16px', fontSize: '22px' }}>{category}</h2>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(() => {
                  const itemsBySubcategory = categoryItems.reduce((acc, item) => {
                    const sub = item.subcategory || 'Lainnya';
                    if (!acc[sub]) acc[sub] = [];
                    acc[sub].push(item);
                    return acc;
                  }, {});

                  return Object.entries(itemsBySubcategory).map(([subcat, items]) => (
                    <div key={subcat} style={{ marginBottom: '28px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {subcat}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {items.map((item, index) => {
                          const itemInCart = cart.filter((c) => c.id === item.id).reduce((sum, curr) => sum + curr.quantity, 0);
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                              transition={{ delay: Math.min(index, 6) * 0.04, duration: DUR.component, ease: EASE.smoothOut }}
                              data-fly-card
                              onClick={() => !isDataLoading && handleItemClick(item)}
                              className="will-animate"
                              style={{
                                padding: '12px', display: 'flex', gap: '14px', alignItems: 'center',
                                cursor: isDataLoading ? 'default' : 'pointer', borderRadius: 'var(--r-md)',
                                backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
                              }}
                            >
                              {isDataLoading ? (
                                <Skeleton width="92px" height="92px" borderRadius="14px" style={{ flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: '92px', height: '92px', flexShrink: 0, borderRadius: '14px', overflow: 'hidden' }}>
                                  <ImageWithSkeleton src={item.image} alt={item.name} style={{ width: '92px', height: '92px', objectFit: 'cover' }} skeletonBorderRadius="14px" />
                                </div>
                              )}

                              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div className="text-item-name" style={{ fontSize: '15px', lineHeight: 1.25 }}>{item.name}</div>
                                <div className="text-item-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>{item.description}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                  <div className="text-price" style={{ fontSize: '15px', fontWeight: 700 }}>{formatCurrency(item.price)}</div>
                                  <motion.button
                                    whileTap={{ scale: 0.82 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      quickAdd(item, e.currentTarget.closest('[data-fly-card]').querySelector('img'));
                                    }}
                                    aria-label={`Tambah ${item.name}`}
                                    style={{
                                      height: '34px', minWidth: '34px', padding: itemInCart > 0 ? '0 12px' : 0, borderRadius: '17px',
                                      backgroundColor: itemInCart > 0 ? 'var(--accent-gold)' : 'transparent',
                                      border: itemInCart > 0 ? 'none' : '1.5px solid var(--text-primary)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                      cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                                      color: itemInCart > 0 ? '#FFF' : 'var(--text-primary)',
                                    }}
                                  >
                                    {itemInCart > 0 && <span>{itemInCart}</span>}
                                    <Plus size={16} color={itemInCart > 0 ? '#FFF' : 'var(--text-primary)'} />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active order banner */}
      <AnimatePresence>
        {activeOrder && !isExiting && showCartBar && (
          <div style={{ position: 'fixed', top: 'calc(16px + env(safe-area-inset-top))', left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '0 16px', pointerEvents: 'none' }}>
            <motion.div
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -120, opacity: 0 }}
              transition={SPRING.bar}
              onClick={() => { setIsExiting(true); setTimeout(() => navigate('/success'), 250); }}
              className="will-animate"
              style={{
                width: '100%', maxWidth: 'calc(var(--app-max) - 32px)', borderRadius: 'var(--r-lg)',
                backgroundColor: 'var(--accent-gold)', color: '#FFFFFF', boxShadow: '0 12px 24px rgba(155, 74, 52, 0.3)',
                padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', pointerEvents: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Pesanan #{activeOrder.orderId} diproses</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Lihat &rarr;</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky cart bar */}
      <AnimatePresence>
        {cartCount > 0 && !isExiting && showCartBar && (
          <div style={{ position: 'fixed', bottom: 'calc(10px + env(safe-area-inset-bottom))', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 16px', pointerEvents: 'none' }}>
            <motion.div
              ref={cartBarRef}
              initial={{ y: 130, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 130, opacity: 0 }}
              transition={{ duration: DUR.sheet, ease: EASE.smoothOut }}
              className="will-animate"
              style={{
                width: '100%', maxWidth: 'calc(var(--app-max) - 32px)', borderRadius: '28px',
                backgroundColor: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
                padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto',
              }}
            >
              <div style={{ paddingLeft: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total {cartCount} pesanan</div>
                <motion.div key={cartTotal} initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={SPRING.pop} className="will-animate" style={{ color: 'var(--accent-gold)', fontSize: '17px', fontWeight: 700, marginTop: '2px', letterSpacing: '-0.5px' }}>
                  {formatCurrency(cartTotal)}
                </motion.div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNavigateToCart}
                style={{ backgroundColor: 'var(--accent-gold)', color: '#FFFFFF', border: 'none', borderRadius: '100px', height: '48px', padding: '0 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 16px rgba(155,74,52,0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Keranjang &rarr;
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flying clones layer */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
        {flyers.map((f) => (
          <motion.img
            key={f.id}
            src={f.src}
            alt=""
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: [0, f.dx * 0.5, f.dx],
              y: [0, -28, f.dy],
              scale: [1, 0.78, 0.34],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.8, ease: EASE.smoothOut, times: [0, 0.32, 1] }}
            className="will-animate"
            style={{
              position: 'fixed', top: f.from.top, left: f.from.left, width: f.from.width, height: f.from.height,
              borderRadius: '16px', objectFit: 'cover', boxShadow: '0 16px 32px rgba(0,0,0,0.22)',
            }}
          />
        ))}
      </div>

      <MenuItemModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />
    </motion.div>
  );
}
