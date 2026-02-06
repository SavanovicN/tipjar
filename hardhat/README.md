# TipJar Smart Contracts

Solidity contracts for the TipJar dApp — a decentralized tipping platform on Polygon Amoy.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Hardhat 3](https://hardhat.org/) | Ethereum dev environment |
| [Viem](https://viem.sh/) | TypeScript Ethereum library |
| [Hardhat Ignition](https://hardhat.org/ignition) | Declarative deployments |
| Solidity 0.8.28 | Smart contract language |

## Setup

```bash
cd hardhat
bun install
cp .env.example .env
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POLYGON_AMOY_RPC_URL` | For Amoy deploy | Polygon Amoy RPC endpoint |
| `POLYGON_AMOY_PRIVATE_KEY` | For Amoy deploy | Deployer wallet private key |

> Only needed when deploying to Amoy testnet. Local development works without env vars.

## Usage

### Run tests

```bash
# From project root
bun run contracts:test

# Or directly
npx tsx --test test/*.test.ts
```

### Start local node

```bash
npx hardhat node
```

### Deploy locally

```bash
npx hardhat ignition deploy ignition/modules/TipJar.ts --network localhost
```

### Deploy to Polygon Amoy

Set `POLYGON_AMOY_RPC_URL` and `POLYGON_AMOY_PRIVATE_KEY` in `.env`, then:

```bash
npx hardhat ignition deploy ignition/modules/TipJar.ts --network amoy
```

## Contract: TipJar.sol

A simple tipping contract where users can:

- **`tipCreator(address)`** — Send ETH/POL to a creator (payable)
- **`withdraw()`** — Creator withdraws accumulated tips (EOA only)
- **`tips(address)`** — View a creator's balance

Events: `TipSent(tipper, creator, amount)`, `Withdrawal(creator, amount)`

## Connecting MetaMask for Local Dev

After running `npx hardhat node`, add the local network to MetaMask:

| Field | Value |
|-------|-------|
| Network Name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | ETH |

Import a test account using the private key shown in the Hardhat node output:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Key:        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> **Never use Hardhat test keys on mainnet.**

## Solidity Profiles

| Profile | Optimizer | Use Case |
|---------|-----------|----------|
| `default` | Disabled | Development & testing |
| `production` | Enabled (200 runs) | Deployment |

```bash
npx hardhat compile --profile production
```

## Project Structure

```
hardhat/
├── contracts/
│   ├── TipJar.sol                 # Main contract
│   └── test/AttackerContract.sol  # Security test helper
├── ignition/modules/TipJar.ts     # Deployment module
├── test/TipJar.test.ts            # Integration tests
├── hardhat.config.ts              # Hardhat config
└── .env.example                   # Env vars template
```
