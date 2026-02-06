import { LeaderboardTabs } from "./LeaderboardTabs";

export function LeaderboardSection() {
  return (
    <section aria-labelledby="leaderboard-heading" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <h2
            id="leaderboard-heading"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Leaderboard
          </h2>
          <p className="text-muted-foreground">
            See who is leading the way in the TipJar community
          </p>
        </div>

        <LeaderboardTabs />
      </div>
    </section>
  );
}
