// ===== CHRISTMAS SALE 2026 — set SALE_ACTIVE=false (or delete file + usages) in January =====
const SALE_ACTIVE = true;
const SALE_PERCENT = 10;
const SALE_ENDS_AT = new Date("2027-01-01T00:00:00+01:00"); // set to null for no auto-expiry

function isSaleOn() {
  return SALE_ACTIVE && (!SALE_ENDS_AT || Date.now() < SALE_ENDS_AT.getTime());
}

function getPricing(price) {
  const original = Number(price) || 0;
  if (!isSaleOn() || original <= 0) {
    return { original, final: original, discounted: false, percent: 0 };
  }
  const final = Math.round((original * (100 - SALE_PERCENT)) / 100);
  return { original, final, discounted: final < original, percent: SALE_PERCENT };
}

module.exports = { SALE_ACTIVE, SALE_PERCENT, isSaleOn, getPricing };