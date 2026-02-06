"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/web3/wagmi.config";

export const WagmiProviderComponent = ({ children }: { children: React.ReactNode }) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};
