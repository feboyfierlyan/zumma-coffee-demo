// Venue + order configuration. Kept out of the context module so React Fast
// Refresh stays happy (a component/hook module should only export those).

// Venue-level config (would come from the venue/order API in production rather
// than being a hard-coded constant).
export const VENUE_CONFIG = {
  taxRate: 0.1,
  serviceRate: 0,
  currency: 'IDR',
};

// Order fulfilment lifecycle shown on the live status timeline.
export const ORDER_STEPS = [
  { key: 'received', label: 'Pesanan Diterima', desc: 'Kasir menerima pesananmu' },
  { key: 'preparing', label: 'Sedang Disiapkan', desc: 'Barista & dapur mulai meracik' },
  { key: 'ready', label: 'Siap Disajikan', desc: 'Pesananmu siap diambil / diantar' },
];

// Demo promo codes (would be validated server-side in production).
export const PROMO_CODES = {
  ZUMMA10: { code: 'ZUMMA10', type: 'percent', value: 0.1, label: 'Diskon 10%' },
  KOPI5K: { code: 'KOPI5K', type: 'flat', value: 5000, label: 'Potongan Rp 5.000' },
};
