export interface TreeNode {
  id: number;
  value: number;
  x: number;
  y: number;
  left: number | null;
  right: number | null;
}

export interface TreeFrame {
  nodes: TreeNode[];
  visitedIds: number[];
  currentId: number;
  message: string;
}

export type TreeAlgorithmKey = "inorder" | "preorder" | "postorder" | "levelorder";

type FrameYielder = Generator<TreeFrame, void, unknown>;

function makeFrame(nodes: TreeNode[], visitedIds: number[], currentId: number, message: string): TreeFrame {
  return { nodes: [...nodes], visitedIds: [...visitedIds], currentId, message };
}

export function* inorderTraversal(nodes: TreeNode[], rootId: number): FrameYielder {
  const visited: number[] = [];
  const nodeMap = new Map<number, TreeNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  function* helper(id: number | null): FrameYielder {
    if (id === null) return;
    const node = nodeMap.get(id);
    if (!node) return;
    yield* helper(node.left);
    visited.push(id);
    yield makeFrame(nodes, visited, id, `Visit ${node.value} (inorder: left → root → right)`);
    yield* helper(node.right);
  }
  yield* helper(rootId);
  yield makeFrame(nodes, visited, -1, "Inorder Traversal Complete!");
}

export function* preorderTraversal(nodes: TreeNode[], rootId: number): FrameYielder {
  const visited: number[] = [];
  const nodeMap = new Map<number, TreeNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  function* helper(id: number | null): FrameYielder {
    if (id === null) return;
    const node = nodeMap.get(id);
    if (!node) return;
    visited.push(id);
    yield makeFrame(nodes, visited, id, `Visit ${node.value} (preorder: root → left → right)`);
    yield* helper(node.left);
    yield* helper(node.right);
  }
  yield* helper(rootId);
  yield makeFrame(nodes, visited, -1, "Preorder Traversal Complete!");
}

export function* postorderTraversal(nodes: TreeNode[], rootId: number): FrameYielder {
  const visited: number[] = [];
  const nodeMap = new Map<number, TreeNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  function* helper(id: number | null): FrameYielder {
    if (id === null) return;
    const node = nodeMap.get(id);
    if (!node) return;
    yield* helper(node.left);
    yield* helper(node.right);
    visited.push(id);
    yield makeFrame(nodes, visited, id, `Visit ${node.value} (postorder: left → right → root)`);
  }
  yield* helper(rootId);
  yield makeFrame(nodes, visited, -1, "Postorder Traversal Complete!");
}

export function* levelorderTraversal(nodes: TreeNode[], rootId: number): FrameYielder {
  const visited: number[] = [];
  const nodeMap = new Map<number, TreeNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const queue: number[] = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id);
    if (!node) continue;
    visited.push(id);
    yield makeFrame(nodes, visited, id, `Visit ${node.value} (level-order: breadth-first)`);
    if (node.left !== null) queue.push(node.left);
    if (node.right !== null) queue.push(node.right);
  }
  yield makeFrame(nodes, visited, -1, "Level-order Traversal Complete!");
}

export function generateBinaryTree(depth: number = 4): { nodes: TreeNode[]; rootId: number } {
  const nodes: TreeNode[] = [];
  let nextId = 0;
  const width = 600;
  const startY = 40;
  const levelHeight = 70;

  function buildNode(level: number, xMin: number, xMax: number): number | null {
    if (level > depth) return null;
    // Random pruning for variety (skip ~20% at deeper levels)
    if (level > 2 && Math.random() < 0.15) return null;

    const id = nextId++;
    const x = (xMin + xMax) / 2;
    const y = startY + level * levelHeight;
    const value = Math.floor(Math.random() * 99) + 1;

    nodes.push({ id, value, x, y, left: null, right: null });
    const nodeIdx = nodes.length - 1;

    nodes[nodeIdx].left = buildNode(level + 1, xMin, x);
    nodes[nodeIdx].right = buildNode(level + 1, x, xMax);

    return id;
  }

  const rootId = buildNode(0, 0, width)!;
  return { nodes, rootId };
}

export const TREE_ALGORITHMS: Record<
  TreeAlgorithmKey,
  { name: string; complexity: string; timeComplexity: string; spaceComplexity: string; fn: (nodes: TreeNode[], rootId: number) => FrameYielder }
> = {
  inorder: { name: "Inorder Traversal", complexity: "O(n)", timeComplexity: "O(n)", spaceComplexity: "O(h)", fn: inorderTraversal },
  preorder: { name: "Preorder Traversal", complexity: "O(n)", timeComplexity: "O(n)", spaceComplexity: "O(h)", fn: preorderTraversal },
  postorder: { name: "Postorder Traversal", complexity: "O(n)", timeComplexity: "O(n)", spaceComplexity: "O(h)", fn: postorderTraversal },
  levelorder: { name: "Level-order Traversal", complexity: "O(n)", timeComplexity: "O(n)", spaceComplexity: "O(w)", fn: levelorderTraversal },
};

export const TREE_DESCRIPTIONS: Record<TreeAlgorithmKey, string> = {
  inorder: "Visits left subtree first, then the root, then the right subtree. Produces sorted output for BSTs.",
  preorder: "Visits the root first, then the left subtree, then the right subtree. Useful for tree copying.",
  postorder: "Visits the left subtree, then right subtree, then the root. Used for tree deletion.",
  levelorder: "Visits nodes level by level from top to bottom using a queue. Also known as BFS on trees.",
};
