import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BACKTRACKING_ALGORITHMS,
  BACKTRACKING_DESCRIPTIONS,
  BacktrackingAlgorithmKey,
  solveNQueens,
  solveSudoku,
} from "@/lib/backtrackingAlgorithms";
import { playTone, playCompleteSound } from "@/lib/sound";
import { Info } from "lucide-react";

const BacktrackingVisualizer = () => {
  const [algorithm, setAlgorithm] = useState<BacktrackingAlgorithmKey>("nqueens");
  const [speed, setSpeed] = useState(50);
  const [boardSize, setBoardSize] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const stopRef = useRef(false);
  const speedRef = useRef(speed);
  const soundRef = useRef(soundEnabled);

  speedRef.current = speed;
  soundRef.current = soundEnabled;

  useEffect(() => {
    return () => { stopRef.current = true; };
  }, []);

  // N-Queens state
  const [queens, setQueens] = useState<[number, number][]>([]);
  const [currentCell, setCurrentCell] = useState<[number, number]>([-1, -1]);
  const [conflictCells, setConflictCells] = useState<[number, number][]>([]);

  // Sudoku state
  const [sudokuBoard, setSudokuBoard] = useState<number[][]>([]);
  const [sudokuCurrent, setSudokuCurrent] = useState<[number, number]>([-1, -1]);
  const [sudokuFixed, setSudokuFixed] = useState<[number, number][]>([]);

  const getDelay = () => Math.max(10, 300 - speedRef.current * 3);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const reset = () => {
    stopRef.current = true;
    setQueens([]);
    setCurrentCell([-1, -1]);
    setConflictCells([]);
    setSudokuBoard([]);
    setSudokuCurrent([-1, -1]);
    setSudokuFixed([]);
    setMessage("");
    setIsRunning(false);
    setIsDone(false);
  };

  const runAlgorithm = async () => {
    if (isRunning || isDone) return;
    setIsRunning(true);
    stopRef.current = false;

    if (algorithm === "nqueens") {
      const gen = solveNQueens(boardSize);
      let frame;
      while (!(frame = gen.next()).done) {
        if (stopRef.current) break;
        const f = frame.value;
        setQueens(f.queens);
        setCurrentCell([f.currentRow, f.currentCol]);
        setConflictCells(f.conflictCells);
        setMessage(f.message);
        if (soundRef.current && f.currentRow >= 0) {
          playTone(200 + f.currentCol * 80, 0.04, 0.05);
        }
        if (f.solved && soundRef.current) playCompleteSound(100);
        await sleep(getDelay());
      }
    } else {
      const gen = solveSudoku();
      let frame;
      while (!(frame = gen.next()).done) {
        if (stopRef.current) break;
        const f = frame.value;
        setSudokuBoard(f.board);
        setSudokuCurrent(f.currentCell);
        setSudokuFixed(f.fixedCells);
        setMessage(f.message);
        if (soundRef.current && f.currentCell[0] >= 0) {
          const val = f.board[f.currentCell[0]]?.[f.currentCell[1]] || 0;
          playTone(200 + val * 60, 0.03, 0.04);
        }
        if (f.solved && soundRef.current) playCompleteSound(100);
        await sleep(getDelay());
      }
    }

    if (!stopRef.current) setIsDone(true);
    setIsRunning(false);
  };

  const isQueenAt = (r: number, c: number) => queens.some(([qr, qc]) => qr === r && qc === c);
  const isConflict = (r: number, c: number) => conflictCells.some(([cr, cc]) => cr === r && cc === c);
  const isFixed = (r: number, c: number) => sudokuFixed.some(([fr, fc]) => fr === r && fc === c);

  const renderNQueens = () => {
    const size = boardSize;
    const cellSize = Math.min(48, 400 / size);
    return (
      <div className="flex flex-col items-center gap-0">
        {Array.from({ length: size }, (_, r) => (
          <div key={r} className="flex gap-0">
            {Array.from({ length: size }, (_, c) => {
              const isDark = (r + c) % 2 === 1;
              const isCurrent = currentCell[0] === r && currentCell[1] === c;
              const hasQueen = isQueenAt(r, c);
              const hasConflict = isConflict(r, c);

              return (
                <div
                  key={c}
                  className={`flex items-center justify-center text-lg transition-colors duration-100 ${
                    isCurrent ? "bg-glow-warm/40 border border-glow-warm" :
                    hasConflict ? "bg-destructive/30 border border-destructive/50" :
                    isDark ? "bg-secondary" : "bg-muted"
                  }`}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {hasQueen && "♛"}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderSudoku = () => {
    if (sudokuBoard.length === 0) {
      return <p className="text-muted-foreground text-sm">Click Run to start the Sudoku solver</p>;
    }
    return (
      <div className="flex flex-col items-center">
        {sudokuBoard.map((row, r) => (
          <div key={r} className={`flex ${r % 3 === 0 && r > 0 ? "mt-1" : ""}`}>
            {row.map((val, c) => {
              const isCurrent = sudokuCurrent[0] === r && sudokuCurrent[1] === c;
              const fixed = isFixed(r, c);
              return (
                <div
                  key={c}
                  className={`flex items-center justify-center text-sm font-mono border border-border/50 transition-colors duration-75 ${
                    c % 3 === 0 && c > 0 ? "ml-1" : ""
                  } ${
                    isCurrent ? "bg-glow-warm/40 text-foreground font-bold" :
                    fixed ? "bg-secondary text-foreground" :
                    val > 0 ? "bg-primary/10 text-primary" :
                    "bg-muted/50 text-muted-foreground"
                  }`}
                  style={{ width: 40, height: 40 }}
                >
                  {val > 0 ? val : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
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
            {BACKTRACKING_ALGORITHMS[algorithm].name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {BACKTRACKING_DESCRIPTIONS[algorithm]}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Time: {BACKTRACKING_ALGORITHMS[algorithm].timeComplexity}
            </span>
            <span className="px-2 py-1 rounded-md bg-glow-accent/10 border border-glow-accent/20 text-glow-accent">
              Space: {BACKTRACKING_ALGORITHMS[algorithm].spaceComplexity}
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
              onChange={(e) => { setAlgorithm(e.target.value as BacktrackingAlgorithmKey); reset(); }}
              disabled={isRunning}
              className="block w-full sm:w-44 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border focus:border-primary focus:outline-none disabled:opacity-50"
            >
              {Object.entries(BACKTRACKING_ALGORITHMS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          {algorithm === "nqueens" && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground">Board: {boardSize}×{boardSize}</label>
              <input type="range" min={4} max={12} value={boardSize}
                onChange={(e) => { setBoardSize(Number(e.target.value)); reset(); }}
                disabled={isRunning}
                className="block w-full sm:w-28 accent-primary"
              />
            </div>
          )}

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
              {isRunning ? "Solving..." : "Run"}
            </button>
            <button onClick={reset}
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

      <div className="glass rounded-xl p-6 min-h-[420px] flex items-center justify-center">
        {algorithm === "nqueens" ? renderNQueens() : renderSudoku()}
      </div>
    </div>
  );
};

export default BacktrackingVisualizer;
