# Solidity Basics for TipJar Contract

## 1. Structs

**What is a struct?**
A struct is a custom data type that groups related variables together. Think of it like an object in JavaScript or a class in other languages.

**Example:**
```solidity
struct Creator {
    string name;
    string description;
    uint256 totalTips;      // Total MATIC received
    uint256 voteCount;      // Votes this week
    address creatorAddress; // Wallet address
    bool isRegistered;      // Whether they're registered
}
```

**Why use structs?**
- Organize related data together
- Make code more readable
- Easy to pass around as a single unit

**In your TipJar contract:**
You'll use a struct to store creator information (name, description, tips received, votes, etc.)

---

## 2. Mappings

**What is a mapping?**
A mapping is like a dictionary or hash table. It stores key-value pairs.

**Syntax:**
```solidity
mapping(address => Creator) public creators;
```

**What this means:**
- **Key**: `address` (wallet address)
- **Value**: `Creator` (struct with creator info)
- **Usage**: `creators[0x123...]` returns the Creator struct for that address

**Example usage:**
```solidity
// Store creator info
creators[msg.sender] = Creator({
    name: "Alice",
    description: "Web3 developer",
    totalTips: 0,
    voteCount: 0,
    creatorAddress: msg.sender,
    isRegistered: true
});

// Retrieve creator info
Creator memory alice = creators[0x123...];
uint256 tips = alice.totalTips;
```

**Why use mappings?**
- Fast lookups (O(1) complexity)
- Efficient storage
- Perfect for associating addresses with data

**In your TipJar contract:**
You'll use `mapping(address => Creator)` to store creator profiles by their wallet address.

---

## 3. Events

**What are events?**
Events are logs emitted by the contract that external applications (like your frontend) can listen to. They're like notifications.

**Syntax:**
```solidity
event TipSent(address indexed from, address indexed to, uint256 amount);
```

**Key points:**
- `indexed` keyword allows filtering by that parameter
- Events are stored in transaction logs (not in contract storage)
- Frontend can listen to events in real-time

**Example:**
```solidity
// Emit event when tip is sent
event TipSent(address indexed from, address indexed to, uint256 amount);

function tipCreator(address creatorAddress) external payable {
    // ... tip logic ...
    
    // Emit event
    emit TipSent(msg.sender, creatorAddress, msg.value);
}
```

**Why use events?**
- **Real-time updates**: Frontend can listen for new tips
- **Gas efficient**: Cheaper than storing data
- **History**: Can query past events
- **Decentralized notifications**: No need for a server

**In your TipJar contract:**
You'll emit events like:
- `TipSent` - when someone sends a tip
- `VoteCast` - when someone votes
- `CreatorRegistered` - when a creator registers

---

## 4. Payable Functions

**What is a payable function?**
A function that can receive MATIC (or ETH) when called. The `payable` keyword allows the function to accept native tokens.

**Syntax:**
```solidity
function tipCreator(address creatorAddress) external payable {
    // msg.value contains the MATIC sent
    uint256 tipAmount = msg.value;
    
    // Transfer MATIC to creator
    payable(creatorAddress).transfer(msg.value);
}
```

**Key points:**
- `payable` keyword allows receiving tokens
- `msg.value` contains the amount sent (in wei)
- `msg.sender` is the address sending the transaction
- Must handle the received MATIC (transfer, store, etc.)

**Example:**
```solidity
// User calls: tipCreator(creatorAddress) with 0.1 MATIC
function tipCreator(address creatorAddress) external payable {
    require(msg.value > 0, "Must send MATIC");
    require(creators[creatorAddress].isRegistered, "Creator not found");
    
    // Update creator's total tips
    creators[creatorAddress].totalTips += msg.value;
    
    // Emit event
    emit TipSent(msg.sender, creatorAddress, msg.value);
}
```

**Why use payable functions?**
- Accept payments/tips
- Handle native token transfers
- Enable value exchange on-chain

**In your TipJar contract:**
The `tipCreator()` function will be payable so users can send MATIC tips.

---

## 5. Time-Based Logic

**What is time-based logic?**
Using blockchain timestamps to implement time-dependent features (like weekly resets).

**Key concept: `block.timestamp`**
- Current Unix timestamp (seconds since Jan 1, 1970)
- Set by miners/validators
- Can be manipulated slightly (±15 seconds), but generally reliable

**Example: Weekly Voting Reset**
```solidity
uint256 public constant WEEK_IN_SECONDS = 7 days; // 604800 seconds
uint256 public currentWeekStart;

function getCurrentWeek() public view returns (uint256) {
    return (block.timestamp / WEEK_IN_SECONDS) * WEEK_IN_SECONDS;
}

function checkAndResetWeek() internal {
    uint256 currentWeek = getCurrentWeek();
    
    if (currentWeek != currentWeekStart) {
        // New week started - reset votes
        resetWeeklyVotes();
        currentWeekStart = currentWeek;
    }
}
```

**Time calculations:**
```solidity
// Solidity has built-in time units
1 seconds
1 minutes  // = 60 seconds
1 hours    // = 3600 seconds
1 days     // = 86400 seconds
1 weeks    // = 604800 seconds

// Example: 1 week ago
uint256 oneWeekAgo = block.timestamp - 1 weeks;
```

**Why use time-based logic?**
- Weekly voting resets
- Time-locked features
- Expiration dates
- Scheduled events

**In your TipJar contract:**
You'll use `block.timestamp` to:
- Track current week
- Reset votes weekly
- Determine when a new week starts

---

## Putting It All Together

Here's a simplified example combining all concepts:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TipJar {
    // Struct
    struct Creator {
        string name;
        string description;
        uint256 totalTips;
        uint256 voteCount;
        bool isRegistered;
    }
    
    // Mapping
    mapping(address => Creator) public creators;
    
    // Events
    event CreatorRegistered(address indexed creator, string name);
    event TipSent(address indexed from, address indexed to, uint256 amount);
    event VoteCast(address indexed voter, address indexed creator);
    
    // Time-based
    uint256 public constant WEEK_IN_SECONDS = 7 days;
    uint256 public currentWeekStart;
    
    // Payable function
    function tipCreator(address creatorAddress) external payable {
        require(msg.value > 0, "Must send MATIC");
        require(creators[creatorAddress].isRegistered, "Creator not found");
        
        // Update total tips
        creators[creatorAddress].totalTips += msg.value;
        
        // Emit event
        emit TipSent(msg.sender, creatorAddress, msg.value);
    }
    
    // Regular function
    function registerCreator(string memory name, string memory description) external {
        require(!creators[msg.sender].isRegistered, "Already registered");
        
        creators[msg.sender] = Creator({
            name: name,
            description: description,
            totalTips: 0,
            voteCount: 0,
            isRegistered: true
        });
        
        emit CreatorRegistered(msg.sender, name);
    }
    
    // View function (read-only, no gas cost)
    function getCreatorProfile(address creatorAddress) external view returns (Creator memory) {
        return creators[creatorAddress];
    }
}
```

---

## Key Takeaways

1. **Structs** = Custom data types to group related info
2. **Mappings** = Key-value storage (like dictionaries)
3. **Events** = Logs for frontend to listen to
4. **Payable** = Functions that can receive MATIC
5. **block.timestamp** = Current time for time-based logic

---

## Next Steps

Now that you understand these concepts, you can:
1. Design your TipJar contract structure
2. Plan what data you need to store
3. Decide what events to emit
4. Figure out how weekly voting will work

