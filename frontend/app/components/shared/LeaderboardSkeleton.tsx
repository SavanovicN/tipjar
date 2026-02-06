interface LeaderboardSkeletonProps {
  count?: number;
}

export function LeaderboardSkeleton({ count = 3 }: LeaderboardSkeletonProps) {
  return (
    <div
      className="mx-auto max-w-2xl space-y-3"
      role="status"
      aria-label="Loading leaderboard"
      aria-busy="true"
    >
      <span className="sr-only">Loading leaderboard data...</span>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          aria-hidden="true"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
