import { assign, Possibles, units } from "../utils";

/**
 * Given a unit set, find any non-solved number that appears
 * only once in a non-solved square
 */
export function findSingles(possibles: Possibles, unitList: string[]) {
  const sets = unitList.map((key) => possibles[key]);
  const counts: Record<string, number[]> = {};

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    if (set.size === 1) {
      continue;
    }
    for (const member of [...set]) {
      if (!counts[member]) {
        counts[member] = [];
      }
      counts[member].push(i);
    }
  }

  for (const [number, positions] of Object.entries(counts)) {
    if (positions.length === 1) {
      assign(possibles, unitList[positions[0]], number);
    }
  }
}
