export interface SearchFrame {
  array: number[];
  current: number;
  checked: number[];
  found: number;
  low?: number;
  high?: number;
  mid?: number;
}

export type SearchAlgorithmKey = "linear" | "binary" | "jump";

type FrameYielder = Generator<SearchFrame, void, unknown>;

function makeFrame(
  array: number[],
  current: number,
  checked: number[],
  found: number,
  extra?: { low?: number; high?: number; mid?: number }
): SearchFrame {
  return { array: [...array], current, checked: [...checked], found, ...extra };
}

export function* linearSearch(arr: number[], target: number): FrameYielder {
  const checked: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    yield makeFrame(arr, i, checked, -1);
    checked.push(i);
    if (arr[i] === target) {
      yield makeFrame(arr, i, checked, i);
      return;
    }
  }
  yield makeFrame(arr, -1, checked, -1);
}

export function* binarySearch(arr: number[], target: number): FrameYielder {
  const sorted = [...arr].sort((a, b) => a - b);
  const checked: number[] = [];
  let low = 0;
  let high = sorted.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    yield makeFrame(sorted, mid, checked, -1, { low, high, mid });
    checked.push(mid);

    if (sorted[mid] === target) {
      yield makeFrame(sorted, mid, checked, mid, { low, high, mid });
      return;
    } else if (sorted[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  yield makeFrame(sorted, -1, checked, -1, { low, high });
}

export function* jumpSearch(arr: number[], target: number): FrameYielder {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const step = Math.floor(Math.sqrt(n));
  const checked: number[] = [];
  let prev = 0;
  let curr = step;

  // Jump phase
  while (curr < n && sorted[Math.min(curr, n) - 1] < target) {
    yield makeFrame(sorted, curr - 1, checked, -1);
    checked.push(curr - 1);
    prev = curr;
    curr += step;
  }

  // Linear phase
  for (let i = prev; i < Math.min(curr, n); i++) {
    yield makeFrame(sorted, i, checked, -1);
    checked.push(i);
    if (sorted[i] === target) {
      yield makeFrame(sorted, i, checked, i);
      return;
    }
  }
  yield makeFrame(sorted, -1, checked, -1);
}

export const SEARCHING_ALGORITHMS: Record<
  SearchAlgorithmKey,
  { name: string; complexity: string; timeComplexity: string; spaceComplexity: string; fn: (arr: number[], target: number) => FrameYielder }
> = {
  linear: { name: "Linear Search", complexity: "O(n)", timeComplexity: "O(n)", spaceComplexity: "O(1)", fn: linearSearch },
  binary: { name: "Binary Search", complexity: "O(log n)", timeComplexity: "O(log n)", spaceComplexity: "O(1)", fn: binarySearch },
  jump: { name: "Jump Search", complexity: "O(√n)", timeComplexity: "O(√n)", spaceComplexity: "O(1)", fn: jumpSearch },
};

export const SEARCHING_DESCRIPTIONS: Record<SearchAlgorithmKey, string> = {
  linear: "Checks each element one by one from the start until the target is found or the array ends. Works on unsorted arrays.",
  binary: "Divides a sorted array in half repeatedly, narrowing down the search range. Much faster than linear search for large datasets.",
  jump: "Jumps ahead by fixed steps in a sorted array, then does a linear scan backward. A middle ground between linear and binary search.",
};
