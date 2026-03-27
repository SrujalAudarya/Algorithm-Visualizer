export type CellType = "empty" | "wall" | "start" | "end" | "visited" | "path" | "exploring";

export interface GridCell {
  row: number;
  col: number;
  type: CellType;
  distance: number;
  heuristic: number;
  parent: GridCell | null;
}

export interface PathFrame {
  grid: CellType[][];
  exploring: [number, number][];
  visited: [number, number][];
  path: [number, number][];
}

export type PathAlgorithmKey = "bfs" | "dfs" | "dijkstra" | "astar";

type FrameYielder = Generator<PathFrame, void, unknown>;

const ROWS = 20;
const COLS = 40;

const directions = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

const isValid = (r: number, c: number, grid: CellType[][]) =>
  r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c] !== "wall";

const reconstructPath = (
  parent: Map<string, string>,
  end: [number, number]
): [number, number][] => {
  const path: [number, number][] = [];
  let key = `${end[0]},${end[1]}`;
  while (parent.has(key)) {
    const [r, c] = key.split(",").map(Number);
    path.unshift([r, c]);
    key = parent.get(key)!;
  }
  return path;
};

function makeFrame(
  grid: CellType[][],
  exploring: [number, number][],
  visited: [number, number][],
  path: [number, number][]
): PathFrame {
  return {
    grid: grid.map((row) => [...row]),
    exploring: [...exploring],
    visited: [...visited],
    path: [...path],
  };
}

export function* bfs(
  grid: CellType[][],
  start: [number, number],
  end: [number, number]
): FrameYielder {
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: [number, number][] = [start];
  visited.add(`${start[0]},${start[1]}`);
  const visitedCells: [number, number][] = [];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    visitedCells.push([r, c]);

    if (r === end[0] && c === end[1]) {
      const path = reconstructPath(parent, end);
      yield makeFrame(grid, [], visitedCells, path);
      return;
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (isValid(nr, nc, grid) && !visited.has(key)) {
        visited.add(key);
        parent.set(key, `${r},${c}`);
        queue.push([nr, nc]);
      }
    }

    yield makeFrame(grid, [[r, c]], visitedCells, []);
  }
}

export function* dfs(
  grid: CellType[][],
  start: [number, number],
  end: [number, number]
): FrameYielder {
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const stack: [number, number][] = [start];
  const visitedCells: [number, number][] = [];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    visitedCells.push([r, c]);

    if (r === end[0] && c === end[1]) {
      const path = reconstructPath(parent, end);
      yield makeFrame(grid, [], visitedCells, path);
      return;
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const nkey = `${nr},${nc}`;
      if (isValid(nr, nc, grid) && !visited.has(nkey)) {
        parent.set(nkey, key);
        stack.push([nr, nc]);
      }
    }

    yield makeFrame(grid, [[r, c]], visitedCells, []);
  }
}

export function* dijkstra(
  grid: CellType[][],
  start: [number, number],
  end: [number, number]
): FrameYielder {
  const dist = new Map<string, number>();
  const parent = new Map<string, string>();
  const visited = new Set<string>();
  const visitedCells: [number, number][] = [];

  const pq: { r: number; c: number; d: number }[] = [{ r: start[0], c: start[1], d: 0 }];
  dist.set(`${start[0]},${start[1]}`, 0);

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { r, c, d } = pq.shift()!;
    const key = `${r},${c}`;

    if (visited.has(key)) continue;
    visited.add(key);
    visitedCells.push([r, c]);

    if (r === end[0] && c === end[1]) {
      const path = reconstructPath(parent, end);
      yield makeFrame(grid, [], visitedCells, path);
      return;
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const nkey = `${nr},${nc}`;
      if (isValid(nr, nc, grid) && !visited.has(nkey)) {
        const nd = d + 1;
        if (!dist.has(nkey) || nd < dist.get(nkey)!) {
          dist.set(nkey, nd);
          parent.set(nkey, key);
          pq.push({ r: nr, c: nc, d: nd });
        }
      }
    }

    yield makeFrame(grid, [[r, c]], visitedCells, []);
  }
}

export function* astar(
  grid: CellType[][],
  start: [number, number],
  end: [number, number]
): FrameYielder {
  const heuristic = (r: number, c: number) =>
    Math.abs(r - end[0]) + Math.abs(c - end[1]);

  const gScore = new Map<string, number>();
  const parent = new Map<string, string>();
  const visited = new Set<string>();
  const visitedCells: [number, number][] = [];

  const pq: { r: number; c: number; f: number }[] = [
    { r: start[0], c: start[1], f: heuristic(start[0], start[1]) },
  ];
  gScore.set(`${start[0]},${start[1]}`, 0);

  while (pq.length > 0) {
    pq.sort((a, b) => a.f - b.f);
    const { r, c } = pq.shift()!;
    const key = `${r},${c}`;

    if (visited.has(key)) continue;
    visited.add(key);
    visitedCells.push([r, c]);

    if (r === end[0] && c === end[1]) {
      const path = reconstructPath(parent, end);
      yield makeFrame(grid, [], visitedCells, path);
      return;
    }

    const g = gScore.get(key)!;
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const nkey = `${nr},${nc}`;
      if (isValid(nr, nc, grid) && !visited.has(nkey)) {
        const ng = g + 1;
        if (!gScore.has(nkey) || ng < gScore.get(nkey)!) {
          gScore.set(nkey, ng);
          parent.set(nkey, key);
          pq.push({ r: nr, c: nc, f: ng + heuristic(nr, nc) });
        }
      }
    }

    yield makeFrame(grid, [[r, c]], visitedCells, []);
  }
}

export const PATHFINDING_ALGORITHMS: Record<
  PathAlgorithmKey,
  { name: string; complexity: string; timeComplexity: string; spaceComplexity: string; fn: (g: CellType[][], s: [number, number], e: [number, number]) => FrameYielder }
> = {
  bfs: { name: "Breadth-First Search", complexity: "O(V + E)", timeComplexity: "O(V + E)", spaceComplexity: "O(V)", fn: bfs },
  dfs: { name: "Depth-First Search", complexity: "O(V + E)", timeComplexity: "O(V + E)", spaceComplexity: "O(V)", fn: dfs },
  dijkstra: { name: "Dijkstra's Algorithm", complexity: "O((V+E) log V)", timeComplexity: "O((V+E) log V)", spaceComplexity: "O(V)", fn: dijkstra },
  astar: { name: "A* Search", complexity: "O(E log V)", timeComplexity: "O(E log V)", spaceComplexity: "O(V)", fn: astar },
};

export const PATHFINDING_DESCRIPTIONS: Record<PathAlgorithmKey, string> = {
  bfs: "Explores all neighbors at the current depth before moving deeper. Guarantees the shortest path in unweighted graphs.",
  dfs: "Explores as far as possible along each branch before backtracking. Does not guarantee the shortest path.",
  dijkstra: "Finds the shortest path by always expanding the node with the smallest known distance. Works with weighted graphs.",
  astar: "Uses a heuristic (Manhattan distance) to guide the search toward the goal, often finding the shortest path faster than Dijkstra.",
};

export const DEFAULT_ROWS = ROWS;
export const DEFAULT_COLS = COLS;
