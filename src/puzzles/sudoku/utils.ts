import fs from "fs";
import path from "path";

export function parse(filename: string) {
  const contents = fs.readFileSync(
    path.join(__dirname, "inputs", filename),
    "utf-8",
  );
  return contents.split("\n");
}

// nomenclature:
// square - a unit cell of the grid
// box - 3x3 grid square
// row - 1x9 row
// col - 9x1 column
// possibles - normalized dictionary of possible value sets for each square
// units - normalized dictionary of sets that a given square belongs to
// peers - normalized dictionary of sets that a given square belongs to, excluding itself

const ROWS = "abcdefghi";
const COLS = "123456789";
const FULL_SET = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);

function getCol(r, c, inclusive = true) {
  return [...ROWS]
    .filter((row) => (inclusive ? true : row !== r))
    .map((row) => `${row}${c}`);
}

function getRow(r, c, inclusive = true) {
  return [...COLS]
    .filter((col) => (inclusive ? true : col !== c))
    .map((col) => `${r}${col}`);
}

function getBox(r, c, inclusive = true) {
  const rowIdx = ROWS.indexOf(r);
  const colIdx = COLS.indexOf(c);

  const rowBoxIdx = 3 * Math.floor(rowIdx / 3);
  const colBoxIdx = 3 * Math.floor(colIdx / 3);

  const substrRow = ROWS.slice(rowBoxIdx, rowBoxIdx + 3);
  const substrCol = COLS.slice(colBoxIdx, colBoxIdx + 3);

  const output: string[] = [];
  for (let row of substrRow) {
    for (let col of substrCol) {
      if (!inclusive && row === r && col === c) {
        continue;
      }
      output.push(row + col);
    }
  }
  return output;
}

function createUnitsAndPeers() {
  const units: Record<string, string[][]> = {};
  const peers: Record<string, string[][]> = {};
  const unitList: string[][] = [];

  for (let i = 0; i < ROWS.length; i++) {
    const row = ROWS[i];
    for (let j = 0; j < COLS.length; j++) {
      const col = COLS[j];
      units[row + col] = [getRow(row, col), getCol(row, col), getBox(row, col)];
      peers[row + col] = [
        getRow(row, col, false),
        getCol(row, col, false),
        getBox(row, col, false),
      ];
      if (i === j) {
        unitList.push(getRow(row, col), getCol(row, col));
      }
      if (i % 3 === 0 && j % 3 === 0) {
        unitList.push(getBox(row, col));
      }
    }
  }

  return { units, peers, unitList };
}

export const { units, peers, unitList } = createUnitsAndPeers();

export type Possibles = Record<string, Set<string>>;

export function puzzleStringToPossibles(
  string: string,
  debug = false,
): Possibles {
  const puzzleSize = string.length;
  if (puzzleSize !== 81) {
    throw new Error("Malformed puzzle input");
  }

  const possibles: Record<string, Set<string>> = {};

  for (let i = 0; i < puzzleSize; i++) {
    const row = ROWS[Math.floor(i / 9)];
    const col = COLS[i % 9];

    const int = parseInt(string[i]);

    possibles[row + col] = int > 0 ? new Set([string[i]]) : new Set(FULL_SET);
  }
  debug && printState(possibles);
  for (let [key, set] of Object.entries(possibles)) {
    if (set.size === 1) {
      eliminate(possibles, key, [...set]);
    }
  }

  return possibles;
}

/** warning: mutates sets in possibles */
export function eliminate(
  possibles: Possibles,
  rowColKey: string,
  values: string[],
) {
  const peerSquareGroups = peers[rowColKey];
  for (let group of peerSquareGroups) {
    for (let square of group) {
      if (possibles[square].size === 1) {
        continue;
      }
      for (let value of values) {
        possibles[square].delete(value);
        if (possibles[square].size === 1) {
          eliminate(possibles, square, [...possibles[square]]);
        }
      }
    }
  }

  // check sets for unique placement of the values being removed
  for (let unitGroup of units[rowColKey]) {
    for (let value of values) {
      const squaresIncludingValue = unitGroup.reduce<string[]>((acc, curr) => {
        if (possibles[curr].has(value)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      if (squaresIncludingValue.length === 1) {
        const square = squaresIncludingValue[0];
        if (possibles[square].size !== 1) {
          assign(possibles, square, value);
        }
      }
    }
  }
}

export function assign(possibles: Possibles, key: string, value: string) {
  const otherValues = [...possibles[key]].filter((v) => v !== value);
  for (const other of otherValues) {
    possibles[key].delete(other);
  }
  eliminate(possibles, key, [value]);
}

export function printPossibles(possibles: Possibles) {
  const matrix = [...new Array(9)].map(() => [...new Array(9)].fill(null));

  for (let [coord, set] of Object.entries(possibles)) {
    const [r, c] = coord.split("");
    const rIdx = ROWS.indexOf(r);
    const cIdx = COLS.indexOf(c);

    matrix[rIdx][cIdx] = [...set];
  }
  console.log("===== state =====");
  matrix.forEach((row) => {
    console.log(row.map((set) => [...set].join(" ").padStart(9 + 4)).join("|"));
  });
  console.log("=================\n");
}

export function printState(possibles: Possibles) {
  const matrix = [...new Array(9)].map(() => [...new Array(9)].fill(null));

  for (let [coord, set] of Object.entries(possibles)) {
    const [r, c] = coord.split("");
    const rIdx = ROWS.indexOf(r);
    const cIdx = COLS.indexOf(c);

    matrix[rIdx][cIdx] = set.size === 1 ? [...set] : ".";
  }
  console.log("===== state =====");
  matrix.forEach((r) => console.log(r.join(" ")));
  console.log("=================\n");
}
