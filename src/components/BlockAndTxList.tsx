// import React, { useEffect, useState } from "react";
// import { getLatestBlockNumber, getBlockByNumber } from "../utils/monad";
// import type { Tetrimino } from "../hooks/useTetrisEngine";
// import { useLatestBlock } from "../hooks/useLatestBlock";
// import { useBlockSync } from "../hooks/useBlockSync";

// // Shapes & helpers
// const SHAPES = {
//   I: [[1, 1, 1, 1]],
//   O: [[1, 1], [1, 1]],
//   T: [[0, 1, 0], [1, 1, 1]],
//   L: [[1, 0, 0], [1, 1, 1]],
//   J: [[0, 0, 1], [1, 1, 1]],
//   S: [[1, 1, 0], [0, 1, 1]],
//   Z: [[0, 1, 1], [1, 1, 0]],
// };

// const getShapeFromTxCount = (txCount: number): number[][] => {
//   if (txCount >= 100) return SHAPES.I;
//   if (txCount >= 50) return SHAPES.T;
//   if (txCount >= 30) return SHAPES.L;
//   if (txCount >= 15) return SHAPES.J;
//   if (txCount >= 5) return SHAPES.S;
//   return SHAPES.O;
// };

// const getColorFromValue = (value: number): string => {
//   if (value >= 1000) return "bg-red-600";
//   if (value >= 100) return "bg-orange-500";
//   if (value >= 10) return "bg-yellow-400";
//   if (value >= 1) return "bg-green-400";
//   return "bg-blue-400";
// };

// const getBlockTime = (ts: string | undefined): string => {
//   try {
//     const unix = parseInt(ts || "0", 16);
//     return new Date(unix * 1000).toLocaleString();
//   } catch {
//     return "Unknown";
//   }
// };

// interface Tx {
//   hash: string;
//   from: string;
//   to: string | null;
//   value: string;
//   valueNum: number;
// }

// interface Block {
//   number: number;
//   hash: string;
//   timestamp: string;
//   transactions: Tx[];
//   totalValue: number;
// }

// interface Props {
//   currentTile: Tetrimino | null;
// }

// export const BlockAndTxList: React.FC<Props> = ({ currentTile }) => {
//   const [blocks, setBlocks] = useState<Block[]>([]);
//   const { latestBlock } = useBlockSync();

// useEffect(() => {
//   if (!latestBlock) return;

//   let totalValue = 0;
//   const txs = latestBlock.transactions.map((tx: any) => {
//     const value = parseInt(tx.value || "0", 16);
//     totalValue += value;
//     return {
//       hash: tx.hash,
//       from: tx.from,
//       to: tx.to || null,
//       value: `${value / 1e18} MONAD`,
//       valueNum: value / 1e18,
//     };
//   });

//   setBlocks([
//     {
//       number: latestBlock.number,
//       hash: latestBlock.hash,
//       timestamp: latestBlock.timestamp,
//       transactions: txs,
//       totalValue: totalValue / 1e18,
//     },
//   ]);
// }, [latestBlock]);

//   // useEffect(() => {
//   //   const fetchBlocks = async () => {
//   //     const latest = await getLatestBlockNumber();
//   //     const results: Block[] = [];

//   //     for (let i = latest; i > latest - 5 && i >= 0; i--) {
//   //       const raw = await getBlockByNumber(i);
//   //       if (!raw || !raw.transactions) continue;

//   //       let totalValue = 0;

//   //       const txs = raw.transactions.map((tx: any) => {
//   //         const value = parseInt(tx.value || "0", 16);
//   //         totalValue += value;
//   //         return {
//   //           hash: tx.hash,
//   //           from: tx.from,
//   //           to: tx.to || null,
//   //           value: `${value / 1e18} MONAD`,
//   //           valueNum: value / 1e18,
//   //         };
//   //       });

//   //       results.push({
//   //         number: i,
//   //         hash: raw.hash,
//   //         timestamp: raw.timestamp,
//   //         transactions: txs,
//   //         totalValue: totalValue / 1e18,
//   //       });
//   //     }

//   //     setBlocks(results);
//   //   };

//   //   fetchBlocks();
//   //   // const interval = setInterval(fetchBlocks, 10000);
//   //   // return () => clearInterval(interval);
//   // }, []);

