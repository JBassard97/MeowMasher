import { D } from "../logic/decimalWrapper.js";
import { storage } from "../logic/storage.js";

// Number suffixes for standard notation
const SUFFIXES = [
  { value: D(1e3), suffix: "K" },
  { value: D(1e6), suffix: "M" },
  { value: D(1e9), suffix: "B" },
  { value: D(1e12), suffix: "T" },
  { value: D(1e15), suffix: "Qa" },
  { value: D(1e18), suffix: "Qi" },
  { value: D(1e21), suffix: "Sx" },
  { value: D(1e24), suffix: "Sp" },
  { value: D(1e27), suffix: "Oc" },
  { value: D(1e30), suffix: "No" },
  { value: D(1e33), suffix: "Dc" },
  { value: D(1e36), suffix: "UDc" },
  { value: D(1e39), suffix: "DDc" },
  { value: D(1e42), suffix: "TDc" },
  { value: D(1e45), suffix: "QaDc" },
  { value: D(1e48), suffix: "QiDc" },
  { value: D(1e51), suffix: "SxDc" },
  { value: D(1e54), suffix: "SpDc" },
  { value: D(1e57), suffix: "OcDc" },
  { value: D(1e60), suffix: "NoDc" },
  { value: D(1e63), suffix: "Vg" },
  { value: D(1e66), suffix: "UVg" },
  { value: D(1e69), suffix: "DVg" },
  { value: D(1e72), suffix: "TVg" },
  { value: D(1e75), suffix: "QaVg" },
  { value: D(1e78), suffix: "QiVg" },
  { value: D(1e81), suffix: "SxVg" },
  { value: D(1e84), suffix: "SpVg" },
  { value: D(1e87), suffix: "OcVg" },
  { value: D(1e90), suffix: "NoVg" },
  { value: D(1e93), suffix: "Tg" },
  { value: D(1e96), suffix: "UTg" },
  { value: D(1e99), suffix: "DTg" },
  { value: D(1e102), suffix: "TTg" },
];

// Format modes
export const NumberFormat = {
  STANDARD: "standard", // 1,234,567
  SUFFIX: "suffix", // 1.23M
  SCIENTIFIC: "scientific", // 1.23e+6
};

// Current format (can be changed via settings)
let currentFormat = storage.getNumberFormat()

// ! USED IN SETTINGS
export function setNumberFormat(format) {
  currentFormat = format;
}

export function getNumberFormat() {
  return currentFormat;
}

/**
 * Format a Decimal or number for display
 * @param {Decimal|number} value - The value to format
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted string
 */
export function formatNumber(value, decimals = 2) {
  // Convert to Decimal if needed
  const decimal = value.constructor?.name === "Decimal" ? value : D(value);

  // Handle zero and very small numbers
  if (decimal.lte(0)) return "0";

  switch (currentFormat) {
    case NumberFormat.STANDARD:
      return formatStandard(decimal);

    case NumberFormat.SUFFIX:
      return formatSuffix(decimal, decimals);

    case NumberFormat.SCIENTIFIC:
      return formatScientific(decimal, decimals);

    default:
      return formatSuffix(decimal, decimals);
  }
}

function formatStandard(decimal) {
  // Only use standard for numbers under MAX_SAFE_INTEGER
  if (decimal.gt(Number.MAX_SAFE_INTEGER)) {
    // Fall back to suffix for huge numbers
    return formatSuffix(decimal, 2);
  }
  return decimal.toNumber().toLocaleString();
}

function formatSuffix(decimal, decimals) {
  // For numbers under 1000, show standard format
  if (decimal.lt(1000)) {
    return decimal.toNumber().toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  // Find the appropriate suffix
  for (let i = SUFFIXES.length - 1; i >= 0; i--) {
    if (decimal.gte(SUFFIXES[i].value)) {
      const divided = decimal.div(SUFFIXES[i].value);
      const num = divided.toNumber();

      // Check if the number is a whole number (or very close to it)
      const formatted =
        num % 1 === 0
          ? num.toFixed(0) // No decimals if whole number
          : num.toFixed(decimals); // Show decimals otherwise

      return formatted + SUFFIXES[i].suffix;
    }
  }

  // If somehow we don't match any suffix, use scientific
  return formatScientific(decimal, decimals);
}

function formatScientific(decimal, decimals) {
  if (decimal.gt(Number.MAX_SAFE_INTEGER)) {
    return decimal.toExponential(decimals);
  }
  return decimal.toNumber().toExponential(decimals);
}

/**
 * Legacy helper - maintains compatibility with existing code
 * Uses standard formatting for small numbers, suffix for large
 */
export function formatDecimal(decimal) {
  const d = decimal.constructor?.name === "Decimal" ? decimal : D(decimal);

  // Use current format setting
  return formatNumber(d, 2);
}
