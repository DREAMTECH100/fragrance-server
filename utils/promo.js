// Promo: 5% off below ₦1,000,000, 7.5% off at or above ₦1,000,000.
// Runs Oct 1 - Oct 10, 2026 (Lagos time, WAT = UTC+1).
const PROMO = {
  start: new Date("2026-10-01T00:00:00+01:00"),
  end: new Date("2026-10-10T23:59:59+01:00"),
  threshold: 1000000,
  lowRate: 0.05,
  highRate: 0.075,
};

function getPromo(subtotal, now = new Date()) {
  const sub = Number(subtotal) || 0;
  if (sub <= 0 || now < PROMO.start || now > PROMO.end) {
    return { rate: 0, discount: 0 };
  }
  const rate = sub >= PROMO.threshold ? PROMO.highRate : PROMO.lowRate;
  return { rate, discount: Math.round(sub * rate) };
}

module.exports = { PROMO, getPromo };
