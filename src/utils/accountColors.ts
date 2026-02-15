/**
 * Deterministic palette for bank account display.
 * Same account id always gets the same color for consistency across the app.
 */
const ACCOUNT_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#ca8a04", // amber
  "#9333ea", // purple
  "#0d9488", // teal
  "#ea580c", // orange
  "#db2777", // pink
  "#4f46e5", // indigo
  "#059669", // emerald
  "#0369a1", // sky
  "#b91c1c", // rose
  "#7c3aed", // violet
  "#0f766e", // teal dark
  "#c026d3", // fuchsia
];

/**
 * Returns a stable hex color for the given account id.
 * Used to distinguish accounts in lists, transactions, and filters.
 */
export function getAccountColor(accountId: number): string {
  const index = Math.abs(accountId) % ACCOUNT_COLORS.length;
  return ACCOUNT_COLORS[index];
}
