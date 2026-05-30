/** Format a $KESTO amount (play money) like "1,000 $KESTO". */
export function kesto(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US")} $KESTO`;
}

/** Format a cents-priced share (1–99) like "63¢". */
export function cents(price: number): string {
  return `${Math.round(price)}¢`;
}

/** Format a USD amount like "$25". */
export function usd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/** Format a cents value as USD with two decimals, e.g. 2583 -> "$25.83". */
export function usdFromCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Compact volume, e.g. 1_240_000 -> "$1.2M". */
export function volume(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}
