import { useCallback, useEffect, useRef, useState } from "react";

export interface Tetrimino {
  id: string;
  originalId: string;
  shape: number[][];
  color: string;
  x: number;
  y: number;
  blockInfo: {
    number: number;
    hash: string;
    timestamp: string;
    txCount: number;
    totalValue: number;
  };
}

const BOARD_WIDTH = 35;
const BOARD_HEIGHT = 20;

export const useTetrisEngine = (
  tps: number = 1,
  latestBlock: any,
  latestTile: Tetrimino | null
) => {
  const [tiles, setTiles] = useState<Tetrimino[]>([]);
  const [rawTiles, setRawTiles] = useState<Tetrimino[]>([]);
  const [currentTile, setCurrentTile] = useState<Tetrimino | null>(null);
  const [targetTile, setTargetTile] = useState<Tetrimino | null>(null);
  const [currentSC, setCurrentSC] = useState<Tetrimino | null>(null);
  const [shouldSpawn, setShouldSpawn] = useState(true);
  const lastSpawnedBlockRef = useRef<number | null>(null);

  const collides = useCallback((tile: Tetrimino): boolean => {
    return tile.shape.some((row, dy) =>
      row.some((cell, dx) => {
        if (!cell) return false;
        const x = tile.x + dx;
        const y = tile.y + dy;
        if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return true;

        return tiles.some(other =>
          other.shape.some((orow, oy) =>
            orow.some((oval, ox) =>
              oval && other.x + ox === x && other.y + oy === y
            )
          )
        );
      })
    );
  }, [tiles]);

  const simulateBoard = useCallback((tetriminos: Tetrimino[]): number[][] => {
    const board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
    tetriminos.forEach(tile =>
      tile.shape.forEach((row, dy) =>
        row.forEach((cell, dx) => {
          if (cell) {
            const x = tile.x + dx;
            const y = tile.y + dy;
            if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
              board[y][x] = 1;
            }
          }
        })
      )
    );
    return board;
  }, []);

  const evaluateBoard = useCallback((tetriminos: Tetrimino[], board: number[][]): number => {
  const fullLines = board.reduce((count, row) => count + (row.every(cell => cell === 1) ? 1 : 0), 0);
  let aggregateHeight = 0;
  let maxHeight = 0;
  let holes = 0;
  let bumpiness = 0;
  let prevColHeight = -1;
  let wellDepth = 0;

  for (let x = 0; x < BOARD_WIDTH; x++) {
    let colHeight = 0;
    let blockFound = false;

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (board[y][x]) {
        if (!blockFound) {
          colHeight = BOARD_HEIGHT - y;
          blockFound = true;
        }
      } else if (blockFound) {
        holes++;
      }
    }

    maxHeight = Math.max(maxHeight, colHeight);
    aggregateHeight += colHeight;

    if (prevColHeight !== -1) bumpiness += Math.abs(prevColHeight - colHeight);
    prevColHeight = colHeight;

    // Well detection (both neighbors are higher)
    for (let y = 1; y < BOARD_HEIGHT - 1; y++) {
      const isWell = !board[y][x] &&
        (x === 0 || board[y][x - 1]) &&
        (x === BOARD_WIDTH - 1 || board[y][x + 1]);
      if (isWell) wellDepth++;
    }
  }

  // You can tune these weights
  return (
    + fullLines * 1.0              // ✅ Favor line clears
    - aggregateHeight * 0.35       // 🧱 Avoid tall stacks
    - maxHeight * 0.3              // 🔻 Avoid early game over
    - holes * 2.0                  // 🚫 Avoid empty cells under blocks
    - bumpiness * 0.2              // 🌊 Prefer flatter surfaces
    - wellDepth * 0.5              // 🕳️ Avoid deep wells
  );
}, []);


  const rotateMatrix = (matrix: number[][]): number[][] => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[x][rows - 1 - y] = matrix[y][x];
      }
    }
    return rotated;
  };

  const getAllRotations = (shape: number[][]): number[][][] => {
    const rotations: number[][][] = [];
    let current = shape;
    for (let i = 0; i < 4; i++) {
      const serialized = JSON.stringify(current);
      if (!rotations.some(r => JSON.stringify(r) === serialized)) {
        rotations.push(current);
      }
      current = rotateMatrix(current);
    }
    return rotations;
  };

  // const clearFullLines = useCallback((tetriminos: Tetrimino[]): Tetrimino[] => {
  //   const grid = simulateBoard(tetriminos);
  //   const fullRows = grid
  //     .map((row, y) => row.every(cell => cell === 1) ? y : -1)
  //     .filter(y => y !== -1);

  //   const survivorsMap = new Map<string, {
  //     id: string;
  //     color: string;
  //     cells: { x: number; y: number }[];
  //     blockInfo: {
  //       number: number;
  //       hash: string;
  //       timestamp: string;
  //       txCount: number;
  //       totalValue: number;
  //   };
  //   }>();

  //   tetriminos.forEach(tile => {
  //     const newCells: { x: number; y: number }[] = [];
  //     const originalId = tile.originalId || tile.id

  //     tile.shape.forEach((row, dy) => {
  //       row.forEach((cell, dx) => {
  //         if (!cell) return;
  //         const gx = tile.x + dx;
  //         const gy = tile.y + dy;
  //         if (fullRows.includes(gy)) return;
  //         const drop = fullRows.filter(rowY => rowY > gy).length;
  //         newCells.push({ x: gx, y: gy + drop });
  //       });
  //     });

  //     if (newCells.length > 0) {
  //       survivorsMap.set(originalId, {
  //         id: originalId,
  //         color: tile.color,
  //         cells: (survivorsMap.get(originalId)?.cells || []).concat(newCells),
  //         blockInfo: tile.blockInfo
  //       });
  //     }
  //   });

  //   const newTiles: Tetrimino[] = [];
  //   for (const [id, { color, cells, blockInfo }] of survivorsMap.entries()) {
  //     const minX = Math.min(...cells.map(c => c.x));
  //     const minY = Math.min(...cells.map(c => c.y));
  //     const maxX = Math.max(...cells.map(c => c.x));
  //     const maxY = Math.max(...cells.map(c => c.y));

  //     const width = maxX - minX + 1;
  //     const height = maxY - minY + 1;
  //     const shape = Array.from({ length: height }, () => Array(width).fill(0));
  //     cells.forEach(({ x, y }) => {
  //       shape[y - minY][x - minX] = 1;
  //     });

  //     newTiles.push({ id, x: minX, y: minY, shape, color, originalId: id, blockInfo });
  //   }
  //   return newTiles;
  // }, [simulateBoard]);

  const clearFullLines = useCallback((tetriminos: Tetrimino[]): Tetrimino[] => {
  const board = simulateBoard(tetriminos);

  // Cari baris yang full
  const fullRows = board
    .map((row, y) => row.every(cell => cell === 1) ? y : -1)
    .filter(y => y !== -1);

  if (fullRows.length === 0) return tetriminos;

  // Ambil semua blok sebagai cell individual
  const allCells: {
    x: number;
    y: number;
    color: string;
    id: string;
    blockInfo?: Tetrimino["blockInfo"];
    originalId?: string;
  }[] = [];

  for (const tile of tetriminos) {
    const tileId = tile.originalId || tile.id;
    tile.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (!cell) return;
        const gx = tile.x + dx;
        const gy = tile.y + dy;

        if (fullRows.includes(gy)) return;

        const drop = fullRows.filter(rowY => rowY > gy).length;
        allCells.push({
          x: gx,
          y: gy + drop,
          color: tile.color,
          id: tileId,
          blockInfo: tile.blockInfo,
          originalId: tile.originalId,
        });
      });
    });
  }

  // Grup berdasarkan ID untuk bangun ulang tile
  const tileMap = new Map<string, typeof allCells>();

  for (const cell of allCells) {
    const group = tileMap.get(cell.id) ?? [];
    group.push(cell);
    tileMap.set(cell.id, group);
  }

  const newTiles: Tetrimino[] = [];

  for (const [id, cells] of tileMap.entries()) {
    const minX = Math.min(...cells.map(c => c.x));
    const minY = Math.min(...cells.map(c => c.y));
    const maxX = Math.max(...cells.map(c => c.x));
    const maxY = Math.max(...cells.map(c => c.y));

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const shape = Array.from({ length: height }, () => Array(width).fill(0));

    cells.forEach(({ x, y }) => {
      shape[y - minY][x - minX] = 1;
    });

    newTiles.push({
      id,
      originalId: id,
      x: minX,
      y: minY,
      shape,
      color: cells[0].color,
      blockInfo: cells[0].blockInfo!,
    });
  }

  return newTiles;
}, [simulateBoard]);


  const getBestTargetTile = useCallback((tile: Tetrimino): Tetrimino => {
    const rotations = getAllRotations(tile.shape);
    let bestTile = tile;
    let bestScore = -Infinity;

    rotations.forEach(shape => {
      for (let x = 0; x <= BOARD_WIDTH - shape[0].length; x++) {
        let y = 0;
        while (!collides({ ...tile, shape, x, y })) y++;
        y--;
        if (y < 0) continue;

        const candidate = { ...tile, shape, x, y };
        const cleared = clearFullLines([...tiles, candidate]);
        const board1 = simulateBoard(cleared);

        let lookaheadScore = 0;
        getAllRotations(tile.shape).forEach(nextShape => {
          for (let nx = 0; nx <= BOARD_WIDTH - nextShape[0].length; nx++) {
            let ny = 0;
            while (!collides({ ...tile, shape: nextShape, x: nx, y: ny })) ny++;
            ny--;
            if (ny < 0) continue;
            const nextCandidate = { ...tile, shape: nextShape, x: nx, y: ny };
            const board2 = simulateBoard(clearFullLines([...cleared, nextCandidate]));
            const eval2 = evaluateBoard([...cleared, nextCandidate], board2);
            lookaheadScore = Math.max(lookaheadScore, eval2);
          }
        });

        const eval1 = evaluateBoard(cleared, board1);
        const totalScore = eval1 + 0.5 * lookaheadScore;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestTile = candidate;
        }
      }
    });
    return bestTile;
  }, [collides, clearFullLines, simulateBoard, evaluateBoard, tiles]);

  const spawnTile = useCallback(async () => {
    if (latestBlock.number === lastSpawnedBlockRef.current) return;
    lastSpawnedBlockRef.current = latestBlock.number;

    const gameOver = tiles.some(t => t.y <= 0);
    if (gameOver) setTiles([]);
    if (!latestBlock) return
    if (!latestTile) return

    const best = getBestTargetTile(latestTile);
    
    setCurrentTile(best);
    setCurrentSC(latestTile);
    setTargetTile(best);
    setShouldSpawn(false);
  }, [latestBlock, getBestTargetTile]);

  useEffect(() => {
    // const interval = setInterval(() => {
      if (!currentTile && shouldSpawn && latestBlock && latestTile) {
        spawnTile();
        return;
      }

      if (!targetTile || !currentTile) return;

      if (currentTile.x !== targetTile.x) {
        const dir = currentTile.x < targetTile.x ? 1 : -1;
        const moved = { ...currentTile, x: currentTile.x + dir };
        if (!collides(moved)) {
          setCurrentTile(moved);
          return;
        }
      }

      if (JSON.stringify(currentTile.shape) !== JSON.stringify(targetTile.shape)) {
        const rotated = { ...currentTile, shape: targetTile.shape };
        if (!collides(rotated)) {
          setCurrentTile(rotated);
          return;
        }
      }

      const dropped = { ...currentTile, y: currentTile.y + 1 };
      if (!collides(dropped)) {
        setCurrentTile(dropped);
      } else {
        // (async () => {
        const landed = [...tiles, currentTile];
        setRawTiles(landed);
        setTiles(clearFullLines(landed));
        setCurrentTile(null);
        setTargetTile(null);
        setShouldSpawn(true);
        // })();
      }
    

    // return () => clearInterval(interval);
  }, [currentTile, targetTile, collides, clearFullLines, spawnTile, shouldSpawn, tiles, tps]);

  return {
    boardWidth: BOARD_WIDTH,
    boardHeight: BOARD_HEIGHT,
    tiles,
    currentTile,
    rawTiles,
    currentSC,
  };
};
