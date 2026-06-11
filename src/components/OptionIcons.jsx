// Minimalist, brand-adapted line illustrations for the menu detail modal's
// option selectors (temperature / size / milk). Single-colour line art so the
// active choice can simply tint the icon with the terracotta accent.

const baseProps = (color) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

// Hot drink — takeaway cup with rising steam.
export function HotCupIcon({ color = '#B5B5B5', size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps(color)} aria-hidden="true">
      <path d="M12 5c-1 1.1-1 2.3 0 3.4" opacity="0.85" />
      <path d="M16.5 4.4c-1 1.1-1 2.3 0 3.4" opacity="0.85" />
      <path d="M20.8 5c-1 1.1-1 2.3 0 3.4" opacity="0.85" />
      <path d="M9 12.4h14" />
      <path d="M10.4 12.4l1.3 12.3a2.2 2.2 0 0 0 2.2 2h4.2a2.2 2.2 0 0 0 2.2-2l1.3-12.3" />
    </svg>
  );
}

// Iced drink — cup with a straw and ice cubes.
export function IcedCupIcon({ color = '#B5B5B5', size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps(color)} aria-hidden="true">
      <path d="M9 11.8h14" />
      <path d="M10.4 11.8l1.3 12.9a2.2 2.2 0 0 0 2.2 2h4.2a2.2 2.2 0 0 0 2.2-2l1.3-12.9" />
      <path d="M17.5 11.8l3.4-7.4" />
      <path d="M13.2 15.6l2 2-2 2-2-2z" />
      <path d="M17.6 19.4l1.7 1.7-1.7 1.7-1.7-1.7z" />
    </svg>
  );
}

// Cup size — same silhouette, the Large variant simply stands taller, echoing
// the reference's Tall/Grande pairing. A filled centre dot marks the choice.
export function CupSizeIcon({ color = '#B5B5B5', size = 30, large = false }) {
  const topY = large ? 7.5 : 12;
  const dotR = large ? 2.4 : 1.9;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps(color)} aria-hidden="true">
      <path d={`M9 ${topY}h14`} />
      <path d={`M10.4 ${topY}l1.3 ${24.5 - topY}a2.2 2.2 0 0 0 2.2 2h4.2a2.2 2.2 0 0 0 2.2-2l1.3-${24.5 - topY}`} />
      <circle cx="16" cy={large ? 17.5 : 19.5} r={dotR} fill={color} stroke="none" />
    </svg>
  );
}

// Whole milk — a gable-top milk carton.
export function WholeMilkIcon({ color = '#B5B5B5', size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps(color)} aria-hidden="true">
      <path d="M11 13v12h10V13" />
      <path d="M11 13l5-5 5 5" />
      <path d="M11 13h10" />
      <path d="M16 8V5.5" />
    </svg>
  );
}

// Oat milk — an ear of oats / grain.
export function OatMilkIcon({ color = '#B5B5B5', size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps(color)} aria-hidden="true">
      <path d="M16 27V8.5" />
      <path d="M16 9.5c1.6-.4 2.8-1.5 3.2-3.4-1.9.2-3 .9-3.2 2.4" />
      <path d="M16 9.5c-1.6-.4-2.8-1.5-3.2-3.4 1.9.2 3 .9 3.2 2.4" />
      <path d="M16 15c1.7-.4 3-1.6 3.4-3.6-2 .2-3.2 1-3.4 2.6" />
      <path d="M16 15c-1.7-.4-3-1.6-3.4-3.6 2 .2 3.2 1 3.4 2.6" />
      <path d="M16 20.5c1.7-.4 3-1.6 3.4-3.6-2 .2-3.2 1-3.4 2.6" />
      <path d="M16 20.5c-1.7-.4-3-1.6-3.4-3.6 2 .2 3.2 1 3.4 2.6" />
    </svg>
  );
}

// Almond milk — an almond nut with its seam.
export function AlmondMilkIcon({ color = '#B5B5B5', size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps(color)} aria-hidden="true">
      <path d="M16 5.5c4.2 3.2 4.2 17.8 0 21-4.2-3.2-4.2-17.8 0-21z" />
      <path d="M16 9c-1.8 3-1.8 11 0 14" opacity="0.7" />
    </svg>
  );
}

// No milk — a crossed-out drop.
export function NoMilkIcon({ color = '#B5B5B5', size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps(color)} aria-hidden="true">
      <path d="M16 6.5c-3.6 5-5 8-5 10.6a5 5 0 0 0 10 0c0-2.6-1.4-5.6-5-10.6z" />
      <path d="M9.5 8.5l13 15" />
    </svg>
  );
}
