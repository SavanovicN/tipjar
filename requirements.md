# Web3 Frontend Learning Project: Tip Jar dApp

## The Story

Build a **community tip jar** where users can send tips to creators/contributors and vote on the best contributions each week. Think of it as a decentralized "buy me a coffee" meets simple governance.

**Network:** Polygon Amoy Testnet (easy faucets, fast, cheap)  
**Timeline:** ~4 weeks  
**Stack:** Next.js, TypeScript, web3.js, viem  
**Tooling:** Hardhat (via bunx), Bun runtime, Biome (linting/formatting)

---

## The Concept

**User Journey:**
1. Creators register their profile (stored on-chain)
2. Anyone can send tips (in MATIC) to any creator
3. Each week, the community votes on "Creator of the Week"
4. Winner gets a special badge on their profile
5. Public leaderboard shows top tipped creators and voting results

**Why this works:**
- Simple enough for beginners
- Teaches all core Web3 concepts
- Has a clear purpose users understand
- Room for creativity and expansion

---

## Technical Requirements

### Smart Contract (Solidity)
You'll need to deploy a simple contract with:
- `registerCreator(name, description)` - register as a creator
- `tipCreator(creatorAddress)` - send MATIC tips
- `voteForCreator(creatorAddress)` - vote for creator of the week
- `getCreatorProfile(address)` - read creator data
- Events for tips and votes (for real-time updates)

**Research:** How to handle payable functions, mappings, events, and time-based logic (weekly votes)

### Frontend (Next.js + TypeScript)

**Core pages:**
1. **Home** - List of creators with tip buttons
2. **Creator Profile** - Individual creator page with tip history
3. **Leaderboard** - Top creators by tips received and votes
4. **My Profile** - Register/edit your creator profile

**Must implement with BOTH web3.js AND viem:**
- Wallet connection (compare how each library handles it)
- Read contract state (get creator list, profile data)
- Write transactions (tip, vote, register)
- Listen to events (real-time tip notifications)
- Format values (wei to MATIC, addresses, dates)

**Research topics:**
- Provider setup and wallet detection
- Contract ABIs and how to generate types
- Transaction signing and gas estimation
- Event logs and filtering
- Error handling (user rejected, insufficient funds, etc.)
- React hooks for Web3 state management

---

## Key Learning Goals

1. **Wallet Integration**
   - Connect MetaMask/Wallet injected providers
   - Handle account/network changes
   - Show connection state in UI

2. **Reading Blockchain Data**
   - Query contract state (creator profiles, votes)
   - Fetch past events (tip history)
   - Cache and refresh data appropriately

3. **Writing Transactions**
   - Send tips (payable function)
   - Vote for creators
   - Register profile
   - Show tx status (pending → confirmed → success/error)

4. **Understanding web3.js vs viem**
   - Different syntax for same operations
   - Type safety differences
   - Performance considerations
   - When to use which library

---

## Optional Enhancements

If time permits or to stand out:
- ENS name resolution for addresses
- IPFS for creator avatars/images
- Chart showing tip trends over time
- Weekly winner announcement modal
- Share tip receipt on Twitter
- Connect with WalletConnect for mobile

---

## Development Setup (MANDATORY)

**Required tooling:**
- **Bun** - Use Bun as your runtime and package manager (faster than npm/yarn)
- **Biome** - For linting and formatting (replaces ESLint + Prettier)
- **Hardhat with bunx** - Smart contract development and deployment
  ```bash
  bunx hardhat init
  bunx hardhat compile
  bunx hardhat test
  ```

**Why this stack:**
- Bun is significantly faster for installs and running scripts
- Biome provides a single, fast tool for code quality
- Hardhat via bunx means no global installs, always latest version
- Modern tooling experience from day one

## Resources to Explore

**Get started:**
- Polygon Amoy faucet: google "polygon amoy faucet"
- Hardhat documentation (focus on TypeScript setup)
- web3.js docs & viem docs (compare side-by-side)
- Biome setup guide for Next.js

**What to figure out:**
- How do you structure a Next.js app with Web3?
- Where do you store contract addresses and ABIs?
- How do you handle async wallet operations in React?
- What's the best way to show transaction progress?
- How do you test without spending real money?
- How to integrate Hardhat artifacts with your frontend?

---

## Success Metrics

- Deployed contract on Polygon Amoy via Hardhat
- Working wallet connection
- Can send tips and see them reflected immediately
- Can vote and register as creator
- Real-time event listening works
- Clean TypeScript types for all contract calls
- Comparison examples using web3.js AND viem
- Deployed frontend on Vercel
- Biome config with zero linting errors
- Good README explaining the project

**Portfolio value:** Shows you understand wallet connections, contract interactions, transaction flows, and can work with modern Web3 tooling.