interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  { value: "100%", label: "Goes to creators" },
  { value: "On-chain", label: "Transparent & verifiable" },
  { value: "Instant", label: "Withdraw anytime" },
];

export function FeatureStats() {
  return (
    <section aria-labelledby="features-heading" className="border-y border-border/40 bg-muted/30">
      <h2 id="features-heading" className="sr-only">
        Key Features
      </h2>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <li key={stat.value} className="text-center">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
