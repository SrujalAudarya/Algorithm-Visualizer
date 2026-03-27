export interface GraphNode {
  id: number;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

export interface GraphFrame {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visitedNodes: number[];
  visitedEdges: [number, number][];
  currentNode: number;
  mstEdges: [number, number][];
  message: string;
}

export type GraphAlgorithmKey = "bfs" | "dfs" | "kruskal" | "prim";

type FrameYielder = Generator<GraphFrame, void, unknown>;

function makeFrame(
  nodes: GraphNode[],
  edges: GraphEdge[],
  visitedNodes: number[],
  visitedEdges: [number, number][],
  currentNode: number,
  mstEdges: [number, number][],
  message: string
): GraphFrame {
  return {
    nodes: [...nodes],
    edges: [...edges],
    visitedNodes: [...visitedNodes],
    visitedEdges: visitedEdges.map(e => [...e] as [number, number]),
    currentNode,
    mstEdges: mstEdges.map(e => [...e] as [number, number]),
    message,
  };
}

function getAdjList(nodes: GraphNode[], edges: GraphEdge[]): Map<number, { to: number; weight: number }[]> {
  const adj = new Map<number, { to: number; weight: number }[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.from)?.push({ to: e.to, weight: e.weight });
    adj.get(e.to)?.push({ to: e.from, weight: e.weight });
  });
  return adj;
}

export function* graphBfs(nodes: GraphNode[], edges: GraphEdge[], startId: number): FrameYielder {
  const adj = getAdjList(nodes, edges);
  const visited = new Set<number>();
  const visitedNodes: number[] = [];
  const visitedEdges: [number, number][] = [];
  const queue: number[] = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedNodes.push(curr);
    yield makeFrame(nodes, edges, visitedNodes, visitedEdges, curr, [], `Visiting node ${curr}`);

    for (const { to } of adj.get(curr) || []) {
      if (!visited.has(to)) {
        visited.add(to);
        visitedEdges.push([curr, to]);
        queue.push(to);
        yield makeFrame(nodes, edges, visitedNodes, visitedEdges, curr, [], `Exploring edge ${curr} → ${to}`);
      }
    }
  }
  yield makeFrame(nodes, edges, visitedNodes, visitedEdges, -1, [], "BFS Complete!");
}

export function* graphDfs(nodes: GraphNode[], edges: GraphEdge[], startId: number): FrameYielder {
  const adj = getAdjList(nodes, edges);
  const visited = new Set<number>();
  const visitedNodes: number[] = [];
  const visitedEdges: [number, number][] = [];

  function* dfsHelper(curr: number, parent: number): FrameYielder {
    visited.add(curr);
    visitedNodes.push(curr);
    if (parent >= 0) visitedEdges.push([parent, curr]);
    yield makeFrame(nodes, edges, visitedNodes, visitedEdges, curr, [], `Visiting node ${curr}`);

    for (const { to } of adj.get(curr) || []) {
      if (!visited.has(to)) {
        yield* dfsHelper(to, curr);
      }
    }
  }

  yield* dfsHelper(startId, -1);
  yield makeFrame(nodes, edges, visitedNodes, visitedEdges, -1, [], "DFS Complete!");
}

export function* kruskal(nodes: GraphNode[], edges: GraphEdge[]): FrameYielder {
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = new Map<number, number>();
  const rank = new Map<number, number>();
  nodes.forEach(n => { parent.set(n.id, n.id); rank.set(n.id, 0); });

  function find(x: number): number {
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
    return parent.get(x)!;
  }
  function union(a: number, b: number): boolean {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (rank.get(ra)! < rank.get(rb)!) parent.set(ra, rb);
    else if (rank.get(ra)! > rank.get(rb)!) parent.set(rb, ra);
    else { parent.set(rb, ra); rank.set(ra, rank.get(ra)! + 1); }
    return true;
  }

  const mstEdges: [number, number][] = [];
  const visitedNodes: number[] = [];

  for (const edge of sortedEdges) {
    yield makeFrame(nodes, edges, visitedNodes, [], -1, mstEdges, `Checking edge ${edge.from} → ${edge.to} (weight ${edge.weight})`);
    if (union(edge.from, edge.to)) {
      mstEdges.push([edge.from, edge.to]);
      if (!visitedNodes.includes(edge.from)) visitedNodes.push(edge.from);
      if (!visitedNodes.includes(edge.to)) visitedNodes.push(edge.to);
      yield makeFrame(nodes, edges, visitedNodes, [], -1, mstEdges, `Added edge ${edge.from} → ${edge.to} to MST`);
    }
  }
  yield makeFrame(nodes, edges, visitedNodes, [], -1, mstEdges, "Kruskal's Complete!");
}

