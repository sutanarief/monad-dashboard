import React, { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Tetrimino } from "../hooks/useTetrisEngine";

interface Props {
  currentTile: Tetrimino | null;
  tps: number;
  gas: number;
  latestBlock: any
}



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

export const SidebarStats: React.FC<Props> = ({ currentTile, tps, gas, latestBlock }) => {
  const [lastTile, setLastTile] = useState<Tetrimino | null>(null);
  const [copied, setCopied] = useState(false);
    const [blocks, setBlocks] = useState<Block[]>([]);
  

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

  const renderMiniShape = (
    shape: number[][],
    color: string,
    idPrefix: string,
    size = 10
  ) => {
    if (!shape || shape.length === 0) return null;

    return (
      <div
        className="relative"
        style={{ width: shape[0].length * size, height: shape.length * size }}
      >
        {shape.map((row, y) =>
          row.map((v, x) =>
            v ? (
              <div
                key={`${idPrefix}-${x}-${y}`}
                className={`absolute border border-black`}
                style={{
                  width: size,
                  height: size,
                  left: x * size,
                  top: y * size,
                  backgroundImage: `url(/${color}.png)`,
                  backgroundSize: 'cover',
                }}
              />
            ) : null
          )
        )}
      </div>
    );
  };

  const SidebarSkeleton = () => {
  return (
    <div className="grid grid-rows-[auto_auto_1fr] gap-4 w-full h-full animate-pulse text-white">
      {/* Block Info */}
      <div className="w-full">
        <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-700 rounded" />
            </div>
            <div className="w-10 h-10 bg-gray-700 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-3/4 bg-gray-800 rounded" />
            <div className="h-3 w-1/2 bg-gray-800 rounded" />
            <div className="h-3 w-1/2 bg-gray-800 rounded" />
            <div className="h-3 w-1/3 bg-gray-800 rounded" />
          </div>
        </div>
      </div>

      {/* Gas and TPS */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="h-4 w-24 bg-gray-700 rounded mb-4" />
            <div className="h-6 w-16 bg-gray-800 rounded" />
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="place-self-stretch">
        <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="h-4 w-40 bg-gray-700 rounded mb-3" />
          <ul className="space-y-1 overflow-y-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="bg-gray-800 p-2 rounded space-y-1">
                <div className="h-3 w-3/4 bg-gray-700 rounded" />
                <div className="h-3 w-2/3 bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-700 rounded" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};


  useEffect(() => {
    if (currentTile) {
      setLastTile(currentTile)
    }
  }, [currentTile]);

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


  const tileToDisplay = currentTile || lastTile;

  if (!tileToDisplay || !latestBlock) {
    return <SidebarSkeleton />;
  }

  return (
    <div className="grid grid-rows-[auto_auto_1fr] gap-4 w-full h-full">


      <div className="w-full">
        <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700" >
          <div className="flex justify-between align-center">
            <h2 className="text-xl font-bold mb-3 text-white flex flex-col">
              <span>Recent Block</span>
              <span>#{latestBlock.number}</span>
            </h2>

            {renderMiniShape(tileToDisplay.shape, tileToDisplay.color, latestBlock.hash)}
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
                      href={`https://testnet.monadexplorer.com/block/${latestBlock.hash}`}
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




      <div className="grid grid-cols-2 gap-4">
        <div className="w-full">
          <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between align-center">
              <h2 className="text-xl font-bold mb-3 text-white">Gas Fee</h2>
            </div>
            <span className="text-3xl font-bold text-yellow">{gas} Gwei</span>
          </div>
        </div>
        <div className="w-full">
          <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between align-center">
              <h2 className="text-xl font-bold mb-3 text-white">TPS</h2>
            </div>
            <span className="text-3xl font-bold text-yellow">{tps} TPS</span>
          </div>
        </div>
      </div>


      <div className="place-self-stretch">
      <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-3 text-white">Recent Transactions</h2>
        <ul className="space-y-2 text-xs max-h-[438px] overflow-y-auto">
          {blocks.flatMap((block) =>
            block.transactions.map((tx) => {
              return (
                <li
                  key={tx.hash}
                  className="bg-gray-800 p-2 rounded flex gap-3 items-start"
                >
                  <div className="flex-1">
                    
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://testnet.monadexplorer.com/block/${latestBlock.hash}`}
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

    </div>
  );
};
