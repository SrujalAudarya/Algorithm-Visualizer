import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  PATHFINDING_ALGORITHMS,
  PATHFINDING_DESCRIPTIONS,
  PathAlgorithmKey,
  CellType,
  DEFAULT_ROWS,
  DEFAULT_COLS,
} from "@/lib/pathfindingAlgorithms";
import { playTone, playCompleteSound } from "@/lib/sound";
import { Info } from "lucide-react";

const createEmptyGrid = (): CellType[][] =>
  Array.from({ length: DEFAULT_ROWS }, () =>
    Array.from({ length: DEFAULT_COLS }, () => "empty" as CellType)
  );

const DEFAULT_START: [number, number] = [10, 5];
const DEFAULT_END: [number, number] = [10, 34];

const PathfindingVisualizer = () => {
  const [algorithm, setAlgorithm] = useState<PathAlgorithmKey>("bfs");
  const [grid, setGrid] = useState<CellType[][]>(() => createEmptyGrid());
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [start] = useState<[number, number]>(DEFAULT_START);
  const [end] = useState<[number, number]>(DEFAULT_END);
  const stopRef = useRef(false);
  const speedRef = useRef(speed);
  const soundRef = useRef(soundEnabled);

  speedRef.current = speed;
  soundRef.current = soundEnabled;

  useEffect(() => {
    return () => { stopRef.current = true; };
  }, []);

  const resetGrid = useCallback(() => {
    stopRef.current = true;
    setGrid(createEmptyGrid());
    setIsRunning(false);
    setIsDone(false);
  }, []);

  const clearPath = useCallback(() => {
    stopRef.current = true;
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          cell === "visited" || cell === "path" || cell === "exploring" ? "empty" : cell
        )
      )
    );
    setIsRunning(false);
    setIsDone(false);
  }, []);

  const generateMaze = useCallback(() => {
    const newGrid = createEmptyGrid();
    for (let r = 0; r < DEFAULT_ROWS; r++) {
      for (let c = 0; c < DEFAULT_COLS; c++) {
        if (r === start[0] && c === start[1]) continue;
        if (r === end[0] && c === end[1]) continue;
        if (Math.random() < 0.3) {
          newGrid[r][c] = "wall";
        }
      }
    }
    setGrid(newGrid);
    setIsDone(false);
  }, [start, end]);

  const handleCellInteraction = (r: number, c: number) => {
    if (isRunning) return;
    if (r === start[0] && c === start[1]) return;
    if (r === end[0] && c === end[1]) return;
    setGrid((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = copy[r][c] === "wall" ? "empty" : "wall";
      return copy;
    });
    setIsDone(false);
  };

  const getDelay = () => Math.max(1, 100 - speedRef.current);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runAlgorithm = async () => {
    if (isRunning || isDone) return;
    setIsRunning(true);
    stopRef.current = false;

    const algo = PATHFINDING_ALGORITHMS[algorithm];
    const gen = algo.fn(grid, start, end);

    let frame;
    while (!(frame = gen.next()).done) {
      if (stopRef.current) break;
      const f = frame.value;

      setGrid((prev) => {
        const copy = prev.map((row) => [...row]);
        for (let r = 0; r < copy.length; r++) {
          for (let c = 0; c < copy[0].length; c++) {
            if (copy[r][c] === "visited" || copy[r][c] === "exploring" || copy[r][c] === "path") {
              copy[r][c] = "empty";
            }
          }
        }
        f.visited.forEach(([r, c]) => {
          if (!(r === start[0] && c === start[1]) && !(r === end[0] && c === end[1])) {
            copy[r][c] = "visited";
          }
        });
        f.exploring.forEach(([r, c]) => {
          if (!(r === start[0] && c === start[1]) && !(r === end[0] && c === end[1])) {
            copy[r][c] = "exploring";
          }
        });
        f.path.forEach(([r, c]) => {
          if (!(r === start[0] && c === start[1]) && !(r === end[0] && c === end[1])) {
            copy[r][c] = "path";
          }
        });
        return copy;
      });

      if (soundRef.current && f.exploring.length > 0) {
        const [r, c] = f.exploring[0];
        const freq = 200 + ((r * DEFAULT_COLS + c) / (DEFAULT_ROWS * DEFAULT_COLS)) * 600;
        playTone(freq, 0.03, 0.04);
      }

      await sleep(getDelay());
    }

    if (!stopRef.current) {
      setIsDone(true);
      if (soundRef.current) playCompleteSound(100);
    }
    setIsRunning(false);
  };

  const getCellColor = (r: number, c: number): string => {
    if (r === start[0] && c === start[1]) return "bg-glow-green";
    if (r === end[0] && c === end[1]) return "bg-destructive";
    const cell = grid[r][c];
    if (cell === "wall") return "bg-foreground/20";
    if (cell === "path") return "bg-glow-warm";
    if (cell === "exploring") return "bg-primary";
    if (cell === "visited") return "bg-glow-accent/40";
    return "bg-secondary/40";
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
            {PATHFINDING_ALGORITHMS[algorithm].name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {PATHFINDING_DESCRIPTIONS[algorithm]}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Time: {PATHFINDING_ALGORITHMS[algorithm].timeComplexity}
            </span>
            <span className="px-2 py-1 rounded-md bg-glow-accent/10 border border-glow-accent/20 text-glow-accent">
              Space: {PATHFINDING_ALGORITHMS[algorithm].spaceComplexity}
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
              onChange={(e) => {
                setAlgorithm(e.target.value as PathAlgorithmKey);
                clearPath();
              }}
              disabled={isRunning}
              className="block w-full sm:w-52 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border focus:border-primary focus:outline-none disabled:opacity-50"
            >
              {Object.entries(PATHFINDING_ALGORITHMS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">Speed: {speed}%</label>
            <input
              type="range" min={1} max={100} value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="block w-full sm:w-32 accent-primary"
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

          <div className="flex flex-wrap items-end gap-2 col-span-2 sm:col-span-1 sm:ml-auto">
            <button
              onClick={runAlgorithm}
              disabled={isRunning || isDone}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isRunning ? "Running..." : "Find Path"}
            </button>
            <button
              onClick={generateMaze}
              disabled={isRunning}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg bg-glow-accent/20 text-glow-accent font-medium text-sm border border-glow-accent/30 hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              Maze
            </button>
            <button
              onClick={resetGrid}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-80 transition-opacity border border-border"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-muted-foreground">
          <span className="hidden sm:inline">Click cells to draw walls</span>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-green" /> Start
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-destructive" /> End
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-accent/40" /> Visited
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-warm" /> Path
            </span>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-2 sm:p-4 overflow-x-auto">
        <div
          className="grid gap-[1px] mx-auto"
          style={{
            gridTemplateColumns: `repeat(${DEFAULT_COLS}, minmax(0, 1fr))`,
            maxWidth: "100%",
          }}
          onMouseLeave={() => setIsDrawing(false)}
        >
          {grid.map((row, r) =>
            row.map((_, c) => (
              <div
                key={`${r}-${c}`}
                className={`aspect-square rounded-[2px] cursor-pointer transition-colors duration-75 ${getCellColor(r, c)} hover:opacity-80`}
                onMouseDown={() => { setIsDrawing(true); handleCellInteraction(r, c); }}
                onMouseEnter={() => { if (isDrawing) handleCellInteraction(r, c); }}
                onMouseUp={() => setIsDrawing(false)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PathfindingVisualizer;
