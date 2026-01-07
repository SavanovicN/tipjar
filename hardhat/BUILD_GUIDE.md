# TipJar Contract - Step by Step Build Guide

Let's build your TipJar contract together! We'll start simple and add features one by one.

## Step 1: Basic Structure ✅

Create `hardhat/contracts/TipJar.sol` and add:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TipJar {
    // We'll add code here step by step
}
```

## Step 2: Add a Mapping to Track Tips

Add this inside your contract:

```solidity
mapping(address => uint256) public tips;
```

This stores how much MATIC each creator has received.

## Step 3: Add Function to Send Tips

Add a payable function that accepts MATIC:

```solidity
function tipCreator(address creator) public payable {
    // Add the sent amount to creator's tips
    tips[creator] += msg.value;
}
```

## Step 4: Add Function to Withdraw

Add a function for creators to withdraw their tips:

```solidity
function withdraw() public {
    // Get the amount this creator can withdraw
    uint256 amount = tips[msg.sender];

    // Make sure they have something to withdraw
    require(amount > 0, "No tips to withdraw");

    // Reset their balance
    tips[msg.sender] = 0;

    // Send them the MATIC
    payable(msg.sender).transfer(amount);
}
```

## Step 5: Add Events (Optional but Recommended)

Add events to track what's happening:

```solidity
event TipSent(address indexed from, address indexed to, uint256 amount);
event Withdrawal(address indexed creator, uint256 amount);
```

Then emit them in your functions.

## Next Steps

After you have the basic contract:

1. Compile it: `bunx hardhat compile`
2. Test it: Write simple tests
3. Add more features (registration, voting, etc.)

Let's start! Open `hardhat/contracts/TipJar.sol` and add Step 1 (the basic structure).
