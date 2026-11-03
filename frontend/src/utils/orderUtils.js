/**
 * orderUtils.js
 *
 * Helper to ensure lists respect user-defined sequence.
 * Preserves natural array order, but also respects explicit numeric `order` or `displayOrder`
 * if present on items (e.g. from relational database tables).
 */

export function getOrderedItems(items) {
  if (!Array.isArray(items)) return [];
  if (
    items.some(
      (item) =>
        typeof item?.order === "number" || typeof item?.displayOrder === "number"
    )
  ) {
    return [...items].sort((a, b) => {
      const orderA = a.order ?? a.displayOrder ?? 0;
      const orderB = b.order ?? b.displayOrder ?? 0;
      return orderA - orderB;
    });
  }
  return items;
}
