import { useEffect, useRef, useState, useCallback } from "react";
import { convertBlockToTetriminoFromMonad, createRandomPieceGenerator } from "../utils/tetriminoUtils";
import type { Tetrimino } from "./useTetrisEngine";


interface MonadBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactions: any[];
  [key: string]: any;
}

interface UseMonadWebSocketOptions {
  wsUrl: string;
  rpcUrl: string;
}

export const useRealTime = ({ wsUrl, rpcUrl }: UseMonadWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [latestBlock, setLatestBlock] = useState<MonadBlock | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [latestTile, setLatestTile] = useState<Tetrimino | null>(null);
  const shapeGeneratorRef = useRef<ReturnType<typeof createRandomPieceGenerator>>(null);

if (!shapeGeneratorRef.current) {
  shapeGeneratorRef.current = createRandomPieceGenerator();
}

  const processTransactionFromBlock = (tx: any) => {
    try {
      const value = parseInt(tx.value || '0x0', 16) / Math.pow(10, 18) // Convert wei to MON
      const gasPrice = parseInt(tx.gasPrice || '0x0', 16) / Math.pow(10, 9) // Convert to Gwei
      
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: value.toFixed(6),
        gasPrice: gasPrice.toFixed(2),
        gasLimit: parseInt(tx.gas || '0x0', 16),
        timestamp: Date.now(),
        blockNumber: parseInt(tx.blockNumber || '0x0', 16),
        size: Math.max(2, Math.min(8, Math.floor(Math.log10(value + 1) * 2) + 3)),
        // color: this.getTransactionColor(value),
        token: 'MON',
        nonce: parseInt(tx.nonce || '0x0', 16),
        input: tx.input || '0x',
        isSpecial: value > 1 || gasPrice > 50,
        type: (tx.input && tx.input !== '0x') ? 'contract' : 'transfer'
      }
    } catch (error) {
      console.error('Error processing transaction:', error)
      return null
    }
  }


  const fetchFullBlock = useCallback(async (blockHash: string) => {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBlockByHash",
          params: [blockHash, true],
        }),
      });
      const json = await response.json();
      if (json.result) {
        const block = json.result;

        const gasUsed = parseInt(block.gasUsed || '0x0', 16)
        const gasLimit = parseInt(block.gasLimit || '0x0', 16)
        const utilization = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0
        const parsedBlock = {
          number: parseInt(block.number, 16),
          hash: block.hash,
          timestamp: parseInt(block.timestamp, 16),
          transactions: block.transactions.map((tx: any) => processTransactionFromBlock(tx)) || [],
          totalValue: block.transactions.reduce((sum: number, tx: any) => {
            const value = parseInt(tx.value || "0", 16);
            return sum + value / 1e18;
          }, 0),
          transactionCount: block.transactions ? block.transactions.length : 0,
          gasUsed: gasUsed,
          gasLimit: gasLimit,
          miner: block.miner,
          difficulty: block.difficulty,
          size: parseInt(block.size || '0x0', 16),
          networkUtilization: utilization,
          baseFeePerGas: parseInt(block.baseFeePerGas || '0x0', 16),
          totalDifficulty: block.totalDifficulty,
        };

        setLatestBlock(parsedBlock);

        // Generate Tetrimino here
        const tile = convertBlockToTetriminoFromMonad(10, parsedBlock, shapeGeneratorRef.current?.nextPiece());
        if (tile) setLatestTile(tile);
      }
    } catch (err) {
      console.error("Failed to fetch full block", err);
    }
  }, [rpcUrl]);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_subscribe",
          params: ["newHeads"],
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.method === "eth_subscription" && data.params?.result?.hash) {
        const blockHash = data.params.result.hash;
        fetchFullBlock(blockHash);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error", e);
      setError(e as any);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [wsUrl, fetchFullBlock]);

  return {
    latestBlock,
    latestTile,
    connected,
    error,
  };
};
