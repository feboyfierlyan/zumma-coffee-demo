// Shared option/note helpers so the quick-add ("+") path and the detail-modal
// add-to-cart path always produce the same cart line shape and merge correctly.

export const DEFAULT_ITEM_OPTIONS = {
  temperature: 'Hot',
  size: 'Regular',
  milk: 'Whole',
  sugar: 50,
  notes: '',
};

export const isDrinkItem = (item) =>
  item?.category === 'Minuman' || item?.category === 'Signature';

// Build the human-readable note string shown on the cart line from the
// selected options (drinks only carry temperature/size/milk/sugar).
export const buildOptionNote = (item, options) => {
  const parts = [];
  if (isDrinkItem(item)) {
    parts.push(options.temperature);
    if (options.size === 'Large') parts.push('Large');
    if (options.milk !== 'None') parts.push(`${options.milk} Milk`);
    parts.push(`Sugar ${options.sugar}%`);
  }
  const optionsString = parts.join(', ');
  const notes = options.notes || '';
  if (optionsString && notes) return `${optionsString} | ${notes}`;
  if (optionsString) return optionsString;
  return notes;
};
