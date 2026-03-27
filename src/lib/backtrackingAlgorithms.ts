export interface NQueensFrame {
  board: boolean[][];
  queens: [number, number][];
  currentRow: number;
  currentCol: number;
  conflictCells: [number, number][];
  message: string;
  solved: boolean;
}

export interface SudokuFrame {
  board: number[][];
  currentCell: [number, number];
  fixedCells: [number, number][];
  message: string;
  solved: boolean;
}

export type BacktrackingAlgorithmKey = "nqueens" | "sudoku";

export function* solveNQueens(n: number = 8): Generator<NQueensFrame, void, unknown> {
  const board: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  const queens: [number, number][] = [];

  function getConflicts(row: number, col: number): [number, number][] {
    const conflicts: [number, number][] = [];
    for (const [qr, qc] of queens) {
      if (qc === col || qr === row || Math.abs(qr - row) === Math.abs(qc - col)) {
        conflicts.push([qr, qc]);
      }
    }
    return conflicts;
  }

  function makeFrame(row: number, col: number, conflicts: [number, number][], msg: string, solved: boolean): NQueensFrame {
    return {
      board: board.map(r => [...r]),
      queens: queens.map(q => [...q] as [number, number]),
      currentRow: row,
      currentCol: col,
      conflictCells: conflicts,
      message: msg,
      solved,
    };
  }

  function* solve(row: number): Generator<NQueensFrame, boolean, unknown> {
    if (row === n) {
      yield makeFrame(-1, -1, [], `All ${n} queens placed!`, true);
      return true;
    }

    for (let col = 0; col < n; col++) {
      const conflicts = getConflicts(row, col);
      yield makeFrame(row, col, conflicts, `Trying queen at (${row}, ${col})`, false);

      if (conflicts.length === 0) {
        board[row][col] = true;
        queens.push([row, col]);
        yield makeFrame(row, col, [], `Placed queen at (${row}, ${col})`, false);

        const result = yield* solve(row + 1);
        if (result) return true;

        // Backtrack
        board[row][col] = false;
        queens.pop();
        yield makeFrame(row, col, [], `Backtracking from (${row}, ${col})`, false);
      }
    }
    return false;
  }

  yield* solve(0);
}

function generateSudokuPuzzle(): { board: number[][]; fixed: [number, number][] } {
  // Simple pre-made puzzle
  const solved = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9],
  ];
  const board = solved.map(r => [...r]);
  const fixed: [number, number][] = [];

  // Remove ~45 cells
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      positions.push([r, c]);

  // Shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const removeCount = 45;
  for (let i = 0; i < removeCount; i++) {
    const [r, c] = positions[i];
    board[r][c] = 0;
  }

  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] !== 0) fixed.push([r, c]);

  return { board, fixed };
}

export function* solveSudoku(): Generator<SudokuFrame, void, unknown> {
  const { board, fixed } = generateSudokuPuzzle();

  function isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (board[r][c] === num) return false;
    return true;
  }

  function makeFrame(row: number, col: number, msg: string, solved: boolean): SudokuFrame {
    return {
      board: board.map(r => [...r]),
      currentCell: [row, col],
      fixedCells: [...fixed],
      message: msg,
      solved,
    };
  }

  let frameCount = 0;
  function* solve(): Generator<SudokuFrame, boolean, unknown> {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            frameCount++;
            if (frameCount % 3 === 0) { // yield every 3rd step for speed
              yield makeFrame(r, c, `Trying ${num} at (${r},${c})`, false);
            }
            if (isValid(board, r, c, num)) {
              board[r][c] = num;
              if (frameCount % 3 === 0) {
                yield makeFrame(r, c, `Placed ${num} at (${r},${c})`, false);
              }
              const result = yield* solve();
              if (result) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    yield makeFrame(-1, -1, "Sudoku Solved!", true);
    return true;
  }

  yield makeFrame(-1, -1, "Starting Sudoku solver...", false);
  yield* solve();
}

export const BACKTRACKING_ALGORITHMS: Record<
  BacktrackingAlgorithmKey,
  { name: string; complexity: string; timeComplexity: string; spaceComplexity: string }
> = {
  nqueens: { name: "N-Queens Problem", complexity: "O(N!)", timeComplexity: "O(N!)", spaceComplexity: "O(N²)" },
  sudoku: { name: "Sudoku Solver", complexity: "O(9^(n×n))", timeComplexity: "O(9^(n×n))", spaceComplexity: "O(n²)" },
};

export const BACKTRACKING_DESCRIPTIONS: Record<BacktrackingAlgorithmKey, string> = {
  nqueens: "Place N queens on an N×N chessboard so no two queens threaten each other. Uses backtracking to try each column per row.",
  sudoku: "Fill a 9×9 grid so each row, column, and 3×3 box contains digits 1-9. Tries numbers and backtracks on conflicts.",
};
