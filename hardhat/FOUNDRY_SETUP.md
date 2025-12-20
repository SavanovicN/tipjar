# Foundry Setup for TipJar Contract

## Overview

Foundry has been successfully set up for testing the TipJar contract. Foundry provides faster, more reliable testing compared to Hardhat's JavaScript/TypeScript test suite.

## Installation

Foundry is installed via `foundryup`:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Configuration

Foundry configuration is in `foundry.toml`:
- **Source**: `contracts/` directory
- **Solc Version**: 0.8.28
- **Optimizer**: Enabled with 200 runs
- **Libraries**: `lib/forge-std/`

## Running Tests

Run all tests:
```bash
forge test
```

Run only TipJar tests:
```bash
forge test --match-contract TipJarTest
```

Run with verbose output:
```bash
forge test -vvv
```

Run specific test:
```bash
forge test --match-test test_RegisterCreator
```

## Test Coverage

All 32 tests are passing:

### Registration Tests (7 tests)
- ✅ Register creator
- ✅ Emit CreatorRegistered event
- ✅ Revert if already registered
- ✅ Revert if name empty/too long
- ✅ Revert if description too long
- ✅ Revert if avatar empty/too long

### Tipping Tests (6 tests)
- ✅ Send tip and update totalTips
- ✅ Emit TipSent event
- ✅ Update pendingWithdrawals
- ✅ Revert if zero amount
- ✅ Revert if creator not found
- ✅ Revert if zero address

### Withdrawal Tests (4 tests)
- ✅ Withdraw accumulated tips
- ✅ Emit Withdrawal event
- ✅ Revert if not registered
- ✅ Revert if no funds

### Voting Tests (6 tests)
- ✅ Vote for creator
- ✅ Emit VoteCast event
- ✅ Prevent double voting
- ✅ Revert if creator not found
- ✅ Revert if zero address

### View Function Tests (5 tests)
- ✅ Get current week
- ✅ Get votes for specific week
- ✅ Get current week votes
- ✅ Check if user voted this week
- ✅ Get pending withdrawal

### Profile Update Tests (4 tests)
- ✅ Update profile
- ✅ Emit ProfileUpdated event
- ✅ Revert if not registered
- ✅ Validate inputs

## Advantages of Foundry

1. **Speed**: Tests run much faster (2-5ms vs seconds)
2. **Reliability**: Native Solidity testing eliminates account/event issues
3. **Gas Reporting**: Built-in gas usage reporting
4. **Fuzzing**: Built-in fuzz testing support
5. **Better Error Messages**: More detailed Solidity error messages

## Next Steps

- Add fuzz tests for edge cases
- Add invariant tests
- Add gas optimization tests
- Integrate with CI/CD pipeline

