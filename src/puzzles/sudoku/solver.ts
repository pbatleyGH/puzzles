import fs from "fs";
import path from "path";

const SIZE = 9;
const SQUARE_SIZE = SIZE / 3;

type Grid = Array<Array<number>>;
type ShadowGrid = Array<Array<Set<number>>>;

function parseInputs({
  file = "inputs.txt",
  count = 1,
}: { file?: string; count?: number } = {}) {
  const [_, sudokus] = fs
    .readFileSync(path.join(__dirname, file), "utf-8")
    .split("\n\n");

  const gridStrings = sudokus
    .split(/Grid \d+\n/)
    .filter(Boolean)
    .map((grid) =>
      grid
        .split("\n")
        .filter(Boolean)
        .map((row) => row.split("").map(Number)),
    );
  return gridStrings.slice(0, count);
}

function parsePuzzleStrings(file = "easy50.txt") {
  return fs
    .readFileSync(path.join(__dirname, "inputs", file), "utf-8")
    .split("\n")
    .map((row) => {
      const output: number[][] = [...new Array(9)].map(() => []);
      for (let i = 0; i < row.length; i++) {
        const floor9 = Math.floor(i / 9);
        output[floor9].push(Number(row[i] === "." ? "0" : row[i]));
      }
      return output;
    });
}

function print(grid: Grid, empty = ".") {
  for (let i = 0; i < grid.length; i++) {
    console.log(...grid[i].map((cell) => (cell === 0 ? empty : cell)));
  }
}

function printShadowGrid(grid: ShadowGrid) {
  grid.forEach((row) => {
    console.log(
      row.map((set) => [...set].join(" ").padStart(SIZE + 4)).join("|"),
    );
  });
}

function printPartialSolution(grid: ShadowGrid) {
  grid.forEach((row) => {
    console.log(row.map((set) => (set.size === 1 ? [...set] : ".")));
  });
}

function createEmptyShadowGrid(size = 9): ShadowGrid {
  return [...new Array(size)].map((r) =>
    [...new Array(size)].map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])),
  );
}

const squareCoordsDelta = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
];

function getSquare<T>(matrix: Array<Array<T>>, row: number, col: number) {
  const dr = Math.floor(row / SQUARE_SIZE) * SQUARE_SIZE;
  const dc = Math.floor(col / SQUARE_SIZE) * SQUARE_SIZE;
  return squareCoordsDelta.map(([r, c]) => {
    return matrix[dr + r][dc + c];
  });
}

function getExclusiveSquare<T>(
  matrix: Array<Array<T>>,
  row: number,
  col: number,
) {
  const dr = Math.floor(row / SQUARE_SIZE) * SQUARE_SIZE;
  const dc = Math.floor(col / SQUARE_SIZE) * SQUARE_SIZE;
  return squareCoordsDelta
    .filter(([r, c]) => {
      return r !== row % SQUARE_SIZE || c !== col % SQUARE_SIZE;
    })
    .map(([r, c]) => {
      return matrix[dr + r][dc + c];
    });
}

function getExclusiveRow<T>(matrix: Array<Array<T>>, row: number, col: number) {
  const arr: T[] = [];
  for (let i = 0; i < SIZE; i++) {
    if (i === col) {
      continue;
    }
    arr.push(matrix[row][i]);
  }
  return arr;
}

function getExclusiveCol<T>(matrix: Array<Array<T>>, row: number, col: number) {
  const arr: T[] = [];
  for (let i = 0; i < SIZE; i++) {
    if (i === row) {
      continue;
    }
    arr.push(matrix[i][col]);
  }
  return arr;
}

function getProgress(shadowGrid: ShadowGrid) {
  let sum = 0;
  for (let i = 0; i < shadowGrid.length; i++) {
    for (const set of shadowGrid[i]) {
      sum += set.size;
    }
  }
  return sum;
}

const fullSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

// what rules to apply?
// TODO REFACTOR - not very generic argument
function getRemainingPossibleNumbers(...sets: Array<Array<Set<number>>>) {
  const unionOfOtherNumbers = sets
    .flat()
    .reduce((acc, set) => (set.size === 1 ? acc.union(set) : acc), new Set());

  return fullSet.difference(unionOfOtherNumbers);
}

function unionOfSets(sets: Array<Set<number>>) {
  return sets.reduce((acc, set) => acc.union(set));
}

// this must be a row/column/square of cells forming a 9 item set
// for each cell, finds others with the same number of possibities
// if the union of all of these cells, has the same size as the count
// of cells, then all of the numbers within the set must be split between
// these cells
// therefore...
// these numbers can be removed from the remaining cells of the original 9

