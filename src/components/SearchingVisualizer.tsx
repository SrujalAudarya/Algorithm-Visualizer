import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  SEARCHING_ALGORITHMS,
  SEARCHING_DESCRIPTIONS,
  SearchAlgorithmKey,
} from "@/lib/searchingAlgorithms";
import { playTone, playCompleteSound, valueToFrequency } from "@/lib/sound";
import { Info } from "lucide-react";

const generateArray = (size: number): number[] =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);

const SearchingVisualizer = () => {
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<SearchAlgorithmKey>("linear");
  const [array, setArray] = useState<number[]>(() => generateArray(30));
  const [target, setTarget] = useState<number>(() => 0);
  const [current, setCurrent] = useState(-1);
  const [checked, setChecked] = useState<number[]>([]);
  const [found, setFound] = useState(-1);
  const [low, setLow] = useState<number | undefined>();
  const [high, setHigh] = useState<number | undefined>();
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

  const resetArray = useCallback(() => {
    stopRef.current = true;
    const newArr = generateArray(arraySize);
    setArray(newArr);
    setCurrent(-1);
    setChecked([]);
    setFound(-1);
    setLow(undefined);
    setHigh(undefined);
    setIsRunning(false);
    setIsDone(false);
  }, [arraySize]);

  const pickRandomTarget = useCallback(() => {
    const src = algorithm === "linear" ? array : [...array].sort((a, b) => a - b);
    const idx = Math.floor(Math.random() * src.length);
    setTarget(src[idx]);
  }, [array, algorithm]);

  const getDelay = () => Math.max(20, 500 - speedRef.current * 5);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runSearch = async () => {
    if (isRunning || isDone) return;
    setIsRunning(true);
    stopRef.current = false;
    setCurrent(-1);
    setChecked([]);
    setFound(-1);
    setLow(undefined);
    setHigh(undefined);

    const algo = SEARCHING_ALGORITHMS[algorithm];
    const gen = algo.fn(array, target);
    const maxVal = Math.max(...array);

    let frame;
    while (!(frame = gen.next()).done) {
      if (stopRef.current) break;
      const f = frame.value;
      setArray(f.array);
      setCurrent(f.current);
      setChecked(f.checked);
      setFound(f.found);
      setLow(f.low);
      setHigh(f.high);

      if (soundRef.current && f.current >= 0) {
        playTone(valueToFrequency(f.array[f.current], maxVal), 0.05, 0.06);
      }

      await sleep(getDelay());
    }

    if (!stopRef.current) {
      setIsDone(true);
      if (soundRef.current) playCompleteSound(100);
    }
    setIsRunning(false);
  };

  const getBarColor = (idx: number): string => {
    if (found === idx) return "bg-glow-green";
    if (current === idx) return "bg-glow-warm";
    if (checked.includes(idx)) return "bg-glow-accent/50";
    if (low !== undefined && high !== undefined && idx >= low && idx <= high) return "bg-primary/40";
    return "bg-primary";
  };

  const getBarShadow = (idx: number): string => {
    if (found === idx) return "shadow-[0_0_12px_hsl(150_70%_45%/0.6)]";
    if (current === idx) return "shadow-[0_0_8px_hsl(35_90%_55%/0.5)]";
    return "";
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
            {SEARCHING_ALGORITHMS[algorithm].name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {SEARCHING_DESCRIPTIONS[algorithm]}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Time: {SEARCHING_ALGORITHMS[algorithm].timeComplexity}
            </span>
            <span className="px-2 py-1 rounded-md bg-glow-accent/10 border border-glow-accent/20 text-glow-accent">
              Space: {SEARCHING_ALGORITHMS[algorithm].spaceComplexity}
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
              onChange={(e) => { setAlgorithm(e.target.value as SearchAlgorithmKey); resetArray(); }}
              disabled={isRunning}
              className="block w-full sm:w-44 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border focus:border-primary focus:outline-none disabled:opacity-50"
            >
              {Object.entries(SEARCHING_ALGORITHMS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">Size: {arraySize}</label>
            <input type="range" min={10} max={60} value={arraySize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setArraySize(newSize);
                const newArr = generateArray(newSize);
                setArray(newArr);
                setCurrent(-1); setChecked([]); setFound(-1);
                setLow(undefined); setHigh(undefined); setIsDone(false);
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
            <label className="text-xs font-mono text-muted-foreground">Target</label>
            <div className="flex gap-2">
              <input
                type="number" value={target} min={1} max={99}
                onChange={(e) => setTarget(Number(e.target.value))}
                disabled={isRunning}
                className="block w-16 sm:w-20 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={pickRandomTarget}
                disabled={isRunning}
                className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs border border-border hover:opacity-80 disabled:opacity-40"
              >
                Random
              </button>
            </div>
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
            <button
              onClick={runSearch}
              disabled={isRunning || isDone}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isRunning ? "Searching..." : "Search"}
            </button>
            <button
              onClick={resetArray}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-80 transition-opacity border border-border"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-muted-foreground">
          <span>Target: <span className="text-foreground font-semibold">{target}</span></span>
          {isDone && (
            <span className={found >= 0 ? "text-glow-green" : "text-destructive"}>
              {found >= 0 ? `Found at index ${found}` : "Not found"}
            </span>
          )}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-warm" /> Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-accent/50" /> Checked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-green" /> Found
            </span>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-2 sm:p-4 min-h-[280px] sm:min-h-[400px] flex items-end justify-center gap-[2px] overflow-hidden">
        {array.map((value, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono text-muted-foreground">
              {arraySize <= 40 ? value : ""}
            </span>
            <motion.div
              layout
              transition={{ duration: 0.05 }}
              className={`rounded-t-sm ${getBarColor(idx)} ${getBarShadow(idx)} transition-colors duration-75`}
              style={{
                height: `${(value / 100) * 340}px`,
                width: `${Math.max(4, Math.floor(700 / arraySize) - 2)}px`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchingVisualizer;
