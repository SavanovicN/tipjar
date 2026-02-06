import { truncateAddress } from "@/lib/utils";

type GradientVariant = "purple" | "amber";

interface LeaderboardItemProps {
  rank: number;
  address: string;
  subtitle: string;
  amount: string;
  amountLabel: string;
  gradient?: GradientVariant;
  highlightAmount?: boolean;
}

const gradientClasses: Record<GradientVariant, string> = {
  purple: "from-violet-500/20 to-fuchsia-500/20",
  amber: "from-amber-500/20 to-orange-500/20",
};

const rankLabels: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "🥇", label: "First place" },
  2: { emoji: "🥈", label: "Second place" },
  3: { emoji: "🥉", label: "Third place" },
};

export function LeaderboardItem({
  rank,
  address,
  subtitle,
  amount,
  amountLabel,
  gradient = "purple",
  highlightAmount = false,
}: LeaderboardItemProps) {
  const rankInfo = rankLabels[rank];
  const displayRank = rankInfo?.emoji ?? rank;

  const ariaLabel = () => {
    const rankText = rankInfo?.label ?? `Rank ${rank}`;
    return `${rankText}: ${truncateAddress(address)}, ${amountLabel}: ${amount}`;
  };

  return (
    <article
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
      aria-label={ariaLabel()}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradientClasses[gradient]} text-lg font-bold`}
        aria-hidden="true"
      >
        {displayRank}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm truncate">{truncateAddress(address)}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>

      <div className="text-right">
        <div
          className={`font-medium ${highlightAmount ? "text-green-600 dark:text-green-400" : ""}`}
        >
          {amount}
        </div>
        <div className="text-xs text-muted-foreground">{amountLabel}</div>
      </div>
    </article>
  );
}
