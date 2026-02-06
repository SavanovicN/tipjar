"use client";

import { useCallback } from "react";
import { formatEther } from "viem";
import { useBalance, useConnection } from "wagmi";
import { SuccessState } from "@/app/components/shared/SuccessState";
import { TipForm } from "@/app/components/TipForm";
import { useChainInfo, useTipTransaction } from "@/lib/hooks";

export function TipCreatorForm() {
  const { address, isConnected } = useConnection();
  const { currencySymbol, networkName, explorerUrl } = useChainInfo();
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address });

  const balance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;
  const balanceFormatted = balanceData
    ? parseFloat(formatEther(balanceData.value)).toFixed(4)
    : "0.0000";

  const onTipSuccess = useCallback(() => {
    refetchBalance();
  }, [refetchBalance]);

  const {
    status,
    statusConfig,
    isBusy,
    sendTip,
    reset: resetTx,
  } = useTipTransaction({
    explorerUrl,
    onSuccess: onTipSuccess,
  });

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
      {status === "success" ? (
        <SuccessState onReset={resetTx} />
      ) : (
        <TipForm
          isConnected={isConnected}
          isBusy={isBusy}
          statusLabel={statusConfig[status].label}
          srText={statusConfig[status].srText}
          currencySymbol={currencySymbol}
          networkName={networkName}
          balance={balance}
          balanceFormatted={balanceFormatted}
          onSubmit={sendTip}
        />
      )}
    </div>
  );
}
