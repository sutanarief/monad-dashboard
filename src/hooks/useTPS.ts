import { useEffect, useState } from "react";
import { getBlockByNumber, getGas, getLatestBlockNumber } from "../utils/monad";

export const useTPS = () => {
  const [tps, setTps] = useState(1);
  const [gas, setGas] = useState(0)

  const fetchTPS = async () => {
    try {
      const latestNumber = await getLatestBlockNumber();
      const latestBlock = await getBlockByNumber(latestNumber);
      const prevBlock = await getBlockByNumber(latestNumber - 1);

      if (!latestBlock || !prevBlock) return;

      const txCount = latestBlock.transactions.length;
      const timeDiff =
        parseInt(latestBlock.timestamp, 16) -
        parseInt(prevBlock.timestamp, 16);

      if (timeDiff > 0) {
        const tpsValue = txCount / timeDiff;
        setTps(Math.max(0.1, tpsValue));
      }
    } catch (err) {
      console.error("Failed to fetch TPS:", err);
    }
  };

  const fetchGas = async () => {
    try {
      const newGas = await getGas()
      console.log(newGas, 'ini gas')
      setGas(newGas / 1e9)

    } catch (error) {
      console.error('Error fetch gas')
    }
  }

  useEffect(() => {
    console.log('jalan')
    const interval = setInterval(() => {
      console.log('masuk')
      fetchTPS();
      fetchGas();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return {tps, gas}
};