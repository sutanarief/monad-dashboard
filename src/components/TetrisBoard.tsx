import React, { useRef } from "react";
import type { Tetrimino } from "../hooks/useTetrisEngine";
import { motion } from "framer-motion";

interface Props {
  width: number;
  height: number;
  tiles: Tetrimino[];
  currentTile: Tetrimino | null;
}

const TILE_SIZE = 42;

export const TetrisBoard: React.FC<Props> = ({
  width,
  height,
  tiles,
  currentTile,
}) => {
  const hoveredTileRef = useRef<Tetrimino | null>(null);


  const renderTile = (tile: Tetrimino) => {
    const tileId = tile.originalId || tile.id
    const isHovered =  (hoveredTileRef.current?.originalId ?? "") === tile.originalId;

    return (
      <div
        key={`group-${tile.originalId}`}
        onMouseEnter={() => {
          
  hoveredTileRef.current = tile;
}}
onMouseLeave={() => {
  
  setTimeout(() => {
    hoveredTileRef.current = null;
  }, 1000); // 100ms delay bisa diatur
}}
      >
        {tile.shape.flatMap((row, dy) =>
          row.map((cell, dx) => {
            if (!cell) return null;

            const cellX = tile.x + dx;
            const cellY = tile.y + dy;

            if (
              cellX < 0 ||
              cellX >= width ||
              cellY < 0 ||
              cellY >= height
            ) {
              return null;
            }

            const key = `${tileId}-${dx}-${dy}-${cellX}-${cellY}`;

            return (
              <a
              
                        href={`https://testnet.monadexplorer.com/block/${hoveredTileRef.current?.blockInfo.hash}`}
                        target="_blank"
                        rel="noopener noreferrer">
                          <motion.div
                            key={key}
                            className={`absolute border border-black ${
                              isHovered ? "shadow-[0_0_12px_4px_rgba(255,255,255,0.5)]" : ""
                            }`}
                            style={{
                              width: TILE_SIZE,
                              height: TILE_SIZE,
                              left: cellX * TILE_SIZE,
                              top: cellY * TILE_SIZE,
                              backgroundImage: `url(/${tile.color}.png)`,
                              backgroundSize: 'cover',
                              filter: isHovered ? 'brightness(0.4)' : 'none'
                            }}
                          />

                        </a>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div
      className="relative bg-gray-900"
      style={{
        width: width * TILE_SIZE,
        height: height * TILE_SIZE,
      }}
    >
      <div className="flex gap-2 align-center p-2">
  <div>Live Block</div>
  <div className="relative w-2 h-2 mt-2">
  <motion.span
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400"
    style={{ width: '100%', height: '100%' }}
    animate={{
      scale: [1, 1.8],
      opacity: [0.7, 0],
    }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-2 w-2 bg-green-500" />
</div>

</div>
      {tiles.map(renderTile)}
      {currentTile && renderTile(currentTile)}

      {/* Tooltip for hovered tile */}
      {hoveredTileRef && hoveredTileRef.current?.blockInfo && (() => {
        // const tile = [...tiles, currentTile].find(t => t?.id === hoveredId);

        // if (!tile || !tile.blockInfo) return null;


        // const { number, timestamp, txCount, totalValue } = tile.blockInfo;

        return (
          <motion.div
            className="absolute z-50 bg-black text-white text-xs px-3 py-2 rounded shadow-lg border border-yellow-400"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              left: hoveredTileRef.current.x * TILE_SIZE,
              top: (hoveredTileRef.current.y - 1) * TILE_SIZE - 60,
            }}
          >
            <div className="font-bold mb-1">Block #{hoveredTileRef.current.blockInfo.number}</div>
            <div>{new Date(Number(hoveredTileRef.current.blockInfo.timestamp) * 1000).toLocaleString()}</div>
            <div>{hoveredTileRef.current.blockInfo.txCount} txs</div>
            <div>Total: {hoveredTileRef.current.blockInfo.totalValue.toFixed(2)} MON</div>
          </motion.div>
        );
      })()}
    </div>
  );
};