// UPDATE: this function needs work, number sets don't have to be the same size
// e.g. 27, 279, 279 would still be a valid triplet
function eliminateGroups(nineSet) {
  if (nineSet.length !== SIZE) {
    throw Error("BARG");
  }
  for (let i = 0; i < nineSet.length; i++) {
    const size = nineSet[i].size;
    if (size === 1) {
      continue;
    }

    const group = nineSet.filter((set) => set.size <= size);
    const union = unionOfSets(group);
    if (union.size === size && group.length >= size) {
      console.log({ nineSet, union, group });
      for (let j = 0; j < nineSet.length; j++) {
        const nsSize = nineSet[j].size;
        // skip over completed sets, or the sets from the union
        if (nsSize === 1 || nsSize === size) {
          continue;
        }
        nineSet[j] = nineSet[j].difference(union);
      }
    }
  }

  return nineSet;
}

function eliminateSingles(
  cell: Set<number>,
  otherEightCells: Array<Set<number>>,
) {
  const union = otherEightCells.reduce((c, a) => a.union(c), new Set([]));
  if (union.size === 8) {
    for (const value of [...union]) {
      cell.delete(value);
    }
  }
}

function eliminatePairs(nineCells: Array<Set<number>>) {
  for (let i = 0; i < nineCells.length; i++) {
    const current = nineCells[i];
    if (current.size === 2) {
      for (let j = 0; j < nineCells.length; j++) {
        if (j === i) {
          continue;
        }
        if (nineCells[j].size !== 2) {
          continue;
        }
        if (nineCells[j].union(current).size === 2) {
          for (let k = 0; k < nineCells.length; k++) {
            if (k !== i && k !== j) {
              [...current].forEach((number) => nineCells[k].delete(number));
            }
          }
        }
      }
    }
  }
}

// function eliminateSingles(nineCells: Array<Set<number>>) {
//   const counts: Record<number, number> = {};
//   for (const set of nineCells) {
//     if (set.size <= 1) {
//       continue;
//     }
//     for (const number of [...set]) {
//       if (!counts[number]) {
//         counts[number] = 0;
//       }
//       counts[number]++;
//     }
//   }
//   for (const [number, count] of Object.entries(counts)) {
//     if (count === 1) {
//       const integer = parseInt(number);
//       const index = nineCells.findIndex((set) => set.has(integer));
//       nineCells[index] = new Set([integer]);
//     }
//   }
// }

// TODO NEXT WE NEED THIS
// maybe for each number we need an options grid
// 2 . . . . . . . .
// . . . 2 . . . . .
// . . . 2 . . . . .
// . . . . . . . . .
// . . . . . 2 . . .
// . . . . . . . . .
// . . . . . . . . .
// . . . . . . . . .
// . 2 . . . . . . .

function simplePass(shadowGrid: ShadowGrid) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const set = shadowGrid[row][col];
      if (set.size === 1) {
        continue;
      }

      const squareSets = getExclusiveSquare(shadowGrid, row, col);
      const rowSets = getExclusiveRow(shadowGrid, row, col);
      const colSets = getExclusiveCol(shadowGrid, row, col);

      eliminateSingles(shadowGrid[row][col], squareSets);
      eliminateSingles(shadowGrid[row][col], rowSets);
      eliminateSingles(shadowGrid[row][col], colSets);

      if (set.size === 1) {
        continue;
      }

      shadowGrid[row][col] = getRemainingPossibleNumbers(
        squareSets,
        rowSets,
        colSets,
      );

      // pass by reference (hopefully...)
      squareSets.push(shadowGrid[row][col]);
      rowSets.push(shadowGrid[row][col]);
      colSets.push(shadowGrid[row][col]);

      eliminatePairs(squareSets);
      eliminatePairs(rowSets);
      eliminatePairs(colSets);
    }
  }
  return shadowGrid;
}

function createShadowGrid(grid: Grid): ShadowGrid {
  const shadowGrid = createEmptyShadowGrid(grid.length);

  // First pass to populate the shadow grid
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      // assumption that empty = "0"
      if (grid[row][col]) {
        shadowGrid[row][col] = new Set([grid[row][col]]);
      } else {
        const squareNeighbours = getSquare(grid, row, col);
        for (let search = 0; search < SIZE; search++) {
          const a = grid[row][search];
          const b = grid[search][col];
          const c = squareNeighbours[search];

          if (a) {
            shadowGrid[row][col].delete(a);
          }

          if (b) {
            shadowGrid[row][col].delete(b);
          }

          if (c) {
            shadowGrid[row][col].delete(c);
          }
        }
      }
    }
  }

  return shadowGrid;
}

function solveSudoku(grid: Grid) {
  const shadowGrid = createShadowGrid(grid);

  console.log(`init size ${getProgress(shadowGrid)}`);

  let prev = Infinity;
  let n = 0;

  while (true) {
    simplePass(shadowGrid);
    n++;
    const count = getProgress(shadowGrid);
    if (count === 81 || count === prev) {
      break;
    }
    prev = count;
  }

  console.log(`${n} iterations, final pass size ${getProgress(shadowGrid)}`);

  return shadowGrid.map((r) =>
    r.map((s) => (s.size === 1 ? [...s] : 0)).flat(),
  );
}

function main() {
  //   const grids = parseInputs({ count: 50 });
  const grids = parsePuzzleStrings();

  for (const grid of grids.slice()) {
    // print(grid);
    const solve = solveSudoku(grid);
    // print(solve);
  }
}

main();
