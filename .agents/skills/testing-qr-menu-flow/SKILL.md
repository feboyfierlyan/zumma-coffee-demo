---
name: testing-qr-menu-flow
description: Test the Zumma QR menu ordering flow end-to-end (menu, item-fly add-to-cart, item bottom sheet, cart, QRIS payment, success). Use when verifying UI/UX or motion changes to MenuScreen, MenuItemModal, CartScreen, PaymentScreen, or SuccessScreen.
---

# Testing the QR Menu Order Flow

React 19 + Vite + Framer Motion + Lenis single-page ordering app. No auth, no real backend — cart state is client-side, so the full flow is testable locally with no credentials.

## Run the app

```bash
npm install
npm run dev   # serves http://localhost:5173 (or :5174 if 5173 is taken)
```

The app self-centers in a phone frame (`.app-frame`, max-width ~460px), so it renders as a mobile layout even in a normal desktop browser window. For exact-pixel mobile, use DevTools device emulation at 390px, but the phone frame is sufficient for behavior testing and gives a cleaner recording.

Lint/build: `npm run lint`, `npm run build`. Lint has pre-existing warnings on `main` (experimental react-hooks rules, unused `React` imports) — compare against base before blaming a change.

## Routes (do not expect these to change)

`/` (menu) → `/cart` → `/payment` → `/success` → back to `/`.

## Happy-path flow + concrete assertions

1. **Menu** — featured cards (Honeycomb Latte Rp 31.000, Signature Matcha Rp 29.000), category pills (All/Minuman/Makanan/Dessert), cart icon top-right with no badge when empty.
2. **Item-fly quick-add**: click the circular **+** on a featured card (NOT the card body). A thumbnail clone animates to the cart icon, the cart badge appears showing the count, and a sticky glass cart bar appears at the bottom reading "Total N pesanan" + total price.
3. **Bottom sheet**: tap a card **body** (not the +) to open the item detail sheet. It slides up from the bottom. The footer shows "Add to Cart • <price>".
   - Quantity stepper slides directionally (up on +, down on −). After +,+,− it reads 2 and the footer total = unit × 2.
   - Drag the sheet down past ~40% of its height and release to close it (closing this way does NOT add the item).
4. **Cart** (`/cart`): line item with sliding quantity stepper. Totals: Subtotal, Pajak (10%), Total = Subtotal × 1.1. Checkout CTA "Bayar Sekarang • <Total>".
5. **Payment** (`/payment`): shows total, QRIS tab with a QR code. **Tapping the QR code simulates payment** and navigates to `/success` (there is also a "Konfirmasi Pembayaran" button).
6. **Success** (`/success`): SVG circle + checkmark stroke-draw with spring scale-in, "Pesanan Diterima!", order id "# B-xxx", and "Rincian Pesanan: Nx <item>" reflecting the cart. "Kembali ke Menu" returns to `/` with a "Pesanan #B-xxx diproses" banner and a cleared cart.

## Gotchas

- The featured-card **+** button and the card **body** do different things: + = item-fly quick-add, body = open bottom sheet. Click precisely.
- Payment is triggered by tapping the **QR code image**, which is easy to miss.
- Drag-to-close needs a drag of more than ~40% of the sheet height; a small drag snaps back.
- Brand must stay: terracotta header `#8C3322`, cream background, gold accent `#9B4A34`, DM Sans + Playfair fonts. Flag any change here as a regression.
- Console should be clean except Vite HMR logs and Vercel analytics debug logs.

## Devin Secrets Needed

None — the app has no auth or backend; the entire flow runs locally with no credentials.
