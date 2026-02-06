import { ExternalLink } from "@/app/components/shared/ExternalLink";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-muted-foreground">Built on Polygon Amoy Testnet</div>
          <nav aria-label="Footer navigation" className="flex items-center gap-6">
            <ExternalLink
              href="https://amoy.polygonscan.com/address/0x953A9a1Ea2b9e87FF287b1c2a9fc0C1345AfcCaF"
              ariaLabel="View smart contract on PolygonScan (opens in new tab)"
            >
              View Contract
            </ExternalLink>
            <ExternalLink
              href="https://github.com/SavanovicN/tipjar"
              ariaLabel="View TipJar on GitHub (opens in new tab)"
            >
              GitHub
            </ExternalLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
