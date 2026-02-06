"use client";

import { useMemo } from "react";
import { formatEther } from "viem";
import { aggregateByCreator, useChainInfo } from "@/lib/hooks";
import { EmptyState } from "./shared/EmptyState";
import { LeaderboardItem } from "./shared/LeaderboardItem";

const TOP_COUNT = 10;

interface TipEvent {
  tipper: string;
  creator: string;
  amount: bigint;
}

export function TopCreators({ events }: { events: TipEvent[] }) {
  const { chain } = useChainInfo();

  const creators = useMemo(() => aggregateByCreator(events).slice(0, TOP_COUNT), [events]);

  if (!chain) {
    return null;
  }

  if (!creators.length) {
    return (
      <EmptyState
        emoji="💰"
        title="No creators yet"
        description="Be the first to receive tips and appear on this list!"
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {creators.map((creator, index) => (
        <LeaderboardItem
          key={creator.address}
          rank={index + 1}
          address={creator.address}
          subtitle={`${creator.tipCount} ${creator.tipCount === 1 ? "tip" : "tips"} received`}
          amount={`${parseFloat(formatEther(creator.totalReceived)).toFixed(4)} ${chain.nativeCurrency.symbol}`}
          amountLabel="Total received"
          gradient="amber"
          highlightAmount
        />
      ))}
    </div>
  );
}