//   const renderMiniShape = (
//     shape: number[][],
//     color: string,
//     idPrefix: string,
//     size = 10
//   ) => {
//     if (!shape || shape.length === 0) return null;

//     return (
//       <div
//         className="relative"
//         style={{ width: shape[0].length * size, height: shape.length * size }}
//       >
//         {shape.map((row, y) =>
//           row.map((v, x) =>
//             v ? (
//               <div
//                 key={`${idPrefix}-${x}-${y}`}
//                 className={`absolute ${color} border border-black`}
//                 style={{
//                   width: size,
//                   height: size,
//                   left: x * size,
//                   top: y * size,
//                 }}
//               />
//             ) : null
//           )
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col lg:flex-row gap-6">
//       {/* Blocks */}
//       <div className="w-full lg:w-1/2 bg-gray-900 p-4 rounded-lg border border-gray-700">
//         <h2 className="text-xl font-bold mb-3 text-white">Recent Blocks</h2>
//         <ul className="space-y-2 text-sm">
//           {blocks.map((block) => {
//             const shape = getShapeFromTxCount(block.transactions.length);
//             const color = getColorFromValue(block.totalValue);
//             return (
//               <li
//                 key={block.hash}
//                 className="p-2 bg-gray-800 rounded flex gap-3 items-start"
//               >
//                 {renderMiniShape(shape, color, block.hash)}
//                 <div className="flex-1">
//                   <p className="text-green-400 font-mono">
//                     Block #{block.number}
//                   </p>
//                   <p className="truncate text-gray-300">Hash: {block.hash}</p>
//                   <p className="text-xs text-gray-400">
//                     Txs: {block.transactions.length}
//                   </p>
//                   <p className="text-xs text-gray-400">
//                     Volume: {block.totalValue.toFixed(4)} MONAD
//                   </p>
//                   <p className="text-xs text-gray-400">
//                     Time: {getBlockTime(block.timestamp)}
//                   </p>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       </div>

//       {/* Transactions */}
//       <div className="w-full lg:w-1/2 bg-gray-900 p-4 rounded-lg border border-gray-700">
//         <h2 className="text-xl font-bold mb-3 text-white">Recent Transactions</h2>
//         <ul className="space-y-2 text-xs max-h-[600px] overflow-y-auto">
//           {blocks.flatMap((block) =>
//             block.transactions.map((tx) => {
//               const shape = getShapeFromTxCount(1); // Fixed size
//               const color = getColorFromValue(tx.valueNum);
//               return (
//                 <li
//                   key={tx.hash}
//                   className="bg-gray-800 p-2 rounded flex gap-3 items-start"
//                 >
//                   {renderMiniShape(shape, color, tx.hash, 8)}
//                   <div className="flex-1">
//                     <p className="truncate text-gray-300">Hash: {tx.hash}</p>
//                     <p className="text-gray-400">From: {tx.from}</p>
//                     <p className="text-gray-400">To: {tx.to ?? "Contract"}</p>
//                     <p className="text-green-400">Value: {tx.value}</p>
//                   </div>
//                 </li>
//               );
//             })
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useState } from "react";
import type { Tetrimino } from "../hooks/useTetrisEngine";
import { useBlockSync } from "../hooks/useBlockSync";
import { Check, Copy } from "lucide-react";

// Shapes & helpers
const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  L: [[1, 0, 0], [1, 1, 1]],
  J: [[0, 0, 1], [1, 1, 1]],
  S: [[1, 1, 0], [0, 1, 1]],
  Z: [[0, 1, 1], [1, 1, 0]],
};

const getShapeFromTxCount = (txCount: number): number[][] => {
  if (txCount >= 100) return SHAPES.I;
  if (txCount >= 50) return SHAPES.T;
  if (txCount >= 30) return SHAPES.L;
  if (txCount >= 15) return SHAPES.J;
  if (txCount >= 5) return SHAPES.S;
  return SHAPES.O;
};

const getColorFromValue = (value: number): string => {
  if (value >= 1000) return "bg-red-600";
  if (value >= 100) return "bg-orange-500";
  if (value >= 10) return "bg-yellow-400";
  if (value >= 1) return "bg-green-400";
  return "bg-blue-400";
};

