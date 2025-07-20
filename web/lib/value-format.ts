export const formatValue = (value?: string) => {
  let displayValue: string = '--';
  if (value !== undefined) {
    const numValue = parseFloat(value);
    displayValue = Number.isInteger(numValue)
      ? numValue.toLocaleString()
      : numValue.toFixed(2);
  }
  return displayValue;
};
