# Test-Driven Development (TDD) Guide for TipJar

## What is TDD?

**Test-Driven Development** = Write tests FIRST, then write code to make tests pass.

### TDD Cycle:

1. 🔴 **RED**: Write a failing test
2. 🟢 **GREEN**: Write minimal code to make test pass
3. 🔵 **REFACTOR**: Improve the code
4. Repeat!

## Why TDD for Smart Contracts?

- ✅ **Safety**: Catch bugs before deployment
- ✅ **Clarity**: Tests document what your contract should do
- ✅ **Confidence**: Know your code works
- ✅ **Design**: Tests help you think about the API first

## TDD Setup for Hardhat

### Step 1: Initialize Hardhat (if not done)

```bash
cd hardhat
bunx hardhat init
# Choose: TypeScript, yes to everything
```

### Step 2: Install Dependencies

```bash
bun install
```

### Step 3: Create Test File FIRST

Create `hardhat/test/TipJar.test.ts` BEFORE writing the contract!

## TDD Example: Let's Build TipJar

### 🔴 Step 1: Write Failing Test

Create `test/TipJar.test.ts`:

```typescript
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('TipJar', function () {
  it('Should allow sending tips', async function () {
    // Deploy contract
    const TipJar = await ethers.getContractFactory('TipJar')
    const tipJar = await TipJar.deploy()

    // Get test accounts
    const [owner, tipper, creator] = await ethers.getSigners()

    // Send 0.1 MATIC tip
    await tipJar.connect(tipper).tipCreator(creator.address, {
      value: ethers.parseEther('0.1'),
    })

    // Check if tip was recorded
    const tips = await tipJar.tips(creator.address)
    expect(tips).to.equal(ethers.parseEther('0.1'))
  })
})
```

**This test will FAIL** because contract doesn't exist yet!

### 🟢 Step 2: Write Minimal Contract to Pass

Now write `contracts/TipJar.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TipJar {
    mapping(address => uint256) public tips;

    function tipCreator(address creator) public payable {
        tips[creator] += msg.value;
    }
}
```

Run test: `bunx hardhat test`
**Test should PASS!** ✅

### 🔴 Step 3: Add Another Test

Add test for withdrawal:

```typescript
it('Should allow creators to withdraw tips', async function () {
  const TipJar = await ethers.getContractFactory('TipJar')
  const tipJar = await TipJar.deploy()
  const [owner, tipper, creator] = await ethers.getSigners()

  // Send tip
  await tipJar.connect(tipper).tipCreator(creator.address, {
    value: ethers.parseEther('0.5'),
  })

  // Withdraw
  await tipJar.connect(creator).withdraw()

  // Check balance is zero
  const tips = await tipJar.tips(creator.address)
  expect(tips).to.equal(0)
})
```

**This test will FAIL** - no withdraw function yet!

### 🟢 Step 4: Add Withdraw Function

Add to contract:

```solidity
function withdraw() public {
    uint256 amount = tips[msg.sender];
    require(amount > 0, "No tips to withdraw");
    tips[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
}
```

Run test again - should PASS! ✅

## TDD Workflow

### 1. Write Test First (RED)

```typescript
it('Should reject zero address', async function () {
  // Test what SHOULD happen
})
```

### 2. Run Test (See it FAIL)

```bash
bunx hardhat test
# Expected: Test fails (contract doesn't have this feature)
```

### 3. Write Code (GREEN)

```solidity
// Add minimal code to make test pass
require(creator != address(0), "Invalid address");
```

### 4. Run Test (See it PASS)

```bash
bunx hardhat test
# Expected: Test passes ✅
```

### 5. Refactor (BLUE)

```solidity
// Improve code while keeping tests passing
```

## Test Structure

```typescript
describe('TipJar', function () {
  // Setup (runs before each test)
  beforeEach(async function () {
    const TipJar = await ethers.getContractFactory('TipJar')
    this.tipJar = await TipJar.deploy()
    this.accounts = await ethers.getSigners()
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

## Quick Start: Let's Do TDD Now!

1. **First**: Create test file `test/TipJar.test.ts`
2. **Write**: One simple failing test
3. **Run**: See it fail
4. **Write**: Minimal contract code
5. **Run**: See it pass
6. **Repeat**: Add more tests, add more features

Ready to start? Let's create the first test together!
