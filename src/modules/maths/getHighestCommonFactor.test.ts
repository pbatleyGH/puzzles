import {
  getHighestCommonFactor,
  getPrimeFactors,
} from "./getHighestCommonFactor";

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

describe("getHighestCommonFactor", () => {
  it.each([
    { in: [1, 1, 1], out: 1 },
    { in: [1, 2, 4], out: 1 },
    { in: [2, 4, 8], out: 2 },
    { in: [315, 420], out: 105 },
    { in: [315, 420, 230], out: 5 },
    { in: [315, 420, 64], out: 1 },
  ])("gets highest common factor $out from $in", (args) => {
    expect(getHighestCommonFactor(args.in)).toEqual(args.out);
  });
});
