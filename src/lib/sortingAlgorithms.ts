// Sorting algorithm generators that yield animation frames

export interface SortFrame {
  array: number[];
  comparing: number[];   // indices being compared
  swapping: number[];     // indices being swapped
  sorted: number[];       // indices confirmed sorted
  active: number[];       // indices currently active/pivots
}

type FrameYielder = Generator<SortFrame, void, unknown>;

function makeFrame(
  array: number[],
  comparing: number[] = [],
  swapping: number[] = [],
  sorted: number[] = [],
  active: number[] = []
): SortFrame {
  return { array: [...array], comparing, swapping, sorted, active };
}

// Bubble Sort
export function* bubbleSort(arr: number[]): FrameYielder {
  const a = [...arr];
  const n = a.length;
  const sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield makeFrame(a, [j, j + 1], [], sortedIndices);
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield makeFrame(a, [], [j, j + 1], sortedIndices);
      }
    }
    sortedIndices.push(n - 1 - i);
  }
  sortedIndices.push(0);
  yield makeFrame(a, [], [], sortedIndices);
}

// Selection Sort
export function* selectionSort(arr: number[]): FrameYielder {
  const a = [...arr];
  const n = a.length;
  const sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    yield makeFrame(a, [], [], sortedIndices, [i]);

    for (let j = i + 1; j < n; j++) {
      yield makeFrame(a, [minIdx, j], [], sortedIndices, [i]);
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      yield makeFrame(a, [], [i, minIdx], sortedIndices);
    }
    sortedIndices.push(i);
  }
  sortedIndices.push(n - 1);
  yield makeFrame(a, [], [], sortedIndices);
}

// Insertion Sort
export function* insertionSort(arr: number[]): FrameYielder {
  const a = [...arr];
  const n = a.length;
  const sortedIndices: number[] = [0];

  for (let i = 1; i < n; i++) {
    let j = i;
    yield makeFrame(a, [], [], sortedIndices, [i]);
    while (j > 0 && a[j - 1] > a[j]) {
      yield makeFrame(a, [j - 1, j], [], sortedIndices);
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      yield makeFrame(a, [], [j - 1, j], sortedIndices);
      j--;
    }
    sortedIndices.push(i);
  }
  yield makeFrame(a, [], [], Array.from({ length: n }, (_, i) => i));
}

// Merge Sort
export function* mergeSort(arr: number[]): FrameYielder {
  const a = [...arr];
  const n = a.length;

  function* mergeSortHelper(start: number, end: number): FrameYielder {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    yield* mergeSortHelper(start, mid);
    yield* mergeSortHelper(mid, end);

    const left = a.slice(start, mid);
    const right = a.slice(mid, end);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
      yield makeFrame(a, [start + i, mid + j], [], [], Array.from({ length: end - start }, (_, x) => start + x));
      if (left[i] <= right[j]) {
        a[k] = left[i];
        i++;
      } else {
        a[k] = right[j];
        j++;
      }
      yield makeFrame(a, [], [k], []);
      k++;
    }

    while (i < left.length) {
      a[k] = left[i];
      yield makeFrame(a, [], [k], []);
      i++;
      k++;
    }

    while (j < right.length) {
      a[k] = right[j];
      yield makeFrame(a, [], [k], []);
      j++;
      k++;
    }
  }

  yield* mergeSortHelper(0, n);
  yield makeFrame(a, [], [], Array.from({ length: n }, (_, i) => i));
}

// Quick Sort
export function* quickSort(arr: number[]): FrameYielder {
  const a = [...arr];
  const n = a.length;
  const sortedIndices: number[] = [];

  function* quickSortHelper(low: number, high: number): FrameYielder {
    if (low >= high) {
      if (low >= 0 && low < n) sortedIndices.push(low);
      return;
    }

    const pivotIdx = high;
    const pivotVal = a[pivotIdx];
    yield makeFrame(a, [], [], sortedIndices, [pivotIdx]);

    let i = low;
    for (let j = low; j < high; j++) {
      yield makeFrame(a, [j, pivotIdx], [], sortedIndices, [pivotIdx]);
      if (a[j] < pivotVal) {
        [a[i], a[j]] = [a[j], a[i]];
        yield makeFrame(a, [], [i, j], sortedIndices, [pivotIdx]);
        i++;
      }
    }

    [a[i], a[high]] = [a[high], a[i]];
    yield makeFrame(a, [], [i, high], sortedIndices);
    sortedIndices.push(i);

    yield* quickSortHelper(low, i - 1);
    yield* quickSortHelper(i + 1, high);
  }

  yield* quickSortHelper(0, n - 1);
  yield makeFrame(a, [], [], Array.from({ length: n }, (_, i) => i));
}

// Heap Sort
export function* heapSort(arr: number[]): FrameYielder {
  const a = [...arr];
  const n = a.length;
  const sortedIndices: number[] = [];

  function* heapify(size: number, root: number): FrameYielder {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      yield makeFrame(a, [largest, left], [], sortedIndices);
      if (a[left] > a[largest]) largest = left;
    }
    if (right < size) {
      yield makeFrame(a, [largest, right], [], sortedIndices);
      if (a[right] > a[largest]) largest = right;
    }

    if (largest !== root) {
      [a[root], a[largest]] = [a[largest], a[root]];
      yield makeFrame(a, [], [root, largest], sortedIndices);
      yield* heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    yield makeFrame(a, [], [0, i], sortedIndices);
    sortedIndices.push(i);
    yield* heapify(i, 0);
  }
  sortedIndices.push(0);
  yield makeFrame(a, [], [], sortedIndices);
}

export const ALGORITHM_DESCRIPTIONS: Record<string, string> = {
  bubble: "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
  selection: "Selection Sort divides the array into a sorted and unsorted region. It repeatedly finds the minimum element from the unsorted region and moves it to the end of the sorted region.",
  insertion: "Insertion Sort builds the final sorted array one item at a time. It picks each element and inserts it into its correct position among the previously sorted elements.",
  merge: "Merge Sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the two sorted halves back together.",
  quick: "Quick Sort picks a pivot element and partitions the array so elements smaller than the pivot go left and larger go right, then recursively sorts each partition.",
  heap: "Heap Sort converts the array into a max heap data structure, then repeatedly extracts the maximum element and rebuilds the heap until the array is sorted.",
};

export const SORTING_ALGORITHMS = {
  bubble: { name: "Bubble Sort", fn: bubbleSort, complexity: "O(n²)", timeComplexity: "O(n²)", spaceComplexity: "O(1)" },
  selection: { name: "Selection Sort", fn: selectionSort, complexity: "O(n²)", timeComplexity: "O(n²)", spaceComplexity: "O(1)" },
  insertion: { name: "Insertion Sort", fn: insertionSort, complexity: "O(n²)", timeComplexity: "O(n²)", spaceComplexity: "O(1)" },
  merge: { name: "Merge Sort", fn: mergeSort, complexity: "O(n log n)", timeComplexity: "O(n log n)", spaceComplexity: "O(n)" },
  quick: { name: "Quick Sort", fn: quickSort, complexity: "O(n log n)", timeComplexity: "O(n log n) avg", spaceComplexity: "O(log n)" },
  heap: { name: "Heap Sort", fn: heapSort, complexity: "O(n log n)", timeComplexity: "O(n log n)", spaceComplexity: "O(1)" },
} as const;

export type SortAlgorithmKey = keyof typeof SORTING_ALGORITHMS;
