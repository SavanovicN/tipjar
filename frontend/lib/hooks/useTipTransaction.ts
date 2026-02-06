import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { classifyTransactionError } from "@/lib/errors";
import { tipJarAbi, tipJarAddress } from "@/web3/contract";

enum TipStatus {
  IDLE = "idle",
  SIGNING = "signing",
  CONFIRMING = "confirming",
  SUCCESS = "success",
}

const statusConfig: Record<TipStatus, { label: string; srText?: string }> = {
  [TipStatus.IDLE]: { label: "Send Tip" },
  [TipStatus.SIGNING]: {
    label: "Confirm in Wallet...",
    srText: "Please confirm the transaction in your wallet.",
  },
  [TipStatus.CONFIRMING]: {
    label: "Confirming Transaction...",
    srText: "Transaction submitted. Waiting for confirmation.",
  },
  [TipStatus.SUCCESS]: { label: "Send Tip" },
};

function deriveStatus(isPending: boolean, isConfirming: boolean, isConfirmed: boolean): TipStatus {
  if (isConfirmed) return TipStatus.SUCCESS;
  if (isConfirming) return TipStatus.CONFIRMING;
  if (isPending) return TipStatus.SIGNING;
  return TipStatus.IDLE;
}

interface UseTipTransactionOptions {
  explorerUrl: string | undefined;
  onSuccess?: () => void;
}

export function useTipTransaction({ explorerUrl, onSuccess }: UseTipTransactionOptions) {
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: writeContract.data,
  });

  const status = deriveStatus(writeContract.isPending, isConfirming, isConfirmed);
  const isBusy = status !== TipStatus.IDLE;

  useEffect(() => {
    if (!writeContract.error) {
      return;
    }

    const errorInfo = classifyTransactionError(writeContract.error);
    toast.error(errorInfo.title, { description: errorInfo.description });

    writeContract.reset();
  }, [writeContract]);

  useEffect(() => {
    if (!confirmError) {
      return;
    }

    const errorInfo = classifyTransactionError(confirmError);
    toast.error(errorInfo.title, { description: errorInfo.description });
    writeContract.reset();
  }, [confirmError, writeContract]);

  useEffect(() => {
    if (!isConfirmed || !writeContract.data) {
      return;
    }

    const toastOptions: Parameters<typeof toast.success>[1] = {
      description: `Tip sent successfully!`,
    };

    if (explorerUrl) {
      toastOptions.action = {
        label: "View Transaction",
        onClick: () => window.open(`${explorerUrl}/tx/${writeContract.data}`, "_blank"),
      };
    }

    toast.success("Tip sent!", toastOptions);
    queryClient.invalidateQueries();
    onSuccess?.();
  }, [isConfirmed, explorerUrl, onSuccess, writeContract.data, queryClient]);

  const sendTip = (creatorAddress: string, amount: string) => {
    writeContract.mutate({
      address: tipJarAddress,
      abi: tipJarAbi,
      functionName: "tipCreator",
      args: [creatorAddress as `0x${string}`],
      value: parseEther(amount),
    });
  };

  const reset = () => writeContract.reset();

  return { status, statusConfig, isBusy, sendTip, reset };
}

export type { TipStatus };
