// logic/decimalWrapper.js
Decimal.set({ precision: 100, rounding: Decimal.ROUND_DOWN });
export const D = (v) => new Decimal(v);
