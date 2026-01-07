# Hardhat TDD Development Guide

## Your Current Setup

- ✅ Hardhat initialized
- ✅ TypeScript configured
- ✅ Contracts directory ready
- ✅ Test directory ready

## TDD Workflow with Hardhat

### The Cycle: RED → GREEN → REFACTOR

1. **🔴 RED**: Write a failing test
2. **🟢 GREEN**: Write minimal code to pass
3. **🔵 REFACTOR**: Improve code (keep tests passing)

## Step-by-Step: Your First Test

### Step 1: Create Test File

Create: `test/TipJar.test.ts`

### Step 2: Write Your First Test

Start with something simple:

```typescript
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('TipJar', function () {
  it('Should allow sending tips', async function () {
    // Your test code here
  })
})
```

**What to test?**

- Deploy the contract
- Send a tip
- Check if tip was recorded

### Step 3: Run the Test (See it FAIL)

```bash
cd hardhat
bunx hardhat test
```

**Expected**: Test fails because contract doesn't exist yet ✅

### Step 4: Write Minimal Contract

Add to `contracts/TipJar.sol`:

- Just enough to make the test pass
- Don't add extra features yet

### Step 5: Run Test Again (See it PASS)

```bash
bunx hardhat test
```

**Expected**: Test passes ✅

### Step 6: Add More Tests

Repeat the cycle for each feature!

## Hardhat Commands You'll Use

### Compile Contracts

```bash
bunx hardhat compile
```

Compiles your Solidity contracts.

### Run Tests

```bash
bunx hardhat test
```

Runs all tests in `test/` directory.

### Run Specific Test

```bash
bunx hardhat test test/TipJar.test.ts
```

### Run Tests with Verbose Output

```bash
bunx hardhat test --verbose
```

### Start Local Blockchain

```bash
bunx hardhat node
```

Starts a local Ethereum node for testing.

## Test Structure Template

```typescript
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('TipJar', function () {
  // Setup - runs before each test
  beforeEach(async function () {
    // Deploy contract here
    // Get test accounts here
  })

  describe('Tipping', function () {
    it('Should accept tips', async function () {
      // Test code
    })

    it('Should reject zero address', async function () {
      // Test code
    })
  })

  describe('Withdrawal', function () {
    it('Should allow withdrawal', async function () {
      // Test code
    })
  })
})
```

## Getting Test Accounts

Hardhat provides test accounts automatically:

```typescript
const [owner, tipper, creator] = await ethers.getSigners()
```

These are pre-funded with test ETH.

## Sending MATIC in Tests

```typescript
await tipJar.connect(tipper).tipCreator(creator.address, {
  value: ethers.parseEther('0.1'), // 0.1 MATIC
})
```

## Checking Values

```typescript
const tips = await tipJar.tips(creator.address)
expect(tips).to.equal(ethers.parseEther('0.1'))
```

## Testing Reverts

```typescript
await expect(
  tipJar.tipCreator(ethers.ZeroAddress, { value: ethers.parseEther('0.1') })
).to.be.revertedWith('Invalid address')
```

## Your Next Steps

1. **Create** `test/TipJar.test.ts`
2. **Write** your first test (describe what you want)
3. **Run** `bunx hardhat test` (see it fail)
4. **Write** minimal contract code
5. **Run** test again (see it pass)
6. **Repeat** for next feature

## Tips

- ✅ Write tests first (TDD!)
- ✅ One test = one thing
- ✅ Test should fail first, then pass
- ✅ Keep tests simple
- ✅ Test edge cases (zero address, zero amount, etc.)

Start by creating your first test file and writing one simple test!
