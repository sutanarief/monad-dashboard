'use client';

import { useTetrisEngine } from "./hooks/useTetrisEngine";
import { TetrisBoard } from "./components/TetrisBoard";
import { SidebarStats } from "./components/SidebarStats";
import { useTPS } from "./hooks/useTPS";
import { useRealTime } from "./hooks/useRealTime";
import { LoadingScreen } from "./components/Loading";
import { Header } from "./components/Headers";
import { Footer } from "./components/Footer";
import { useEffect, useState } from "react";

const App = () => {
  // const { latestBlock, fetchLatestBlock, blockQueue, setBlockQueue, tileQueue, setTileQueue} = useBlockSync()
  const { latestBlock, latestTile } = useRealTime({
  wsUrl: "wss://testnet-rpc.monad.xyz",
  rpcUrl: "https://testnet-rpc.monad.xyz",
})
const {tps, gas } = useTPS()
  const { boardWidth, boardHeight, tiles, currentTile, rawTiles } = useTetrisEngine(tps, latestBlock, latestTile);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  if(isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-sans">
      <Header />
      <main className="grid w-full grid-cols-1 justify-between items-center gap-8 p-8">
        {/* <BlockAndTxList currentTile={currentTile} latestBlock={latestBlock} /> */}
        <div className="flex gap-8 w-full">
          <div className="rounded-lg shadow-lg border border-gray-700 p-1">
            <TetrisBoard
              width={boardWidth}
              height={boardHeight}
              tiles={tiles}
              currentTile={currentTile}
            />
          </div>
          <div className="w-full flex justify-end">
            <SidebarStats currentTile={currentTile} tps={tps} gas={gas} rawTiles={rawTiles} latestBlock={latestBlock} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
