export function convertToFiniteNumber(number: number) {
  return Number.isFinite(number) ? number : 0;
}

export function toFixedNumber2(value: number | string) {
  const val =
    typeof value === "string" ? Number(value.replace(/\$|(,*)/g, "")) : value;
  const number = Math.round(val * 100) / 100;
  return number;
}
