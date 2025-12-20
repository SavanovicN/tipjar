# TipJar Contract Design

## 🎯 Contract Overview

A community tip jar dApp where:
- Creators register profiles with avatars
- Users send MATIC tips to creators
- Community votes weekly for "Creator of the Week"

---

## 📊 Data Structures

### Creator Struct

```solidity
struct Creator {
    string name;                    // Creator's display name
    string description;             // Creator's bio/description
    string avatar;                  // Avatar URL or IPFS hash
    uint256 totalTips;              // Total MATIC received (all time)
    uint256 voteCount;              // Current week votes (can be calculated)
    address creatorAddress;         // Creator's wallet address
    bool isRegistered;              // Registration status
    uint256 registrationDate;       // When they registered (optional)
}
```

**Design Decisions:**
- ✅ Avatar: Store as string (URL or IPFS hash)
- ✅ Rating: Track totalRatings and ratingCount (calculate average: totalRatings / ratingCount)
- ✅ Vote count: Can be calculated from weeklyVotes mapping (or store separately)

---

### Mappings

```solidity
// Store creator profiles by address
mapping(address => Creator) public creators;

// Track votes per week per creator
// week number => creator address => vote count
mapping(uint256 => mapping(address => uint256)) public weeklyVotes;

// Track who voted each week (prevent double voting)
// voter address => week number => has voted
mapping(address => mapping(uint256 => bool)) public hasVoted;
```

---

## 📡 Events

```solidity
// When creator registers
event CreatorRegistered(
    address indexed creator, 
    string name,
    string avatar,
    uint256 timestamp
);

// When tip is sent
event TipSent(
    address indexed from, 
    address indexed to, 
    uint256 amount,
    uint256 timestamp
);

// When vote is cast
event VoteCast(
    address indexed voter, 
    address indexed creator, 
    uint256 week,
    uint256 timestamp
);
```

---

## 🔧 Functions

### Registration

```solidity
function registerCreator(
    string memory name,
    string memory description,
    string memory avatar
) external {
    // Validation
    require(!creators[msg.sender].isRegistered, "Already registered");
    require(bytes(name).length > 0, "Name required");
    require(bytes(name).length <= 100, "Name too long");
    require(bytes(description).length <= 500, "Description too long");
    require(bytes(avatar).length > 0, "Avatar required");
    
    // Create creator profile
    creators[msg.sender] = Creator({
        name: name,
        description: description,
        avatar: avatar,
        totalTips: 0,
        voteCount: 0, // Will be calculated from weeklyVotes
        creatorAddress: msg.sender,
        isRegistered: true,
        registrationDate: block.timestamp
    });
    
    // Emit event
    emit CreatorRegistered(msg.sender, name, avatar, block.timestamp);
}
```

---

### Tipping

```solidity
function tipCreator(address creatorAddress) external payable {
    // Validation
    require(msg.value > 0, "Must send MATIC");
    require(creatorAddress != address(0), "Invalid address");
    require(creators[creatorAddress].isRegistered, "Creator not found");
    
    // Update creator's total tips
    creators[creatorAddress].totalTips += msg.value;
    
    // Emit event
    emit TipSent(msg.sender, creatorAddress, msg.value, block.timestamp);
    
    // Note: Tips stay in contract, creator withdraws separately
    // (Withdrawal pattern for security)
}
```

---

### Voting

```solidity
function voteForCreator(address creatorAddress) external {
    // Validation
    require(creatorAddress != address(0), "Invalid address");
    require(creators[creatorAddress].isRegistered, "Creator not found");
    
    // Get current week
    uint256 currentWeek = getCurrentWeek();
    
    // Check hasn't voted this week
    require(!hasVoted[msg.sender][currentWeek], "Already voted this week");
    
    // Update votes
    weeklyVotes[currentWeek][creatorAddress]++;
    
    // Mark as voted
    hasVoted[msg.sender][currentWeek] = true;
    
    // Emit event
    emit VoteCast(msg.sender, creatorAddress, currentWeek, block.timestamp);
}
```

---

### View Functions

```solidity
// Get creator profile
function getCreatorProfile(address creatorAddress) 
    external 
    view 
    returns (Creator memory) 
{
    require(creators[creatorAddress].isRegistered, "Creator not found");
    return creators[creatorAddress];
}

// Get current week number
function getCurrentWeek() public view returns (uint256) {
    return block.timestamp / WEEK_IN_SECONDS;
}

// Get votes for creator in specific week
function getVotesForWeek(address creatorAddress, uint256 week) 
    external 
    view 
    returns (uint256) 
{
    return weeklyVotes[week][creatorAddress];
}

// Get current week votes for creator
function getCurrentWeekVotes(address creatorAddress) 
    external 
    view 
    returns (uint256) 
{
    return weeklyVotes[getCurrentWeek()][creatorAddress];
}

// Check if user has voted this week
function hasUserVotedThisWeek(address voter) 
    external 
    view 
    returns (bool) 
{
    return hasVoted[voter][getCurrentWeek()];
}
```

---

## ⚙️ Constants & State Variables

```solidity
uint256 public constant WEEK_IN_SECONDS = 7 days;
```

---

## 🤔 Design Decisions Made

### Avatar Storage
- **Decision:** Store as `string` (URL or IPFS hash)
- **Why:** Flexible - can use HTTP URLs or IPFS hashes
- **Future:** Could migrate to IPFS-only for decentralization

---

## 🔒 Security Considerations

1. **Input Validation:**
   - Check all addresses != address(0)
   - Validate string lengths
   - Validate rating range (1-5)

2. **State Validation:**
   - Check creator exists before operations
   - Prevent double voting

3. **Access Control:**
   - Anyone can register, tip, vote, rate
   - No admin functions needed (decentralized)

---

## 📝 Edge Cases Handled

1. ✅ Creator doesn't exist → Revert with error
2. ✅ Already registered → Revert
3. ✅ Already voted this week → Revert
4. ✅ Empty name/description → Revert
5. ✅ Zero tip amount → Revert
6. ✅ Invalid address → Revert

---

## 🚀 Next Steps

1. Review this design
2. Implement in TipJar.sol
3. Write tests
4. Deploy to Polygon Amoy

