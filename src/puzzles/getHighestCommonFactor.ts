/**
 * Get highest common factor
 */
export function getHighestCommonFactor(input: number[]) {}

export function getPrimeFactors(number: number) {
  //   if (number < 1) {
  //     return null;
  //   }

  let remaining = Math.round(number);

  let divisor = 2;
  const factors: number[] = [];

  while (divisor < remaining) {
    if (remaining % divisor === 0) {
      remaining /= divisor;
      factors.push(divisor);
    } else {
      divisor++;
    }
  }

  factors.push(remaining);

  return factors;
}
