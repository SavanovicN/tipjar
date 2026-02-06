"use client";

import { Loader2 } from "lucide-react";
import { useConnect, useConnectors } from "wagmi";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  isConnected,
  isBusy,
  disabled,
  label,
}: {
  isConnected: boolean;
  isBusy: boolean;
  disabled: boolean;
  label: string;
}) {
  const { mutate: connect } = useConnect();
  const connectors = useConnectors();

  if (!isConnected) {
    return (
      <Button
        type="button"
        size="lg"
        className="w-full h-12"
        onClick={() => connect({ connector: connectors[0] })}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button type="submit" size="lg" className="w-full h-12" disabled={disabled} aria-busy={isBusy}>
      {isBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {label}
    </Button>
  );
}
