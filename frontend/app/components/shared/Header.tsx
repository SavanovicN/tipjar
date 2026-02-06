import { ConnectButton } from "@/app/components/shared/ConnectButton";
import { ThemeToggle } from "@/app/components/shared/ThemeToggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-bold">TipJar</span>
        <nav aria-label="Main navigation" className="flex items-center gap-3">
          <ThemeToggle />
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}
