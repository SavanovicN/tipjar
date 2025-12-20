# Weekly Voting Approaches - Best Practices & Real-World Examples

## 🎯 The Problem

You need to:
1. Track votes per week
2. Reset votes when a new week starts
3. Determine the weekly winner
4. Handle week boundaries efficiently

---

## 📊 Three Main Approaches

### Approach 1: Epoch-Based (Week Number) ⭐ Recommended

**Concept:** Calculate week number from timestamp, store votes per week number.

**How it works:**
```solidity
uint256 public constant WEEK_IN_SECONDS = 7 days;

// Calculate current week number
function getCurrentWeek() public view returns (uint256) {
    return block.timestamp / WEEK_IN_SECONDS;
}

// Store votes per week per creator
mapping(uint256 => mapping(address => uint256)) public weeklyVotes;

function voteForCreator(address creatorAddress) external {
    uint256 currentWeek = getCurrentWeek();
    weeklyVotes[currentWeek][creatorAddress]++;
    emit VoteCast(msg.sender, creatorAddress, currentWeek);
}
```

**Pros:**
- ✅ No reset needed - just track by week number
- ✅ Can query historical weeks
- ✅ Simple logic
- ✅ Gas efficient (no loops)

**Cons:**
- ⚠️ Storage grows over time (but minimal)
- ⚠️ Need to query specific week

**Real-world example:** Gitcoin Grants (quarterly rounds), Uniswap governance epochs

---

### Approach 2: Timestamp-Based (Week Start Tracking)

**Concept:** Track when current week started, reset votes when week changes.

**How it works:**
```solidity
uint256 public constant WEEK_IN_SECONDS = 7 days;
uint256 public currentWeekStart;
mapping(address => uint256) public voteCount; // Current week only

function voteForCreator(address creatorAddress) external {
    checkAndResetWeek(); // Check if new week started
    voteCount[creatorAddress]++;
    emit VoteCast(msg.sender, creatorAddress);
}

function checkAndResetWeek() internal {
    uint256 currentWeek = (block.timestamp / WEEK_IN_SECONDS) * WEEK_IN_SECONDS;
    
    if (currentWeek != currentWeekStart) {
        // New week - reset all votes
        resetAllVotes(); // This is expensive!
        currentWeekStart = currentWeek;
    }
}
```

**Pros:**
- ✅ Always shows current week
- ✅ Simple queries (no week parameter)

**Cons:**
- ❌ Expensive reset (must loop through all creators)
- ❌ Can't query historical weeks
- ❌ Gas cost increases with more creators

**Real-world example:** Rarely used due to gas costs

---

### Approach 3: Separate Weekly State (Hybrid)

**Concept:** Track current week + store weekly snapshots.

**How it works:**
```solidity
uint256 public currentWeek;
mapping(uint256 => mapping(address => uint256)) public weeklyVotes;
mapping(uint256 => address) public weeklyWinners; // Store winner per week

function voteForCreator(address creatorAddress) external {
    uint256 week = getCurrentWeek();
    
    // Auto-update week if needed
    if (week > currentWeek) {
        // New week - determine and store previous week's winner
        weeklyWinners[currentWeek] = getWeeklyWinner(currentWeek);
        currentWeek = week;
    }
    
    weeklyVotes[week][creatorAddress]++;
    emit VoteCast(msg.sender, creatorAddress, week);
}
```

**Pros:**
- ✅ Historical data preserved
- ✅ Can track weekly winners
- ✅ Efficient queries
- ✅ No expensive resets

**Cons:**
- ⚠️ Slightly more complex logic

**Real-world example:** Compound governance, Aave governance

---

## 🌍 Real-World Examples

### 1. **Gitcoin Grants** (Quarterly Rounds)
- Uses epoch-based approach
- Each round has a number (1, 2, 3...)
- Votes tracked per round
- Can query historical rounds
- **Why:** Need to preserve voting history for transparency

### 2. **Snapshot Voting** (Time-Based Proposals)
- Uses timestamp-based approach
- Proposals have start/end times
- Votes reset when proposal ends
- **Why:** Each proposal is independent

