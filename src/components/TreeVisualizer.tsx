import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  TREE_ALGORITHMS,
  TREE_DESCRIPTIONS,
  TreeAlgorithmKey,
  TreeNode,
  generateBinaryTree,
} from "@/lib/treeAlgorithms";
import { playTone, playCompleteSound } from "@/lib/sound";
import { Info } from "lucide-react";

const TreeVisualizer = () => {
  const [algorithm, setAlgorithm] = useState<TreeAlgorithmKey>("inorder");
  const [depth, setDepth] = useState(4);
  const [speed, setSpeed] = useState(50);
  const [{ nodes, rootId }, setTree] = useState(() => generateBinaryTree(4));
  const [visitedIds, setVisitedIds] = useState<number[]>([]);
  const [currentId, setCurrentId] = useState(-1);
  const [message, setMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const stopRef = useRef(false);
  const speedRef = useRef(speed);
  const soundRef = useRef(soundEnabled);

  speedRef.current = speed;
  soundRef.current = soundEnabled;

  useEffect(() => {
    return () => { stopRef.current = true; };
  }, []);

  const resetTree = useCallback(() => {
    stopRef.current = true;
    setTree(generateBinaryTree(depth));
    setVisitedIds([]);
    setCurrentId(-1);
    setMessage("");
    setIsRunning(false);
    setIsDone(false);
  }, [depth]);

  const getDelay = () => Math.max(100, 800 - speedRef.current * 7);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runAlgorithm = async () => {
    if (isRunning || isDone) return;
    setIsRunning(true);
    stopRef.current = false;
    setVisitedIds([]);
    setCurrentId(-1);

    const algo = TREE_ALGORITHMS[algorithm];
    const gen = algo.fn(nodes, rootId);

    let frame;
    while (!(frame = gen.next()).done) {
      if (stopRef.current) break;
      const f = frame.value;
      setVisitedIds(f.visitedIds);
      setCurrentId(f.currentId);
      setMessage(f.message);
      if (soundRef.current && f.currentId >= 0) {
        const node = nodes.find(n => n.id === f.currentId);
        if (node) playTone(200 + node.value * 5, 0.1, 0.06);
      }
      await sleep(getDelay());
    }

    if (!stopRef.current) {
      setIsDone(true);
      if (soundRef.current) playCompleteSound(100);
    }
    setIsRunning(false);
  };

  const nodeMap = new Map<number, TreeNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const getNodeFill = (id: number) => {
    if (currentId === id) return "fill-[hsl(35,90%,55%)]";
    if (visitedIds.includes(id)) return "fill-[hsl(150,70%,45%)]";
    return "fill-[hsl(175,80%,50%)]";
  };

  const renderEdges = () => {
    const lines: JSX.Element[] = [];
    nodes.forEach(node => {
      if (node.left !== null) {
        const child = nodeMap.get(node.left);
        if (child) lines.push(
          <line key={`e-${node.id}-${child.id}`}
            x1={node.x} y1={node.y} x2={child.x} y2={child.y}
            className="stroke-border" strokeWidth={2} opacity={0.5}
          />
        );
      }
      if (node.right !== null) {
        const child = nodeMap.get(node.right);
        if (child) lines.push(
          <line key={`e-${node.id}-${child.id}`}
            x1={node.x} y1={node.y} x2={child.x} y2={child.y}
            className="stroke-border" strokeWidth={2} opacity={0.5}
          />
        );
      }
    });
    return lines;
  };

  return (
    <div className="space-y-6">
      <motion.div
        key={algorithm}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-xl p-4 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {TREE_ALGORITHMS[algorithm].name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {TREE_DESCRIPTIONS[algorithm]}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Time: {TREE_ALGORITHMS[algorithm].timeComplexity}
            </span>
            <span className="px-2 py-1 rounded-md bg-glow-accent/10 border border-glow-accent/20 text-glow-accent">
              Space: {TREE_ALGORITHMS[algorithm].spaceComplexity}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="glass rounded-xl p-3 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 sm:gap-4">
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <label className="text-xs font-mono text-muted-foreground">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => { setAlgorithm(e.target.value as TreeAlgorithmKey); resetTree(); }}
              disabled={isRunning}
              className="block w-full sm:w-48 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border focus:border-primary focus:outline-none disabled:opacity-50"
            >
              {Object.entries(TREE_ALGORITHMS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">Depth: {depth}</label>
            <input type="range" min={2} max={5} value={depth}
              onChange={(e) => {
                const d = Number(e.target.value);
                setDepth(d);
                setTree(generateBinaryTree(d));
                setVisitedIds([]); setCurrentId(-1); setMessage(""); setIsDone(false);
              }}
              disabled={isRunning}
              className="block w-full sm:w-28 accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">Speed: {speed}%</label>
            <input type="range" min={1} max={100} value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="block w-full sm:w-28 accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">Sound</label>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                soundEnabled
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {soundEnabled ? "🔊 On" : "🔇 Off"}
            </button>
          </div>

          <div className="flex items-end gap-2 col-span-2 sm:col-span-1 sm:ml-auto">
            <button onClick={runAlgorithm} disabled={isRunning || isDone}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isRunning ? "Traversing..." : "Traverse"}
            </button>
            <button onClick={resetTree}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-80 transition-opacity border border-border"
            >
              Reset
            </button>
          </div>
        </div>

        {message && (
          <div className="text-xs font-mono text-muted-foreground">
            Status: <span className="text-foreground">{message}</span>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-4 min-h-[420px] flex items-center justify-center">
        <svg viewBox="0 0 600 380" className="w-full max-w-[600px] h-auto">
          {renderEdges()}
          {nodes.map((node) => (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x} cy={node.y} r={18}
                className={`${getNodeFill(node.id)} transition-colors duration-200`}
                opacity={visitedIds.includes(node.id) || currentId === node.id ? 1 : 0.4}
                stroke={currentId === node.id ? "hsl(35,90%,55%)" : "none"}
                strokeWidth={currentId === node.id ? 3 : 0}
              />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-background text-xs font-bold">
                {node.value}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground px-1">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-glow-warm" /> Current</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-glow-green" /> Visited</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Unvisited</span>
      </div>

      {visitedIds.length > 0 && (
        <div className="glass rounded-xl p-4">
          <span className="text-xs font-mono text-muted-foreground">Traversal Order: </span>
          <span className="text-sm font-mono text-foreground">
            {visitedIds.map(id => {
              const n = nodeMap.get(id);
              return n ? n.value : id;
            }).join(" → ")}
          </span>
        </div>
      )}
    </div>
  );
};

export default TreeVisualizer;
