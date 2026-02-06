import { TipCreatorForm } from "./TipCreatorForm";
import { WithdrawBanner } from "./WithdrawBanner";

export function TipSection() {
  return (
    <section aria-labelledby="tip-section-heading" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2
            id="tip-section-heading"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Send a Tip
          </h2>
          <p className="text-muted-foreground">
            Support your favorite creators with a direct on-chain tip
          </p>
        </div>

        <div className="mb-8">
          <WithdrawBanner />
        </div>

        <div className="mx-auto max-w-md">
          <TipCreatorForm />
        </div>
      </div>
    </section>
  );
}