const getBlockTime = (ts: string | undefined): string => {
  try {
    const unix = parseInt(ts || "0", 16);
    return new Date(unix * 1000).toLocaleString();
  } catch {
    return "Unknown";
  }
};

interface Tx {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  valueNum: number;
}

interface Block {
  number: number;
  hash: string;
  timestamp: string;
  transactions: Tx[];
  totalValue: number;
}

interface Props {
  currentTile: Tetrimino | null;
  latestBlock: any
}

export const BlockAndTxList: React.FC<Props> = ({ currentTile, latestBlock }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
    const [copied, setCopied] = useState(false);
  
    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    };
  
    const shortenHash = (hash: string, length = 6) => {
      if (!hash) return "";
      return `${hash.slice(0, length)}...${hash.slice(-length)}`;
    };
  
    const getBlockTime = (ts: string | undefined): string => {
      try {
        const unix = parseInt(ts || "0", 16);
        return new Date(unix * 1000).toLocaleString();
      } catch {
        return "Unknown";
      }
    };

  useEffect(() => {
    if (!latestBlock) return;

    let totalValue = latestBlock.totalValue;
    const txs = latestBlock.transactions.map((tx: any) => {
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || null,
        value: tx.value,
        valueNum: tx.valueNum
      };
    });

    setBlocks([
      {
        number: latestBlock.number,
        hash: latestBlock.hash,
        timestamp: latestBlock.timestamp,
        transactions: txs,
        totalValue: totalValue,
      },
    ]);
  }, [latestBlock]);

  // const renderMiniShape = (
  //   shape: number[][],
  //   color: string,
  //   idPrefix: string,
  //   size = 10
  // ) => {
  //   if (!shape || shape.length === 0) return null;

  //   return (
  //     <div
  //       className="relative"
  //       style={{ width: shape[0].length * size, height: shape.length * size }}
  //     >
  //       {shape.map((row, y) =>
  //         row.map((v, x) =>
  //           v ? (
  //             <div
  //               key={`${idPrefix}-${x}-${y}`}
  //               className={`absolute ${color} border border-black`}
  //               style={{
  //                 width: size,
  //                 height: size,
  //                 left: x * size,
  //                 top: y * size,
  //               }}
  //             />
  //           ) : null
  //         )
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div className="">
      {latestBlock && (
        <div>
          <div className="w-full">
                    <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between align-center">
                        <h2 className="text-xl font-bold mb-3 text-white flex flex-col">
                          <span>Recent Block</span>
                          <span>#{latestBlock.number}</span>
                        </h2>
          
                        {/* {renderMiniShape(tileToDisplay.shape, tileToDisplay.color, latestBlock.hash)} */}
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li
                          key={latestBlock.hash}
                          className="p-2 bg-gray-800 rounded flex gap-3 items-start"
                        >
                          <div className="flex-1">
                            <div>
                              <p className="text-xs text-gray-400">Block Hash</p>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://explorer.monad.xyz/block/${latestBlock.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:underline break-all"
                                  title={latestBlock.hash}
                                >
                                  {shortenHash(latestBlock.hash)}
                                </a>
                                <button
                                  onClick={() => handleCopy(latestBlock.hash)}
                                  className="text-gray-400 hover:text-white"
                                  title="Copy hash"
                                >
                                  {copied ? (
                                    <Check size={14} className="text-green-400" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">
                              Txs: {latestBlock.transactions.length}
                            </p>
                            <p className="text-xs text-gray-400">
                              Volume: {latestBlock.totalValue.toFixed(4)} MON
                            </p>
                            <p className="text-xs text-gray-400">
                              Time: {getBlockTime(latestBlock.timestamp)}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                </div>
        </div>
      )}
      <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-3 text-white">Recent Transactions</h2>
        <ul className="space-y-2 text-xs max-h-[600px] overflow-y-auto">
          {blocks.flatMap((block) =>
            block.transactions.map((tx) => {
              return (
                <li
                  key={tx.hash}
                  className="bg-gray-800 p-2 rounded flex gap-3 items-start"
                >
                  <div className="flex-1">
                    <p className="truncate text-gray-300">Hash: {tx.hash}</p>
                    <p className="text-gray-400">From: {tx.from}</p>
                    <p className="text-gray-400">To: {tx.to ?? "Contract"}</p>
                    <p className="text-green-400">Value: {tx.value}</p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};
