# TipJar Frontend

Next.js web app for the TipJar dApp — send tips to creators on-chain.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [wagmi v3](https://wagmi.sh/) | Wallet connection & contract hooks |
| [Viem](https://viem.sh/) | TypeScript Ethereum library |
| [TanStack Query](https://tanstack.com/query) | Async state, caching, polling |
| [TanStack Form](https://tanstack.com/form) | Type-safe forms with Zod |
| [Zod](https://zod.dev/) | Runtime schema validation |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI components |
| [Biome](https://biomejs.dev/) | Linting & formatting |

## Setup

```bash
cd frontend
bun install
cp .env.example .env.local
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_USE_LOCAL_NETWORK` | `false` | `true` to use local Hardhat node |
| `NEXT_PUBLIC_LOCAL_RPC_URL` | `http://127.0.0.1:8545` | Local RPC endpoint |
| `NEXT_PUBLIC_RPC_URL` | Public Amoy RPC | Production RPC (Alchemy, Infura, etc.) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | — | Enables WalletConnect (optional) |
| `NEXT_PUBLIC_APP_URL` | `https://tipjar.local` | App URL for WalletConnect metadata |

## Development

### Local (with Hardhat)

Make sure the Hardhat node is running and the contract is deployed (see root README), then:

```bash
NEXT_PUBLIC_USE_LOCAL_NETWORK=true bun dev
```

### Production (Polygon Amoy)

Without any env vars, the app defaults to Polygon Amoy Testnet with a public RPC:

```bash
bun dev
```

For better reliability, set a dedicated RPC:

```env
NEXT_PUBLIC_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
```

## Connecting MetaMask

### Local Hardhat Network

1. Open MetaMask → Settings → Networks → Add Network
2. Fill in:
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency:** ETH
3. Import a Hardhat test account (private key from the node output)
4. Click "Connect Wallet" in the app

### Polygon Amoy Testnet

1. Open MetaMask → Settings → Networks → Add Network
2. Fill in:
   - **Network Name:** Polygon Amoy
   - **RPC URL:** `https://polygon-amoy-bor-rpc.publicnode.com`
   - **Chain ID:** `80002`
   - **Currency:** POL
   - **Explorer:** `https://amoy.polygonscan.com`
3. Get test POL from the [Polygon Faucet](https://faucet.polygon.technology/)
4. Click "Connect Wallet" in the app

## Key Architecture Notes

- **Block-based polling** for tip events (more reliable than `eth_getFilterChanges` on public RPCs)
- **Environment-based network switching** via `NEXT_PUBLIC_USE_LOCAL_NETWORK`
- **WalletConnect is opt-in** — only enabled when `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- **Contract ABI** lives in `web3/abi/TipJar.json` — copied from Hardhat build artifacts so the frontend is self-contained

## Project Structure

```
frontend/
├── app/
│   ├── components/        # Feature components (TipForm, Leaderboard, etc.)
│   │   └── shared/        # Reusable UI (Header, Footer, BalanceDisplay)
│   ├── providers/         # wagmi, TanStack Query, theme providers
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/ui/         # shadcn/ui primitives
├── lib/
│   ├── hooks/             # useTipEvents, useChainInfo, useTipTransaction
│   ├── errors.ts          # Transaction error classification
│   ├── utils.ts           # Helpers (cn, truncateAddress, etc.)
│   └── validation.ts      # Zod schemas
├── web3/
│   ├── abi/TipJar.json    # Contract ABI (from hardhat compile)
│   ├── chains.ts          # Polygon Amoy chain definition
│   ├── contract.ts        # ABI re-export, addresses, deploy blocks
│   └── wagmi.config.ts    # wagmi config (local vs prod)
└── e2e/                   # Playwright tests
```

## Scripts

```bash
bun dev              # Dev server
bun build            # Production build
bun start            # Serve production build
bun lint             # Lint (Biome)
bun lint:fix         # Lint & auto-fix (Biome)
bun format           # Format (Biome)
bun test             # Unit tests (Vitest)
bun test:watch       # Unit tests in watch mode
bun test:e2e         # E2E tests (Playwright)
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "RPC connection failed" | Ensure Hardhat node is running and `NEXT_PUBLIC_USE_LOCAL_NETWORK=true` |
| "filter not found" in console | Normal on public RPCs — app uses block polling as fallback |
| Transaction stuck | Check MetaMask for pending txs; Hardhat auto-mines |
| Contract address mismatch | Update `LOCALHOST_ADDRESS` in `web3/contract.ts` after redeployment |
