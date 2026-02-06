import { ConnectButton } from "@/app/components/shared/ConnectButton";
import { ExternalLink, GithubIcon } from "@/app/components/shared/ExternalLink";

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden pt-32 pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-muted-foreground">Live on Polygon Amoy Testnet</span>
          </div>

          <h1
            id="hero-heading"
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Support creators{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              on-chain
            </span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            Send tips directly to your favorite creators. No middlemen, no fees beyond gas. Every
            tip is recorded on the blockchain, forever.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <ConnectButton />
            <ExternalLink
              href="https://github.com/SavanovicN/tipjar"
              ariaLabel="View TipJar source code on GitHub (opens in a new tab)"
              variant="button"
              icon={<GithubIcon />}
            >
              View on GitHub
            </ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
}
