import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';

import MenuScreen from './screens/MenuScreen';
import CartScreen from './screens/CartScreen';
import PaymentScreen from './screens/PaymentScreen';
import SuccessScreen from './screens/SuccessScreen';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Wrapper for AnimatePresence to work with react-router Routes
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MenuScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
      </Routes>
    </AnimatePresence>
  );
}

function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hold the preloader for 1.0s to allow the very fast SVG draw animation to finish
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100vh' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }} // Snappier AWWWARDS slide up ease
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#8C3322', // Updated to exact terracotta color
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ textAlign: 'center', width: '160px', height: 'auto' }}
          >
            <svg viewBox="0 0 332 177" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <motion.path 
                d="M124.455 0.0657654L124.707 0.0641449C125.407 0.576008 131.758 21.7179 132.571 24.2621L147.015 69.4252C149.414 77.0167 151.675 85.3849 154.645 92.796C155.834 95.575 159.028 97.7955 161.799 98.7394C167.815 100.788 173.672 97.3707 176.105 91.7542C177.383 88.8105 178.121 85.7569 179.111 82.7348C181.569 75.3455 183.919 67.9209 186.162 60.4637L205.546 0C209.597 1.20594 213.67 2.32238 217.694 3.61862C221.858 4.96094 225.885 6.58656 230.141 7.61218C229.637 8.64776 229.308 9.56906 228.912 10.6424C225.489 19.9047 222.837 29.3633 219.823 38.7598L213.516 58.4373C210.285 68.7778 207.304 79.0156 203.63 89.217C201.371 95.4944 200.468 100.003 197.218 106.083C193.221 113.547 183.744 120.988 175.577 123.153C158.977 127.551 141.589 121.059 133.039 105.817C129.118 98.8252 127.192 89.4445 124.434 81.8326C120.002 69.6042 116.393 57.0634 112.421 44.6712C108.479 32.3703 104.225 19.8627 100.837 7.41487C104.55 6.43939 108.305 5.03507 111.973 3.83775C116.118 2.52939 120.279 1.27197 124.455 0.0657654Z" 
                initial={{ pathLength: 0, fill: "rgba(248, 236, 221, 0)", stroke: "#F8ECDD", strokeWidth: 2 }}
                animate={{ pathLength: 1, fill: "rgba(248, 236, 221, 1)" }}
                transition={{ pathLength: { duration: 0.5, ease: "easeInOut" }, fill: { duration: 0.3, delay: 0.4, ease: "easeIn" } }}
              />
              <motion.path 
                d="M39.1165 52.6823C42.1318 54.3335 47.414 58.4161 50.2684 60.5295L71.8945 76.8183L103.691 100.369C109.78 104.947 116.601 109.672 121.915 115.069C128.048 121.297 131.567 131.552 131.358 140.253C131.115 150.318 127.621 158.9 120.324 165.919C115.513 170.547 109.735 174.065 103.253 175.782C97.5143 177.299 89.1165 176.903 82.9763 176.838L64.7269 176.633L11.4486 176.14L0 176.046L0.228832 150.372C30.6002 150.18 61.2798 151.558 91.6835 151.555C96.0566 151.555 99.6349 151.008 102.752 147.73C104.926 145.434 106.072 142.35 105.926 139.19C105.659 132.584 99.3907 128.538 94.4731 125.124C80.2661 115.26 66.8357 104.235 52.8532 94.1093L35.6975 81.466C32.5065 79.1272 27.4553 75.7043 24.7883 73.2218C26.0893 70.5245 28.145 68.0873 29.912 65.6751C33.0434 61.4007 36.4072 57.2403 39.1165 52.6823Z" 
                initial={{ pathLength: 0, fill: "rgba(248, 236, 221, 0)", stroke: "#F8ECDD", strokeWidth: 2 }}
                animate={{ pathLength: 1, fill: "rgba(248, 236, 221, 1)" }}
                transition={{ pathLength: { duration: 0.5, delay: 0.1, ease: "easeInOut" }, fill: { duration: 0.3, delay: 0.5, ease: "easeIn" } }}
              />
              <motion.path 
                d="M291.908 52.4265C292.245 52.7515 294.681 56.2656 295.261 57.0087C299.158 62.0074 302.918 67.6638 306.918 72.5414C305.277 74.0015 303.409 75.4538 301.622 76.7331C295.339 81.2342 289.145 85.8771 282.946 90.4976C268.246 101.455 253.586 112.463 238.891 123.424C233.732 127.271 225.485 131.723 225.191 138.869C225.075 141.891 226.191 144.829 228.282 147.012C233.112 152.142 239.285 151.244 245.724 151.131L260.133 150.905C273.461 150.794 286.787 150.611 300.112 150.358C310.204 150.161 321.136 149.77 331.2 150.088C331.171 158.619 331.214 167.147 331.324 175.676C328.157 175.657 324.907 175.719 321.729 175.743C302.735 176.15 283.542 176.083 264.529 176.285L246.274 176.509C241.096 176.568 234.727 176.921 229.786 175.832C209.267 171.312 196.699 152.118 200.973 131.434C204.095 116.333 214.488 109.631 225.919 101.32L241.94 89.4817C252.357 81.5619 262.844 73.7363 273.402 66.0055C279.857 61.2004 285.135 57.0184 291.908 52.4265Z" 
                initial={{ pathLength: 0, fill: "rgba(248, 236, 221, 0)", stroke: "#F8ECDD", strokeWidth: 2 }}
                animate={{ pathLength: 1, fill: "rgba(248, 236, 221, 1)" }}
                transition={{ pathLength: { duration: 0.5, delay: 0.2, ease: "easeInOut" }, fill: { duration: 0.3, delay: 0.6, ease: "easeIn" } }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="app-container">
      <Preloader />
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
