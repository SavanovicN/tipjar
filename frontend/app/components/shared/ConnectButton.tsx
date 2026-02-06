"use client";

import { useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";

export function ConnectButton() {
  const { address, isConnected, isConnecting, isReconnecting } = useConnection();
  const { mutate: connect, isPending } = useConnect();
  const { mutate: disconnect } = useDisconnect();
  const connectors = useConnectors();

  const onConnect = () => {
    connect({ connector: connectors[0] });
  };

  const onDisconnect = () => {
    disconnect();
  };

  if (isConnecting || isReconnecting) {
    return (
      <div
        className="h-9 w-32 animate-pulse rounded-md bg-muted"
        role="status"
        aria-label="Loading wallet connection"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span
          className="hidden sm:block text-sm font-mono bg-muted px-3 py-1.5 rounded-lg"
          title={`Connected wallet: ${address}`}
        >
          {truncateAddress(address)}
        </span>
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={onConnect} disabled={isPending} aria-busy={isPending}>
      {isPending ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
