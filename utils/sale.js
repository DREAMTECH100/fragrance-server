// ===== CHRISTMAS SALE 2026 — set SALE_ACTIVE=false (or delete file + usages) in January =====
const SALE_ACTIVE = true;
const SALE_ENDS_AT = new Date("2027-01-01T00:00:00+01:00"); // set to null for no auto-expiry

// Tiered discount, based on the price of ONE unit (the size/price the customer picked)
const SALE_TIER_THRESHOLD = 1000000; // ₦1,000,000
const SALE_PERCENT_BELOW = 5;        // unit price below ₦1,000,000
const SALE_PERCENT_ABOVE = 7.5;      // unit price ₦1,000,000 and above

function isSaleOn() {
  return SALE_ACTIVE && (!SALE_ENDS_AT || Date.now() < SALE_ENDS_AT.getTime());
}

function getPricing(price) {
  const original = Number(price) || 0;
  if (!isSaleOn() || original <= 0) {
    return { original, final: original, discounted: false, percent: 0 };
  }
  const percent = original >= SALE_TIER_THRESHOLD ? SALE_PERCENT_ABOVE : SALE_PERCENT_BELOW;
  const final = Math.round((original * (100 - percent)) / 100);
  return { original, final, discounted: final < original, percent };
}

module.exports = {
  SALE_ACTIVE,
  SALE_TIER_THRESHOLD,
  SALE_PERCENT_BELOW,
  SALE_PERCENT_ABOVE,
  isSaleOn,
  getPricing,
};