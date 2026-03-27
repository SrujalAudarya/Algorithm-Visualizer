import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  GRAPH_ALGORITHMS,
  GRAPH_DESCRIPTIONS,
  GraphAlgorithmKey,
  GraphNode,
  GraphEdge,
  generateRandomGraph,
} from "@/lib/graphAlgorithms";
import { playTone, playCompleteSound } from "@/lib/sound";
import { Info } from "lucide-react";

const GraphVisualizer = () => {
  const [algorithm, setAlgorithm] = useState<GraphAlgorithmKey>("bfs");
  const [nodeCount, setNodeCount] = useState(8);
  const [speed, setSpeed] = useState(50);
  const [{ nodes, edges }, setGraph] = useState(() => generateRandomGraph(8));
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<[number, number][]>([]);
  const [mstEdges, setMstEdges] = useState<[number, number][]>([]);
  const [currentNode, setCurrentNode] = useState(-1);
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

  const resetGraph = useCallback(() => {
    stopRef.current = true;
    setGraph(generateRandomGraph(nodeCount));
    setVisitedNodes([]);
    setVisitedEdges([]);
    setMstEdges([]);
    setCurrentNode(-1);
    setMessage("");
    setIsRunning(false);
    setIsDone(false);
  }, [nodeCount]);

  const getDelay = () => Math.max(100, 800 - speedRef.current * 7);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runAlgorithm = async () => {
    if (isRunning || isDone) return;
    setIsRunning(true);
    stopRef.current = false;
    setVisitedNodes([]);
    setVisitedEdges([]);
    setMstEdges([]);
    setCurrentNode(-1);

    const algo = GRAPH_ALGORITHMS[algorithm];
    const gen = algo.fn(nodes, edges, 0);

    let frame;
    while (!(frame = gen.next()).done) {
      if (stopRef.current) break;
      const f = frame.value;
      setVisitedNodes(f.visitedNodes);
      setVisitedEdges(f.visitedEdges);
      setMstEdges(f.mstEdges);
      setCurrentNode(f.currentNode);
      setMessage(f.message);
      if (soundRef.current && f.currentNode >= 0) {
        playTone(300 + f.currentNode * 60, 0.08, 0.06);
      }
      await sleep(getDelay());
    }

    if (!stopRef.current) {
      setIsDone(true);
      if (soundRef.current) playCompleteSound(100);
    }
    setIsRunning(false);
  };

  const isEdgeVisited = (from: number, to: number) =>
    visitedEdges.some(([a, b]) => (a === from && b === to) || (a === to && b === from));
  const isEdgeMST = (from: number, to: number) =>
    mstEdges.some(([a, b]) => (a === from && b === to) || (a === to && b === from));

  const getNodeColor = (id: number) => {
    if (currentNode === id) return "fill-[hsl(35,90%,55%)]";
    if (visitedNodes.includes(id)) return "fill-[hsl(150,70%,45%)]";
    return "fill-[hsl(175,80%,50%)]";
  };

  const getEdgeColor = (from: number, to: number) => {
    if (isEdgeMST(from, to)) return "stroke-[hsl(150,70%,45%)]";
    if (isEdgeVisited(from, to)) return "stroke-[hsl(260,70%,60%)]";
    return "stroke-[hsl(220,15%,25%)]";
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
            {GRAPH_ALGORITHMS[algorithm].name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {GRAPH_DESCRIPTIONS[algorithm]}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Time: {GRAPH_ALGORITHMS[algorithm].timeComplexity}
            </span>
            <span className="px-2 py-1 rounded-md bg-glow-accent/10 border border-glow-accent/20 text-glow-accent">
              Space: {GRAPH_ALGORITHMS[algorithm].spaceComplexity}
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
              onChange={(e) => { setAlgorithm(e.target.value as GraphAlgorithmKey); resetGraph(); }}
              disabled={isRunning}
              className="block w-full sm:w-44 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border focus:border-primary focus:outline-none disabled:opacity-50"
            >
              {Object.entries(GRAPH_ALGORITHMS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">Nodes: {nodeCount}</label>
            <input type="range" min={5} max={12} value={nodeCount}
              onChange={(e) => {
                const n = Number(e.target.value);
                setNodeCount(n);
                setGraph(generateRandomGraph(n));
                setVisitedNodes([]); setVisitedEdges([]); setMstEdges([]);
                setCurrentNode(-1); setMessage(""); setIsDone(false);
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
              {isRunning ? "Running..." : "Run"}
            </button>
            <button onClick={resetGraph}
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
        <svg viewBox="0 0 600 420" className="w-full max-w-[600px] h-auto">
          {edges.map((edge, i) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  className={`${getEdgeColor(edge.from, edge.to)} transition-colors duration-200`}
                  strokeWidth={isEdgeMST(edge.from, edge.to) ? 3 : 2}
                  opacity={isEdgeMST(edge.from, edge.to) || isEdgeVisited(edge.from, edge.to) ? 1 : 0.4}
                />
                <text x={midX} y={midY - 6} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">
                  {edge.weight}
                </text>
              </g>
            );
          })}
          {nodes.map((node) => (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x} cy={node.y} r={18}
                className={`${getNodeColor(node.id)} transition-colors duration-200`}
                opacity={visitedNodes.includes(node.id) || currentNode === node.id ? 1 : 0.5}
                stroke={currentNode === node.id ? "hsl(35,90%,55%)" : "none"}
                strokeWidth={currentNode === node.id ? 3 : 0}
              />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-background text-xs font-bold">
                {node.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground px-1">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-glow-warm" /> Current</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-glow-green" /> Visited</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-glow-accent" /> Traversed Edge</span>
        {(algorithm === "kruskal" || algorithm === "prim") && (
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-glow-green" /> MST Edge</span>
        )}
      </div>
    </div>
  );
};

export default GraphVisualizer;
