import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  SORTING_ALGORITHMS,
  ALGORITHM_DESCRIPTIONS,
  SortAlgorithmKey,
  SortFrame,
} from "@/lib/sortingAlgorithms";
import { playCompareSound, playCompleteSound, valueToFrequency, playTone } from "@/lib/sound";
import { Info } from "lucide-react";

const generateArray = (size: number): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
};

const SortingVisualizer = () => {
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<SortAlgorithmKey>("bubble");
  const [array, setArray] = useState<number[]>(() => generateArray(50));
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [active, setActive] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
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
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setActive([]);
    setIsRunning(false);
    setIsSorted(false);
  }, [arraySize]);

  useEffect(() => {
    resetArray();
  }, [arraySize]);

  const getDelay = () => Math.max(1, 200 - speedRef.current * 2);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runSort = async () => {
    if (isRunning || isSorted) return;
    setIsRunning(true);
    stopRef.current = false;

    const algo = SORTING_ALGORITHMS[algorithm];
    const gen = algo.fn(array);
    const maxVal = Math.max(...array);

    let frame: IteratorResult<SortFrame>;
    while (!(frame = gen.next()).done) {
      if (stopRef.current) break;
      const f = frame.value;
      setArray(f.array);
      setComparing(f.comparing);
      setSwapping(f.swapping);
      setSorted(f.sorted);
      setActive(f.active);

      if (soundRef.current) {
        if (f.comparing.length > 0) {
          playCompareSound(f.array[f.comparing[0]], maxVal);
        }
        if (f.swapping.length > 0) {
          playTone(valueToFrequency(f.array[f.swapping[0]], maxVal), 0.04, 0.06);
        }
      }

      await sleep(getDelay());
    }

    if (!stopRef.current) {
      setSorted(Array.from({ length: array.length }, (_, i) => i));
      setComparing([]);
      setSwapping([]);
      setActive([]);
      setIsSorted(true);
      if (soundRef.current) playCompleteSound(100);
    }
    setIsRunning(false);
  };

  const getBarColor = (idx: number): string => {
    if (sorted.includes(idx)) return "bg-glow-green";
    if (swapping.includes(idx)) return "bg-destructive";
    if (comparing.includes(idx)) return "bg-glow-warm";
    if (active.includes(idx)) return "bg-glow-accent";
    return "bg-primary";
  };

  const getBarShadow = (idx: number): string => {
    if (sorted.includes(idx)) return "shadow-[0_0_8px_hsl(150_70%_45%/0.5)]";
    if (swapping.includes(idx)) return "shadow-[0_0_8px_hsl(0_72%_55%/0.5)]";
    if (comparing.includes(idx)) return "shadow-[0_0_8px_hsl(35_90%_55%/0.5)]";
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
            {SORTING_ALGORITHMS[algorithm].name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {ALGORITHM_DESCRIPTIONS[algorithm]}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Time: {SORTING_ALGORITHMS[algorithm].timeComplexity}
            </span>
            <span className="px-2 py-1 rounded-md bg-glow-accent/10 border border-glow-accent/20 text-glow-accent">
              Space: {SORTING_ALGORITHMS[algorithm].spaceComplexity}
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
                setAlgorithm(e.target.value as SortAlgorithmKey);
                resetArray();
              }}
              disabled={isRunning}
              className="block w-full sm:w-44 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm border border-border focus:border-primary focus:outline-none disabled:opacity-50"
            >
              {Object.entries(SORTING_ALGORITHMS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">
              Size: {arraySize}
            </label>
            <input
              type="range"
              min={10}
              max={150}
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isRunning}
              className="block w-full sm:w-32 accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground">
              Speed: {speed}%
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={speed}
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

          <div className="flex items-end gap-2 col-span-2 sm:col-span-1 sm:ml-auto">
            <button
              onClick={runSort}
              disabled={isRunning || isSorted}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isRunning ? "Sorting..." : "Sort"}
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
          <span>
            Elements: <span className="text-foreground">{arraySize}</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-warm" /> Comparing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-destructive" /> Swapping
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-glow-green" /> Sorted
            </span>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-2 sm:p-4 min-h-[280px] sm:min-h-[400px] flex items-end justify-center gap-[1px] overflow-hidden">
        {array.map((value, idx) => (
          <motion.div
            key={idx}
            layout
            transition={{ duration: 0.05 }}
            className={`rounded-t-sm ${getBarColor(idx)} ${getBarShadow(idx)} transition-colors duration-75`}
            style={{
              height: `${(value / 100) * (typeof window !== 'undefined' && window.innerWidth < 640 ? 240 : 360)}px`,
              width: `${Math.max(2, Math.floor((typeof window !== 'undefined' && window.innerWidth < 640 ? 320 : 800) / arraySize) - 1)}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SortingVisualizer;
