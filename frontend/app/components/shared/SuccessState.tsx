import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 py-8 text-center"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
        aria-hidden="true"
      >
        <Check className="h-8 w-8 text-green-500" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Tip Sent Successfully!</h3>
        <p className="mt-1 text-sm text-muted-foreground">Your tip has been sent to the creator.</p>
      </div>
      <Button onClick={onReset} variant="outline">
        Send Another Tip
      </Button>
    </div>
  );
}
