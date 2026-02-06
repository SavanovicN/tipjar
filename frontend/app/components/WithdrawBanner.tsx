"use client";

import { ArrowRight, CircleDollarSign, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatEther } from "viem";
import {
  useConnection,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { classifyTransactionError } from "@/lib/errors";
import { useChainInfo } from "@/lib/hooks";
import { tipJarAbi, tipJarAddress } from "@/web3/contract";

type WithdrawStatus = "idle" | "signing" | "confirming";

const statusConfig: Record<WithdrawStatus, { label: string; srText?: string }> = {
  idle: { label: "Withdraw" },
  signing: { label: "Signing...", srText: "Please confirm the withdrawal in your wallet." },
  confirming: { label: "Processing...", srText: "Withdrawal submitted. Waiting for confirmation." },
};

export function WithdrawBanner() {
  const { address, isConnected } = useConnection();

  const { chain, currencySymbol, explorerUrl } = useChainInfo();

  const [status, setStatus] = useState<WithdrawStatus>("idle");
  const isBusy = status !== "idle";

  const {
    data: tipsBalance,
    refetch: refetchTips,
    isLoading: isLoadingTips,
  } = useReadContract({
    address: tipJarAddress,
    abi: tipJarAbi,
    functionName: "tips",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const writeContract = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: writeContract.data,
  });

  const hasBalance = tipsBalance && (tipsBalance as bigint) > BigInt(0);
  const balanceFormatted = hasBalance
    ? parseFloat(formatEther(tipsBalance as bigint)).toFixed(4)
    : null;

  useEffect(() => {
    if (!writeContract.error) {
      return;
    }

    const errorInfo = classifyTransactionError(writeContract.error);
    toast.error(errorInfo.title, { description: errorInfo.description });
    setStatus("idle");
    writeContract.reset();
  }, [writeContract]);

  useEffect(() => {
    if (!confirmError) {
      return;
    }

    const errorInfo = classifyTransactionError(confirmError);
    toast.error(errorInfo.title, { description: errorInfo.description });
    setStatus("idle");
    writeContract.reset();
  }, [confirmError, writeContract]);

  // Handle successful confirmation
  useEffect(() => {
    if (isConfirmed && writeContract.data) {
      setStatus("idle");
      const toastOptions: Parameters<typeof toast.success>[1] = {
        description: `You withdrew ${balanceFormatted} ${currencySymbol} to your wallet.`,
      };
      if (explorerUrl) {
        toastOptions.action = {
          label: "View Transaction",
          onClick: () => window.open(`${explorerUrl}/tx/${writeContract.data}`, "_blank"),
        };
      }
      toast.success("Withdrawal successful!", toastOptions);
      refetchTips();
      writeContract.reset();
    }
  }, [isConfirmed, balanceFormatted, currencySymbol, explorerUrl, refetchTips, writeContract]);

  useEffect(() => {
    if (writeContract.isPending) {
      setStatus("signing");
    } else if (isConfirming) {
      setStatus("confirming");
    }
  }, [writeContract.isPending, isConfirming]);

  const handleWithdraw = () => {
    writeContract.mutate({
      address: tipJarAddress,
      abi: tipJarAbi,
      functionName: "withdraw",
    });
  };

  if (!isConnected || !chain || isLoadingTips || !hasBalance) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md">
      <div
        className="flex items-center justify-between gap-4 rounded-xl border border-green-500/30 bg-green-500/5 px-5 py-4"
        role="region"
        aria-label="Withdrawal notification"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10"
            aria-hidden="true"
          >
            <CircleDollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <div className="text-sm font-medium">You have tips to withdraw!</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {balanceFormatted} {currencySymbol}
            </div>
          </div>
        </div>

        <Button
          onClick={handleWithdraw}
          size="sm"
          disabled={isBusy}
          aria-busy={isBusy}
          aria-describedby="withdraw-status"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {statusConfig[status].label}
          {!isBusy && <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />}
        </Button>

        {/* Screen reader status announcement */}
        <div id="withdraw-status" className="sr-only" role="status" aria-live="polite">
          {statusConfig?.[status].srText}
        </div>
      </div>
    </div>
  );
}