export function* prim(nodes: GraphNode[], edges: GraphEdge[]): FrameYielder {
  const adj = getAdjList(nodes, edges);
  const inMST = new Set<number>();
  const mstEdges: [number, number][] = [];
  const visitedNodes: number[] = [];
  const startId = nodes[0]?.id ?? 0;

  inMST.add(startId);
  visitedNodes.push(startId);
  yield makeFrame(nodes, edges, visitedNodes, [], startId, mstEdges, `Starting from node ${startId}`);

  while (inMST.size < nodes.length) {
    let minWeight = Infinity;
    let bestEdge: [number, number] | null = null;

    for (const nodeId of inMST) {
      for (const { to, weight } of adj.get(nodeId) || []) {
        if (!inMST.has(to) && weight < minWeight) {
          minWeight = weight;
          bestEdge = [nodeId, to];
        }
      }
    }

    if (!bestEdge) break;
    inMST.add(bestEdge[1]);
    visitedNodes.push(bestEdge[1]);
    mstEdges.push(bestEdge);
    yield makeFrame(nodes, edges, visitedNodes, [], bestEdge[1], mstEdges, `Added edge ${bestEdge[0]} → ${bestEdge[1]} (weight ${minWeight})`);
  }
  yield makeFrame(nodes, edges, visitedNodes, [], -1, mstEdges, "Prim's Complete!");
}

export function generateRandomGraph(nodeCount: number = 8): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const centerX = 300, centerY = 200, radius = 150;
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    nodes.push({
      id: i,
      x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
      y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
    });
  }

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  // Ensure connected: chain
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({ from: i, to: i + 1, weight: Math.floor(Math.random() * 9) + 1 });
    edgeSet.add(`${i}-${i + 1}`);
  }
  // Add random extra edges
  const extraCount = Math.floor(nodeCount * 0.6);
  for (let k = 0; k < extraCount; k++) {
    const a = Math.floor(Math.random() * nodeCount);
    let b = Math.floor(Math.random() * nodeCount);
    if (a === b) b = (b + 1) % nodeCount;
    const key1 = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (!edgeSet.has(key1)) {
      edgeSet.add(key1);
      edges.push({ from: Math.min(a, b), to: Math.max(a, b), weight: Math.floor(Math.random() * 9) + 1 });
    }
  }
  return { nodes, edges };
}

export const GRAPH_ALGORITHMS: Record<
  GraphAlgorithmKey,
  { name: string; complexity: string; timeComplexity: string; spaceComplexity: string; fn: (n: GraphNode[], e: GraphEdge[], s?: number) => FrameYielder }
> = {
  bfs: { name: "BFS Traversal", complexity: "O(V + E)", timeComplexity: "O(V + E)", spaceComplexity: "O(V)", fn: (n, e, s = 0) => graphBfs(n, e, s) },
  dfs: { name: "DFS Traversal", complexity: "O(V + E)", timeComplexity: "O(V + E)", spaceComplexity: "O(V)", fn: (n, e, s = 0) => graphDfs(n, e, s) },
  kruskal: { name: "Kruskal's MST", complexity: "O(E log E)", timeComplexity: "O(E log E)", spaceComplexity: "O(V + E)", fn: (n, e) => kruskal(n, e) },
  prim: { name: "Prim's MST", complexity: "O(E log V)", timeComplexity: "O(E log V)", spaceComplexity: "O(V)", fn: (n, e) => prim(n, e) },
};

export const GRAPH_DESCRIPTIONS: Record<GraphAlgorithmKey, string> = {
  bfs: "Explores all neighbors at the current depth before moving to the next level. Uses a queue data structure.",
  dfs: "Explores as far as possible along each branch before backtracking. Uses recursion or a stack.",
  kruskal: "Builds the Minimum Spanning Tree by sorting all edges and adding them if they don't form a cycle.",
  prim: "Grows the MST from a starting node by always adding the cheapest edge connecting to an unvisited node.",
};
