import { mock, test, expect } from "bun:test";
import { findSingles } from "./findSingles";

const mockAssign = mock();
mock.module("../utils", () => {
  return {
    assign: mockAssign,
  };
});

const possibles = {
  a1: new Set(["4"]),
  a2: new Set(["1", "5", "8", "9"]),
  a3: new Set(["2"]),
  a4: new Set(["7"]),
  a5: new Set(["3", "9"]),
  a6: new Set(["6"]),
  a7: new Set(["1", "5", "9"]),
  a8: new Set(["1", "3", "5", "9"]),
  a9: new Set(["1", "5"]),
};

const unit = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"];

test("should find a unique value", () => {
  findSingles(possibles, unit);

  expect(mockAssign).toHaveBeenCalledWith(possibles, "a2", "8");
});
