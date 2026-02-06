# TipJar dApp

A decentralized tipping platform where users send tips to creators on-chain. Built on Polygon Amoy Testnet.

**Live:** [tipjar-ten.vercel.app](https://tipjar-ten.vercel.app/)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Smart Contracts | Solidity 0.8.28, Hardhat 3, Viem, Hardhat Ignition |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Biome |
| Web3 | wagmi v3, Viem, TanStack Query, Zod |
| Infrastructure | Terraform, Vercel Provider |
| Runtime | Bun (workspaces) |

## Project Structure

```
tipjar/
├── hardhat/          # Solidity contracts, tests, deployment
├── frontend/         # Next.js web app
├── infra/            # Terraform config for Vercel deployment
└── package.json      # Root workspace config
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [MetaMask](https://metamask.io/) browser extension
- Git

### 1. Install everything

```bash
git clone <repo-url> && cd tipjar
bun install
```

This installs dependencies for both `hardhat/` and `frontend/` via Bun workspaces.

### 2. Start local blockchain

```bash
bun run contracts:node
```

### 3. Deploy contract (new terminal)

```bash
cd hardhat
npx hardhat ignition deploy ignition/modules/TipJar.ts --network localhost
```

### 4. Connect MetaMask to local network

Add a custom network in MetaMask:

| Field | Value |
|-------|-------|
| Network Name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | ETH |

Import a test account using one of the private keys printed when the Hardhat node started:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Key:        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> **Never use these keys on mainnet** — they are publicly known.

### 5. Start the frontend

```bash
NEXT_PUBLIC_USE_LOCAL_NETWORK=true bun run frontend:dev
```

Open http://localhost:3000, connect MetaMask, and start tipping.

## Workspace Scripts

```bash
bun run contracts:compile   # Compile Solidity contracts
bun run contracts:test      # Run contract tests
bun run contracts:node      # Start local Hardhat node
bun run frontend:dev        # Start Next.js dev server
bun run frontend:build      # Production build
bun run frontend:lint       # Lint (Biome)
bun run frontend:lint:fix   # Lint & auto-fix (Biome)
bun run frontend:format     # Format (Biome)
```

## Environment Variables

See each sub-project's README for details:
- [`hardhat/.env.example`](hardhat/.env.example) — RPC URL and deployer key for Amoy
- [`frontend/.env.example`](frontend/.env.example) — Network config, RPC URLs, WalletConnect
- [`infra/`](infra/README.md) — Terraform/Vercel deployment config

## Roadmap

- I18N Will be implemented using next-intl in the next iteration
- Voting engine
- User/Creator profile
- Time aware leaderboards
- ...

## License

MIT
