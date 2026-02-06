"use client";

import { useMemo } from "react";
import { formatEther } from "viem";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { LeaderboardItem } from "@/app/components/shared/LeaderboardItem";
import { aggregateByTipper, useChainInfo } from "@/lib/hooks";

const TOP_COUNT = 10;

interface TipEvent {
  tipper: string;
  creator: string;
  amount: bigint;
}

export function Leaderboard({ events }: { events: TipEvent[] }) {
  const { chain } = useChainInfo();

  const tippers = useMemo(() => aggregateByTipper(events).slice(0, TOP_COUNT), [events]);

  if (!chain) return null;

  if (tippers.length === 0) {
    return (
      <EmptyState
        emoji="🏆"
        title="No tips yet"
        description="Be the first to tip a creator and appear on the leaderboard!"
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {tippers.map((tipper, index) => (
        <LeaderboardItem
          key={tipper.address}
          rank={index + 1}
          address={tipper.address}
          subtitle={index === 0 ? "Top Supporter" : `#${index + 1} Supporter`}
          amount={`${parseFloat(formatEther(tipper.totalAmount)).toFixed(4)} ${chain.nativeCurrency.symbol}`}
          amountLabel="Total tipped"
          gradient="purple"
        />
      ))}
    </div>
  );
}
