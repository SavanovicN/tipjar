import type { Chain } from "viem";
import { useChainId, useChains } from "wagmi";

interface ChainInfo {
  chain: Chain | undefined;
  currencySymbol: string | undefined;
  networkName: string | undefined;
  explorerUrl: string | undefined;
}

export function useChainInfo(): ChainInfo {
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);

  return {
    chain,
    currencySymbol: chain?.nativeCurrency?.symbol,
    networkName: chain?.name,
    explorerUrl: chain?.blockExplorers?.default?.url,
  };
}
