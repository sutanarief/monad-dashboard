const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";

export const getLatestBlockNumber = async (): Promise<number> => {
  const res = await fetch(MONAD_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 1,
    }),
  });

  const data = await res.json();
  return parseInt(data.result, 16); // hex to number
};

export const getGas = async (): Promise<number> => {
  const res = await fetch(MONAD_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1
    }),
  });

  const data = await res.json();
  console.log(data, 'ini data gas')
  return parseInt(data.result, 16); // hex to number
};

export const getBlockByNumber = async (blockNumber: number) => {
  const hexBlock = "0x" + blockNumber.toString(16);
  const res = await fetch(MONAD_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [hexBlock, true],
      id: 1,
    }),
  });

  const data = await res.json();
  return data.result;
};
