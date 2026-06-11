import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '../motion';

// Reusable top-anchored snackbar. Supports an optional action (e.g. "Undo").
export default function Toast({ show, message, actionLabel, onAction }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ duration: 0.28, ease: EASE.smoothOut }}
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', top: 'calc(16px + env(safe-area-inset-top))', left: '50%', zIndex: 200,
            backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)',
            padding: '12px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: '16px',
            maxWidth: 'calc(var(--app-max) - 32px)',
          }}
        >
          <span>{message}</span>
          {actionLabel && (
            <button
              onClick={onAction}
              style={{
                background: 'none', border: 'none', color: 'var(--accent-gold)',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0,
              }}
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
