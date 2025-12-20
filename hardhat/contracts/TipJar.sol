// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title TipJar
 * @notice A community tip jar dApp where creators can register, receive tips, and compete in weekly voting
 * @dev Implements epoch-based weekly voting system with withdrawal pattern for security
 */
contract TipJar {
    // ===== CONSTANTS =====
    uint256 public constant WEEK_IN_SECONDS = 7 days;
    uint256 public constant MAX_NAME_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 500;
    uint256 public constant MAX_AVATAR_LENGTH = 200;

    // ===== STRUCTS =====
    struct Creator {
        string name; // Creator's display name
        string description; // Creator's bio/description
        string avatar; // Avatar URL or IPFS hash
        uint256 totalTips; // Total MATIC received (all time)
        address creatorAddress; // Creator's wallet address
        bool isRegistered; // Registration status
        uint256 registrationDate; // When they registered
    }

    // ===== MAPPINGS =====
    // Store creator profiles by address
    mapping(address => Creator) public creators;

    // Track votes per week per creator
    // week number => creator address => vote count
    mapping(uint256 => mapping(address => uint256)) public weeklyVotes;

    // Track who voted each week (prevent double voting)
    // voter address => week number => has voted
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // Track pending withdrawals (withdrawal pattern for security)
    // creator address => amount available to withdraw
    mapping(address => uint256) public pendingWithdrawals;

    // ===== EVENTS =====
    event CreatorRegistered(
        address indexed creator,
        string name,
        string avatar,
        uint256 timestamp
    );

    event ProfileUpdated(
        address indexed creator,
        string name,
        string avatar,
        uint256 timestamp
    );

    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event VoteCast(
        address indexed voter,
        address indexed creator,
        uint256 week,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    // ===== FUNCTIONS =====

    /**
     * @notice Register as a creator
     * @param name Creator's display name (max 100 chars)
     * @param description Creator's bio/description (max 500 chars)
     * @param avatar Avatar URL or IPFS hash (max 200 chars)
     * @dev Emits CreatorRegistered event
     */
    function registerCreator(
        string memory name,
        string memory description,
        string memory avatar
    ) external {
        // Validation
        require(!creators[msg.sender].isRegistered, "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= MAX_NAME_LENGTH, "Name too long");
        require(
            bytes(description).length <= MAX_DESCRIPTION_LENGTH,
            "Description too long"
        );
        require(bytes(avatar).length > 0, "Avatar required");
        require(
            bytes(avatar).length <= MAX_AVATAR_LENGTH,
            "Avatar URL too long"
        );

        // Create creator profile
        creators[msg.sender] = Creator({
            name: name,
            description: description,
            avatar: avatar,
            totalTips: 0,
            creatorAddress: msg.sender,
            isRegistered: true,
            registrationDate: block.timestamp
        });

        // Emit event
        emit CreatorRegistered(msg.sender, name, avatar, block.timestamp);
    }

    /**
     * @notice Update creator profile (name, description, avatar)
     * @param name Creator's display name (max 100 chars)
     * @param description Creator's bio/description (max 500 chars)
     * @param avatar Avatar URL or IPFS hash (max 200 chars)
     * @dev Only registered creators can update their profile
     */
    function updateProfile(
        string memory name,
        string memory description,
        string memory avatar
    ) external {
        // Validation
        require(creators[msg.sender].isRegistered, "Not registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= MAX_NAME_LENGTH, "Name too long");
        require(
            bytes(description).length <= MAX_DESCRIPTION_LENGTH,
            "Description too long"
        );
        require(bytes(avatar).length > 0, "Avatar required");
        require(
            bytes(avatar).length <= MAX_AVATAR_LENGTH,
            "Avatar URL too long"
        );

        // Update creator profile
        creators[msg.sender].name = name;
        creators[msg.sender].description = description;
        creators[msg.sender].avatar = avatar;

        // Emit event
        emit ProfileUpdated(msg.sender, name, avatar, block.timestamp);
    }

    /**
     * @notice Send a tip to a creator
     * @param creatorAddress Address of the creator to tip
     * @dev Uses withdrawal pattern - tips tracked in pendingWithdrawals
     * @dev Emits TipSent event
     */
    function tipCreator(address creatorAddress) external payable {
        // Validation
        require(msg.value > 0, "Must send MATIC");
        require(creatorAddress != address(0), "Invalid address");
        require(creators[creatorAddress].isRegistered, "Creator not found");

        // Update creator's total tips (for display/history)
        creators[creatorAddress].totalTips += msg.value;

        // Track pending withdrawal (withdrawal pattern)
        pendingWithdrawals[creatorAddress] += msg.value;

        // Emit event
        emit TipSent(msg.sender, creatorAddress, msg.value, block.timestamp);
    }

    /**
     * @notice Withdraw accumulated tips
     * @dev Uses withdrawal pattern (checks-effects-interactions) for security
     * @dev Prevents reentrancy by updating state before external call
     * @dev Emits Withdrawal event
     */
    function withdraw() external {
        // Validation
        require(creators[msg.sender].isRegistered, "Not registered");
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        // Checks-Effects-Interactions pattern
        // 1. Checks: Already done above
        // 2. Effects: Update state before external call
        pendingWithdrawals[msg.sender] = 0;

        // 3. Interactions: External call last
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        // Emit event
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Vote for a creator in the current week
     * @param creatorAddress Address of the creator to vote for
     * @dev Prevents double voting per week
     * @dev Emits VoteCast event with week number
     */
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

    // ===== VIEW FUNCTIONS =====

    /**
     * @notice Get creator profile
     * @param creatorAddress Address of the creator
     * @return Creator struct with all creator information
     */
    function getCreatorProfile(
        address creatorAddress
    ) external view returns (Creator memory) {
        require(creators[creatorAddress].isRegistered, "Creator not found");
        return creators[creatorAddress];
    }

    /**
     * @notice Get current week number
     * @return Current week number (epoch-based)
     * @dev Week number calculated as: block.timestamp / WEEK_IN_SECONDS
     */
    function getCurrentWeek() public view returns (uint256) {
        return block.timestamp / WEEK_IN_SECONDS;
    }

    /**
     * @notice Get votes for a creator in a specific week
     * @param creatorAddress Address of the creator
     * @param week Week number to query
     * @return Number of votes for that creator in that week
     */
    function getVotesForWeek(
        address creatorAddress,
        uint256 week
    ) external view returns (uint256) {
        return weeklyVotes[week][creatorAddress];
    }

    /**
     * @notice Get current week votes for a creator
     * @param creatorAddress Address of the creator
     * @return Number of votes for that creator in the current week
     */
    function getCurrentWeekVotes(
        address creatorAddress
    ) external view returns (uint256) {
        return weeklyVotes[getCurrentWeek()][creatorAddress];
    }

    /**
     * @notice Check if a user has voted this week
     * @param voter Address of the voter
     * @return true if voter has voted this week, false otherwise
     */
    function hasUserVotedThisWeek(address voter) external view returns (bool) {
        return hasVoted[voter][getCurrentWeek()];
    }

    /**
     * @notice Get pending withdrawal amount for a creator
     * @param creatorAddress Address of the creator
     * @return Amount available to withdraw
     */
    function getPendingWithdrawal(
        address creatorAddress
    ) external view returns (uint256) {
        return pendingWithdrawals[creatorAddress];
    }
}
