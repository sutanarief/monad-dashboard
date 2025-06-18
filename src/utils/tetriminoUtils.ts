import type { Tetrimino } from "../hooks/useTetrisEngine";

const SHAPES: Record<ShapeKey, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  L: [[1, 0, 0], [1, 1, 1]],
  J: [[0, 0, 1], [1, 1, 1]],
  S: [[1, 1, 0], [0, 1, 1]],
  Z: [[0, 1, 1], [1, 1, 0]],
};

const SHAPE_KEYS = ["I", "O", "T", "L", "J", "S", "Z"] as const;
type ShapeKey = "I"| "O"| "T"| "L"| "J"| "S"| "Z"

export const createRandomPieceGenerator = () => {
  let bag: ShapeKey[] = [];
  let index = 0;

  const shuffleBag = () => {
    bag = [...SHAPE_KEYS];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    index = 0;
  };

  const nextPiece = (): ShapeKey => {
    if (index >= bag.length) shuffleBag();
    return bag[index++];
  };

  shuffleBag();

  return {
    nextPiece,
  };
};

const getColorFromValue = (value: number): string => {
  if (value >= 1000) return "red";
  if (value >= 100) return "orange";
  if (value >= 10) return "yellow";
  if (value >= 1) return "green";
  return "blue";
};

export const convertBlockToTetriminoFromMonad = (
  boardWidth: number,
  block: any,
  key: ShapeKey | undefined
): Tetrimino | null => {
  try {
    if (!block || !block.transactions || !key) return null;

    const txCount = block.transactions.length;
    const totalValue = block.totalValue;
    let hasContractTx = false;

    for (const tx of block.transactions) {
      if (!tx.to) {
        hasContractTx = true;
      }
    }

    const shape = SHAPES[key]; // shape dihasilkan di sini
    const color = hasContractTx ? "purple" : getColorFromValue(totalValue);

    return {
      id: block.hash,
      originalId: block.hash,
      shape,
      color,
      x: Math.floor((boardWidth - shape[0].length) / 2),
      y: 0,
      blockInfo: {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        txCount,
        totalValue,
      },
    };
  } catch (err) {
    console.error("Failed to convert block to tetrimino", err);
    return null;
  }
};