### 3. **Uniswap Governance** (Epochs)
- Uses epoch-based approach
- Governance periods tracked by epoch number
- Historical epochs queryable
- **Why:** Need governance history and transparency

### 4. **Compound/Aave Governance** (Proposal Periods)
- Uses hybrid approach
- Track current period + historical periods
- Store winners per period
- **Why:** Need both current state and historical data

---

## 💡 Recommendation for TipJar

**Use Approach 1 (Epoch-Based) or Approach 3 (Hybrid)**

### Why Epoch-Based is Best for TipJar:

1. **Gas Efficient** - No expensive resets
2. **Historical Data** - Can show past weeks' winners
3. **Simple Logic** - Just calculate week number
4. **Scalable** - Works with any number of creators
5. **Transparent** - All historical data preserved

### Implementation Example:

```solidity
contract TipJar {
    uint256 public constant WEEK_IN_SECONDS = 7 days;
    
    // Track votes per week per creator
    mapping(uint256 => mapping(address => uint256)) public weeklyVotes;
    
    // Track weekly winners (optional)
    mapping(uint256 => address) public weeklyWinners;
    
    // Get current week number
    function getCurrentWeek() public view returns (uint256) {
        return block.timestamp / WEEK_IN_SECONDS;
    }
    
    // Vote for creator
    function voteForCreator(address creatorAddress) external {
        require(creators[creatorAddress].isRegistered, "Creator not found");
        
        uint256 currentWeek = getCurrentWeek();
        weeklyVotes[currentWeek][creatorAddress]++;
        
        emit VoteCast(msg.sender, creatorAddress, currentWeek);
    }
    
    // Get votes for creator in specific week
    function getVotesForWeek(address creatorAddress, uint256 week) 
        external 
        view 
        returns (uint256) 
    {
        return weeklyVotes[week][creatorAddress];
    }
    
    // Get current week's votes
    function getCurrentWeekVotes(address creatorAddress) 
        external 
        view 
        returns (uint256) 
    {
        return weeklyVotes[getCurrentWeek()][creatorAddress];
    }
    
    // Find winner of a specific week (call from frontend or separate function)
    function getWeeklyWinner(uint256 week) external view returns (address) {
        // This would require iterating, better to do in frontend
        // Or maintain a separate mapping tracking max votes
    }
}
```

---

## 🔍 Key Design Decisions

### Decision 1: What defines a "week"?
- **Option A:** Monday 00:00 UTC to Sunday 23:59 UTC
- **Option B:** Any 7-day period from contract deployment
- **Option C:** Calendar week (aligned to specific date)

**Recommendation:** Option B (simplest, most flexible)

### Decision 2: When to determine winner?
- **Option A:** Automatically when new week starts (expensive)
- **Option B:** On-demand when queried (frontend calculates)
- **Option C:** Store winner when first vote of new week happens

**Recommendation:** Option B (frontend calculates, most gas efficient)

### Decision 3: How to handle week boundaries?
- **Option A:** Check on every vote (small gas cost per vote)
- **Option B:** Separate function to update week (manual)
- **Option C:** Use events to track week changes

**Recommendation:** Option A (automatic, user-friendly)

---

## 📝 Final Recommendation

**Use Epoch-Based Approach (Approach 1) with these features:**

1. ✅ Calculate week number: `block.timestamp / WEEK_IN_SECONDS`
2. ✅ Store votes: `mapping(uint256 week => mapping(address => uint256))`
3. ✅ No reset needed - just use current week number
4. ✅ Frontend calculates winner (gas efficient)
5. ✅ Can query historical weeks

**Why this is best:**
- Gas efficient (no loops)
- Scalable (works with many creators)
- Historical data preserved
- Simple to implement
- Matches real-world patterns (Gitcoin, Uniswap)

---

## 🚀 Next Steps

1. Implement epoch-based voting
2. Add helper functions to get current week
3. Emit events with week number
4. Frontend will calculate winners (no need for expensive on-chain calculation)

