export function BalanceDisplay({
  balance,
  currencySymbol,
  insufficientFunds,
}: {
  balance: string;
  currencySymbol: string | undefined;
  insufficientFunds: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
        insufficientFunds ? "bg-destructive/10 border border-destructive/50" : "bg-muted/50"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-sm text-muted-foreground">Your Balance</span>
      <span className={`font-mono font-medium ${insufficientFunds ? "text-destructive" : ""}`}>
        {balance} {currencySymbol}
      </span>
    </div>
  );
}
