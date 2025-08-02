// goldUtils.js

/**
 * Converts a raw GOLD value (in smallest unit, 1e18) to a human-readable string.
 * @param {string|number|BigInt} rawValue - The raw value from the blockchain (wei).
 * @param {number} [minDecimals=2] - Minimum decimal places to show.
 * @param {number} [maxDecimals=4] - Maximum decimal places to show.
 * @returns {string} - Formatted GOLD value.
 */
export function formatGold (rawValue, minDecimals = 2, maxDecimals = 4) {
  const gold = Number(rawValue) / 1e18;
  return gold.toLocaleString(undefined, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Converts a human-readable GOLD value to raw (wei) for onchain use.
 * @param {string|number} goldValue - The GOLD value (e.g., 1.5).
 * @returns {string} - Raw value as string (wei).
 */
export function parseGold (goldValue) {
  return (Number(goldValue) * 1e18).toLocaleString('fullwide', { useGrouping: false });
}
