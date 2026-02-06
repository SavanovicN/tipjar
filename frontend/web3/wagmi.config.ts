import { hardhat } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { polygonAmoy } from "./chains";

const env = {
  useLocal: process.env.NEXT_PUBLIC_USE_LOCAL_NETWORK === "true",
  localRpcUrl: process.env.NEXT_PUBLIC_LOCAL_RPC_URL,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://tipjar.local",
} as const;

// For local development and testing
function createLocalConfig() {
  return createConfig({
    chains: [hardhat],
    connectors: [injected()],
    transports: {
      [hardhat.id]: http(env.localRpcUrl),
    },
  });
}

function createProdConfig() {
  const connectors = env.walletConnectProjectId
    ? [
        injected(),
        walletConnect({
          projectId: env.walletConnectProjectId,
          metadata: {
            name: "TipJar",
            description: "Support creators on-chain",
            url: env.appUrl,
            icons: [],
          },
        }),
      ]
    : [injected()];

  return createConfig({
    chains: [polygonAmoy],
    connectors,
    transports: {
      [polygonAmoy.id]: http(env.rpcUrl),
    },
  });
}

export const config = env.useLocal ? createLocalConfig() : createProdConfig();
