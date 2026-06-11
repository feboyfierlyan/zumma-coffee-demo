import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { EASE, SPRING } from '../motion';

// Vertical fulfilment timeline: completed steps get a filled check, the active
// step pulses, upcoming steps are dimmed. `current` is the active step index.
export default function OrderTimeline({ steps, current }) {
  return (
    <div style={{ width: '100%' }}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === steps.length - 1;
        const accent = 'var(--accent-gold)';
        return (
          <div key={step.key} style={{ display: 'flex', gap: '14px' }}>
            {/* Rail */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: done || active ? accent : 'transparent',
                  borderColor: done || active ? accent : 'var(--border)',
                  scale: active ? 1 : 1,
                }}
                transition={{ duration: 0.3, ease: EASE.smoothOut }}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {active && (
                  <motion.span
                    animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `2px solid ${accent}` }}
                  />
                )}
                {done ? (
                  <Check size={15} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: active ? '#FFFFFF' : 'var(--border)' }} />
                )}
              </motion.div>
              {!isLast && (
                <div style={{ flex: 1, width: '2px', minHeight: '34px', backgroundColor: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                  <motion.div
                    initial={false}
                    animate={{ height: done ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: EASE.smoothOut }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: accent }}
                  />
                </div>
              )}
            </div>
            {/* Label */}
            <motion.div
              initial={false}
              animate={{ opacity: done || active ? 1 : 0.5 }}
              style={{ paddingBottom: isLast ? 0 : '18px' }}
            >
              <div style={{ fontSize: '15px', fontWeight: active ? 700 : 600, color: 'var(--text-primary)' }}>{step.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{step.desc}</div>
              {active && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.pop}
                  style={{ display: 'inline-block', marginTop: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)', backgroundColor: 'rgba(155,74,52,0.1)', padding: '3px 10px', borderRadius: '12px' }}
                >
                  Berlangsung
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
