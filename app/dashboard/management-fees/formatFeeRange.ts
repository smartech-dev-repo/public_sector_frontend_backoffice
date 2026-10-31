const naira = (value: unknown) => `₦${Number(value).toLocaleString()}`;

export function formatFeeRange(fee: { minAmount?: unknown; maxAmount?: unknown }): string {
  const hasMin = fee.minAmount !== null && fee.minAmount !== undefined;
  const hasMax = fee.maxAmount !== null && fee.maxAmount !== undefined;
  if (hasMin && hasMax) return `${naira(fee.minAmount)} to ${naira(fee.maxAmount)}`;
  if (hasMin) return `${naira(fee.minAmount)} and above`;
  if (hasMax) return `Up to ${naira(fee.maxAmount)}`;
  return 'General (all amounts)';
}
