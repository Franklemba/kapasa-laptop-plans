/**
 * Currency utility functions for Zambian Kwacha (ZMK)
 */

/**
 * Format a number as Zambian Kwacha currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "ZMK 1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  return `ZMK ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format a number as Zambian Kwacha currency without decimals
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "ZMK 1,234")
 */
export const formatCurrencyShort = (amount: number): string => {
  return `ZMK ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Get the currency symbol
 * @returns Currency symbol string
 */
export const getCurrencySymbol = (): string => {
  return 'ZMK';
};
