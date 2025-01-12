import { getPrimeFactors } from "./getHighestCommonFactor";

describe("getPrimeFactors()", () => {
  it.each([
    { in: 0, out: [0] },
    { in: 1, out: [1] },
    { in: -1, out: [-1] },
    { in: 2, out: [2] },
    { in: -2, out: [-2] },
    { in: 3, out: [3] },
    { in: 10, out: [2, 5] },
    { in: 100, out: [2, 2, 5, 5] },
    { in: 101, out: [101] },
    { in: 102, out: [2, 3, 17] },
    { in: 1953124, out: [2, 2, 19, 31, 829] },
  ])("Should factorise $in into $out", (arg) => {
    expect(getPrimeFactors(arg.in)).toEqual(arg.out);
  });
});
