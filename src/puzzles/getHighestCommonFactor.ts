export function getPrimeFactors(number: number) {
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

function factorArrayToCounts(factors: number[]): Record<number, number> {
  return factors.reduce<Record<number, number>>((acc, curr) => {
    if (!acc[curr]) {
      acc[curr] = 0;
    }
    acc[curr]++;
    return acc;
  }, {});
}

/**
 * Get highest common factor
 */
export function getHighestCommonFactor(inputs: number[]) {
  return Object.entries(
    inputs
      .map((number) => factorArrayToCounts(getPrimeFactors(number)))
      .reduce((prev, curr) => {
        const intersection: Record<number, number> = {};
        for (const integer in curr) {
          if (integer in prev) {
            intersection[integer] = Math.min(curr[integer], prev[integer]);
          }
        }
        return intersection;
      }),
  ).reduce((acc, [integer, count]) => {
    acc *= parseInt(integer) * count;
    return acc;
  }, 1);
}
