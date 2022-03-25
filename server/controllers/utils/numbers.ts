export const roundToDecimalPlaces = (num: number, decimalPlaces: number): number => {
  const factor = 10 ** decimalPlaces // 10 to the power of [decimalPlaces]
  return Math.round(num * factor) / factor
}
