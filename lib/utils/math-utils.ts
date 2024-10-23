export function computeMean(data: number[]): number {
  const sum = data.reduce((acc, value) => acc + value, 0);
  return sum / data.length;
}

export function computeStandardDeviation(data: number[]): number {
  const mean = computeMean(data);
  const squaredDifferences = data.map((value) => Math.pow(value - mean, 2));
  const sumOfSquaredDifferences = squaredDifferences.reduce(
    (acc, value) => acc + value,
    0
  );
  const variance = sumOfSquaredDifferences / data.length;
  const standardDeviation = Math.sqrt(variance);
  return standardDeviation;
}

export const percentageString = (percentageDecimal: number) =>
  (percentageDecimal * 100).toFixed(2) + "%";

export function formatNumberToShortString(number: number): string {
  const absNumber = Math.abs(number); // Get the absolute value

  if (absNumber >= 1_000_000) {
    const millions = absNumber / 1_000_000;
    const formattedMillions = millions.toFixed(0);
    return `${number < 0 ? "-" : ""}${formattedMillions}M`;
  } else if (absNumber >= 1_000) {
    const thousands = absNumber / 1_000;
    const formattedThousands = thousands.toFixed(0);
    return `${number < 0 ? "-" : ""}${formattedThousands}K`;
  }
  return number.toString();
}

export function formatPrice(price: number): string {
  const roundedPrice = price.toFixed(2);
  const parts = roundedPrice.split(".");
  if (parts.length === 1) {
    // No decimal part, add ".00"
    return `${parts[0]}.00`;
  } else if (parts[1].length === 1) {
    // One digit after the decimal point, add a trailing zero
    return `${parts[0]}.${parts[1]}0`;
  } else {
    // Two or more digits after the decimal point, no changes needed
    return roundedPrice;
  }
}
