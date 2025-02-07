import { findSingles } from "./helpers/findSingles";
import {
  parse,
  printPossibles,
  printState,
  puzzleStringToPossibles,
  unitList,
  units,
} from "./utils";

/**
 * Solution
 *
 * State:
 *  - possibility sets
 *
 * Helpers:
 *  - get sets for cell
 *  - get peers for cell
 *
 * Process:
 *  - for each cell with >= 2 possibilities remaining iterate through the checks:
 *
 *
 *
 *  - assuming the JS puzzle is open ended, we are going to need a search algorithm to find
 * all possible solutions
 *  - select a cell with the smallest outstanding (i.e. size >= 2) possible values set
 */
function main() {
  const puzzleInputs = parse("easy50.txt");

  for (const puzzleString of puzzleInputs.slice()) {
    const possibles = puzzleStringToPossibles(puzzleString, false);
    let i = 0;
    while (true) {
      if (Object.values(possibles).every((s) => s.size === 1)) {
        break;
      }
      if (i++ > 10) {
        printPossibles(possibles);
        printState(possibles);
        throw new Error("Can\t solve");
      }
      //   const next = Object.entries(possibles).reduce(
      //     (acc, [key, value]) => {
      //       const size = value.size;
      //       if (size === 1) {
      //         return acc;
      //       }
      //       if (size < acc.min) {
      //         return { square: key, min: size };
      //       }
      //       return acc;
      //     },
      //     { square: "null", min: Infinity },
      //   ).square;
      //   console.log(next, possibles[next]);
      for (const unit of unitList) {
        findSingles(possibles, unit);
      }
    }
    printState(possibles);
  }
}

main();
