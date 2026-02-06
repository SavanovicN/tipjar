import { defineChain } from "viem";

const TESTNET_CHAIN_ID = 80002;

export const polygonAmoy = defineChain({
  id: TESTNET_CHAIN_ID,
  name: "Polygon Amoy",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
    },
  },
  testnet: true,
});
