// Shared, item-aware option model so the quick-add ("+") path, the detail
// modal, the cart, and the success screen all agree on which customizations
// apply to an item, how they are priced, and how they read on a cart line.

// Price modifiers (Rupiah) for the customizations that affect price.
export const SIZE_DELTAS = { Regular: 0, Large: 5000 };
export const MILK_DELTAS = { Whole: 0, Oat: 7000, Almond: 7000, None: 0 };

const COFFEE_LIKE = ['Coffee', 'Matcha', 'Chocolate'];

export const isDrinkItem = (item) =>
  item?.category === 'Minuman' || item?.category === 'Signature';

// Which option groups apply to a given item, derived from its subcategory.
// An item may override the temperature choices via an optional `temps` field
// (e.g. Hot Tea is hot-only) — keeps the data model additive/backward-compatible.
export const getOptionConfig = (item) => {
  const sub = item?.subcategory;
  let config;
  if (COFFEE_LIKE.includes(sub)) {
    config = { temps: ['Hot', 'Iced'], sizes: true, milks: true, sugar: true };
  } else if (sub === 'Tea & Refreshers') {
    config = { temps: ['Hot', 'Iced'], sizes: true, milks: false, sugar: true };
  } else if (sub === 'Kombucha') {
    config = { temps: ['Iced'], sizes: false, milks: false, sugar: true };
  } else {
    config = { temps: [], sizes: false, milks: false, sugar: false };
  }
  if (Array.isArray(item?.temps)) config = { ...config, temps: item.temps };
  return config;
};

// Does the item have a customization the guest must decide (e.g. Hot vs Iced)?
// Used to decide whether quick-add can add directly or must open the sheet.
export const requiresChoice = (item) => getOptionConfig(item).temps.length > 1;

export const hasOptions = (item) => {
  const c = getOptionConfig(item);
  return c.temps.length > 0 || c.sizes || c.milks || c.sugar;
};

// Sensible defaults for an item (temperature follows the item's first allowed temp).
export const defaultOptionsFor = (item) => {
  const c = getOptionConfig(item);
  return { temperature: c.temps[0] || 'Hot', size: 'Regular', milk: 'Whole', sugar: 50, notes: '' };
};

// Base price + applicable size/milk modifiers.
export const computeItemPrice = (item, options) => {
  const c = getOptionConfig(item);
  let price = item?.price || 0;
  if (c.sizes && options?.size === 'Large') price += SIZE_DELTAS.Large;
  if (c.milks && options?.milk) price += MILK_DELTAS[options.milk] || 0;
  return price;
};

// Human-readable note string shown on the cart / success line, built only from
// the option groups that actually apply to the item.
export const buildOptionNote = (item, options) => {
  const c = getOptionConfig(item);
  const parts = [];
  if (c.temps.length && options?.temperature) parts.push(options.temperature);
  if (c.sizes && options?.size === 'Large') parts.push('Large');
  if (c.milks && options?.milk && options.milk !== 'None') parts.push(`${options.milk} Milk`);
  if (c.sugar && options?.sugar != null) parts.push(`Sugar ${options.sugar}%`);
  const optionsString = parts.join(', ');
  const notes = options?.notes || '';
  if (optionsString && notes) return `${optionsString} | ${notes}`;
  if (optionsString) return optionsString;
  return notes;
};

// Back-compat: some call sites referenced DEFAULT_ITEM_OPTIONS directly.
export const DEFAULT_ITEM_OPTIONS = { temperature: 'Hot', size: 'Regular', milk: 'Whole', sugar: 50, notes: '' };
