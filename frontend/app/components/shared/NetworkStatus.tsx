"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useBlockNumber, useConnection } from "wagmi";
import { Button } from "@/components/ui/button";
import { THIRTY_SECONDS } from "@/lib/constants";
import { isConnectionError } from "@/lib/errors";

export function NetworkStatus() {
  const { isConnected } = useConnection();
  const [isRpcAvailable, setIsRpcAvailable] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const { error, refetch, isError } = useBlockNumber({
    query: {
      enabled: isConnected,
      retry: false,
      refetchInterval: isRpcAvailable ? THIRTY_SECONDS : false,
    },
  });

  useEffect(() => {
    if (!isError) {
      setIsRpcAvailable(true);
      return;
    }

    if (error && isConnectionError(error)) {
      setIsRpcAvailable(false);
    }
  }, [isError, error]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      const result = await refetch();
      if (result.data !== undefined) {
        setIsRpcAvailable(true);
      }
    } finally {
      setIsRetrying(false);
    }
  }, [refetch]);

  if (!isConnected || isRpcAvailable) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-16 left-0 right-0 z-40 border-b border-destructive/30 bg-destructive/10 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Unable to connect to the blockchain
            </p>
            <p className="text-xs text-muted-foreground">
              Please check your network configuration or ensure the local node is running.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex-shrink-0"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {isRetrying ? "Retrying..." : "Retry"}
        </Button>
      </div>
    </div>
  );
}
