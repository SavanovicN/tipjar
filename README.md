# Tip Jar dApp

A community tip jar dApp where users can send tips to creators/contributors and vote on the best contributions each week.

## 🚀 Project Overview

**Network:** Polygon Amoy Testnet  
**Stack:** Next.js 16, TypeScript, Hardhat, web3.js, viem  
**Runtime:** Bun  
**Linting/Formatting:** Biome

## 📁 Project Structure

```
web-3/
├── hardhat/            # Hardhat project (Smart Contracts)
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment scripts
│   ├── test/           # Contract tests
│   └── hardhat.config.ts
├── frontend/           # Next.js app (Frontend)
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Utilities & Web3 integration
│   └── package.json
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Smart Contracts
- **Hardhat** - Development environment
- **Solidity** - Smart contract language
- **TypeScript** - Type safety

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **web3.js** - Ethereum JavaScript API
- **viem** - TypeScript Ethereum library
- **Biome** - Linting and formatting

### Tools
- **Bun** - Runtime and package manager
- **Git** - Version control

## 🚦 Getting Started

### Prerequisites

- Bun >= 1.0.0
- Node.js >= 20.9.0
- Git
- MetaMask with Polygon Amoy Testnet configured
- Test MATIC in wallet

### Installation

1. **Setup Contracts:**
   ```bash
   cd hardhat
   bunx hardhat init
   bun install
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   bunx create-next-app@latest .
   bun install
   ```

3. **Install Web3 Dependencies:**
   ```bash
   cd frontend
   bun add web3 viem
   ```

## 📝 Development

### Smart Contracts

```bash
cd hardhat
bunx hardhat compile    # Compile contracts
bunx hardhat test       # Run tests
bunx hardhat node       # Local testnet
```

### Frontend

```bash
cd frontend
bun dev                 # Start dev server
bun build               # Build for production
```

## 🧪 Testing

- Contract tests: `cd hardhat && bunx hardhat test`
- Frontend: Manual testing with MetaMask

## 📚 Resources

- [Polygon Amoy Testnet](https://docs.polygon.technology/docs/develop/getting-started/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [web3.js Documentation](https://web3js.readthedocs.io/)
- [viem Documentation](https://viem.sh/)

## 📄 License

MIT

