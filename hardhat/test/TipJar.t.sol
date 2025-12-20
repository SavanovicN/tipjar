// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TipJar} from "../contracts/TipJar.sol";

contract TipJarTest is Test {
    TipJar public tipJar;
    
    address public creator1 = address(0x1);
    address public creator2 = address(0x2);
    address public tipper1 = address(0x3);
    address public voter1 = address(0x4);
    
    string public constant NAME = "Alice";
    string public constant DESCRIPTION = "Web3 developer";
    string public constant AVATAR = "https://example.com/avatar.png";
    
    event CreatorRegistered(
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
    
    event ProfileUpdated(
        address indexed creator,
        string name,
        string avatar,
        uint256 timestamp
    );
    
    function setUp() public {
        tipJar = new TipJar();
        
        // Fund test accounts
        vm.deal(creator1, 10 ether);
        vm.deal(creator2, 10 ether);
        vm.deal(tipper1, 10 ether);
        vm.deal(voter1, 10 ether);
    }
    
    // ===== REGISTRATION TESTS =====
    
    function test_RegisterCreator() public {
        vm.prank(creator1);
        tipJar.registerCreator(NAME, DESCRIPTION, AVATAR);
        
        TipJar.Creator memory creator = tipJar.getCreatorProfile(creator1);
        assertEq(creator.name, NAME);
        assertEq(creator.description, DESCRIPTION);
        assertEq(creator.avatar, AVATAR);
        assertEq(creator.creatorAddress, creator1);
        assertTrue(creator.isRegistered);
    }
    
    function test_RegisterCreator_EmitsEvent() public {
        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit CreatorRegistered(creator1, NAME, AVATAR, block.timestamp);
        tipJar.registerCreator(NAME, DESCRIPTION, AVATAR);
    }
    
    function test_RegisterCreator_RevertIfAlreadyRegistered() public {
        vm.prank(creator1);
        tipJar.registerCreator(NAME, DESCRIPTION, AVATAR);
        
        vm.prank(creator1);
        vm.expectRevert("Already registered");
        tipJar.registerCreator("Alice Again", "Duplicate", AVATAR);
    }
    
    function test_RegisterCreator_RevertIfNameEmpty() public {
        vm.prank(creator1);
        vm.expectRevert("Name required");
        tipJar.registerCreator("", DESCRIPTION, AVATAR);
    }
    
    function test_RegisterCreator_RevertIfNameTooLong() public {
        string memory longName = new string(101);
        vm.prank(creator1);
        vm.expectRevert("Name too long");
        tipJar.registerCreator(longName, DESCRIPTION, AVATAR);
    }
    
    function test_RegisterCreator_RevertIfDescriptionTooLong() public {
        string memory longDesc = new string(501);
        vm.prank(creator1);
        vm.expectRevert("Description too long");
        tipJar.registerCreator(NAME, longDesc, AVATAR);
    }
    
    function test_RegisterCreator_RevertIfAvatarEmpty() public {
        vm.prank(creator1);
        vm.expectRevert("Avatar required");
        tipJar.registerCreator(NAME, DESCRIPTION, "");
    }
    
    function test_RegisterCreator_RevertIfAvatarTooLong() public {
        string memory longAvatar = new string(201);
        vm.prank(creator1);
        vm.expectRevert("Avatar URL too long");
        tipJar.registerCreator(NAME, DESCRIPTION, longAvatar);
    }
    
    // ===== TIPPING TESTS =====
    
    function setUpCreator() internal {
        vm.prank(creator1);
        tipJar.registerCreator(NAME, DESCRIPTION, AVATAR);
    }
    
    function test_TipCreator() public {
        setUpCreator();
        
        uint256 tipAmount = 0.1 ether;
        vm.prank(tipper1);
        tipJar.tipCreator{value: tipAmount}(creator1);
        
        TipJar.Creator memory creator = tipJar.getCreatorProfile(creator1);
        assertEq(creator.totalTips, tipAmount);
        
        uint256 pending = tipJar.pendingWithdrawals(creator1);
        assertEq(pending, tipAmount);
    }
    
    function test_TipCreator_EmitsEvent() public {
        setUpCreator();
        
        uint256 tipAmount = 0.1 ether;
        vm.prank(tipper1);
        vm.expectEmit(true, true, false, true);
        emit TipSent(tipper1, creator1, tipAmount, block.timestamp);
        tipJar.tipCreator{value: tipAmount}(creator1);
    }
    
    function test_TipCreator_UpdatesPendingWithdrawals() public {
        setUpCreator();
        
        uint256 tip1 = 0.05 ether;
        uint256 tip2 = 0.03 ether;
        
        vm.prank(tipper1);
        tipJar.tipCreator{value: tip1}(creator1);
        
        uint256 pending = tipJar.pendingWithdrawals(creator1);
        assertEq(pending, tip1);
        
        vm.prank(tipper1);
        tipJar.tipCreator{value: tip2}(creator1);
        
        pending = tipJar.pendingWithdrawals(creator1);
        assertEq(pending, tip1 + tip2);
    }
    
    function test_TipCreator_RevertIfZeroAmount() public {
        setUpCreator();
        
        vm.prank(tipper1);
        vm.expectRevert("Must send MATIC");
        tipJar.tipCreator{value: 0}(creator1);
    }
    
    function test_TipCreator_RevertIfCreatorNotFound() public {
        vm.prank(tipper1);
        vm.expectRevert("Creator not found");
        tipJar.tipCreator{value: 0.1 ether}(tipper1);
    }
    
    function test_TipCreator_RevertIfZeroAddress() public {
        vm.prank(tipper1);
        vm.expectRevert("Invalid address");
        tipJar.tipCreator{value: 0.1 ether}(address(0));
    }
    
    // ===== WITHDRAWAL TESTS =====
    
    function test_Withdraw() public {
        setUpCreator();
        
        uint256 tipAmount = 0.5 ether;
        vm.prank(tipper1);
        tipJar.tipCreator{value: tipAmount}(creator1);
        
        uint256 initialBalance = creator1.balance;
        
        vm.prank(creator1);
        tipJar.withdraw();
        
        uint256 pending = tipJar.pendingWithdrawals(creator1);
        assertEq(pending, 0);
        
        uint256 finalBalance = creator1.balance;
        assertGt(finalBalance, initialBalance);
    }
    
    function test_Withdraw_EmitsEvent() public {
        setUpCreator();
        
        uint256 tipAmount = 0.5 ether;
        vm.prank(tipper1);
        tipJar.tipCreator{value: tipAmount}(creator1);
        
        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit Withdrawal(creator1, tipAmount, block.timestamp);
        tipJar.withdraw();
    }
    
    function test_Withdraw_RevertIfNotRegistered() public {
        vm.prank(tipper1);
        vm.expectRevert("Not registered");
        tipJar.withdraw();
    }
    
    function test_Withdraw_RevertIfNoFunds() public {
        setUpCreator();
        
        vm.prank(creator1);
        vm.expectRevert("No funds to withdraw");
        tipJar.withdraw();
    }
    
    // ===== VOTING TESTS =====
    
    function setUpCreators() internal {
        vm.prank(creator1);
        tipJar.registerCreator(NAME, DESCRIPTION, AVATAR);
        
        vm.prank(creator2);
        tipJar.registerCreator("Bob", "Content creator", "https://example.com/bob.png");
    }
    
    function test_VoteForCreator() public {
        setUpCreators();
        
        uint256 currentWeek = tipJar.getCurrentWeek();
        
        vm.prank(voter1);
        tipJar.voteForCreator(creator1);
        
        uint256 votes = tipJar.weeklyVotes(currentWeek, creator1);
        assertEq(votes, 1);
        
        bool hasVoted = tipJar.hasUserVotedThisWeek(voter1);
        assertTrue(hasVoted);
    }
    
    function test_VoteForCreator_EmitsEvent() public {
        setUpCreators();
        
        uint256 currentWeek = tipJar.getCurrentWeek();
        
        vm.prank(voter1);
        vm.expectEmit(true, true, false, true);
        emit VoteCast(voter1, creator1, currentWeek, block.timestamp);
        tipJar.voteForCreator(creator1);
    }
    
    function test_VoteForCreator_PreventsDoubleVoting() public {
        setUpCreators();
        
        vm.prank(voter1);
        tipJar.voteForCreator(creator1);
        
        vm.prank(voter1);
        vm.expectRevert("Already voted this week");
        tipJar.voteForCreator(creator1);
    }
    
    function test_VoteForCreator_RevertIfCreatorNotFound() public {
        vm.prank(voter1);
        vm.expectRevert("Creator not found");
        tipJar.voteForCreator(tipper1);
    }
    
    function test_VoteForCreator_RevertIfZeroAddress() public {
        vm.prank(voter1);
        vm.expectRevert("Invalid address");
        tipJar.voteForCreator(address(0));
    }
    
    // ===== VIEW FUNCTION TESTS =====
    
    function test_GetCurrentWeek() public view {
        uint256 week = tipJar.getCurrentWeek();
        assertGe(week, 0);
    }
    
    function test_GetVotesForWeek() public {
        setUpCreators();
        
        uint256 currentWeek = tipJar.getCurrentWeek();
        vm.prank(voter1);
        tipJar.voteForCreator(creator1);
        
        uint256 votes = tipJar.getVotesForWeek(creator1, currentWeek);
        assertEq(votes, 1);
    }
    
    function test_GetCurrentWeekVotes() public {
        setUpCreators();
        
        vm.prank(voter1);
        tipJar.voteForCreator(creator1);
        
        uint256 votes = tipJar.getCurrentWeekVotes(creator1);
        assertEq(votes, 1);
    }
    
    function test_HasUserVotedThisWeek() public {
        setUpCreators();
        
        bool hasVoted = tipJar.hasUserVotedThisWeek(voter1);
        assertFalse(hasVoted);
        
        vm.prank(voter1);
        tipJar.voteForCreator(creator1);
        
        hasVoted = tipJar.hasUserVotedThisWeek(voter1);
        assertTrue(hasVoted);
    }
    
    function test_GetPendingWithdrawal() public {
        setUpCreator();
        
        uint256 tipAmount = 0.1 ether;
        vm.prank(tipper1);
        tipJar.tipCreator{value: tipAmount}(creator1);
        
        uint256 pending = tipJar.getPendingWithdrawal(creator1);
        assertEq(pending, tipAmount);
    }
    
    // ===== PROFILE UPDATE TESTS =====
    
    function test_UpdateProfile() public {
        setUpCreator();
        
        vm.prank(creator1);
        tipJar.updateProfile("Alice Updated", "Updated description", "https://example.com/new-avatar.png");
        
        TipJar.Creator memory creator = tipJar.getCreatorProfile(creator1);
        assertEq(creator.name, "Alice Updated");
        assertEq(creator.description, "Updated description");
        assertEq(creator.avatar, "https://example.com/new-avatar.png");
    }
    
    function test_UpdateProfile_EmitsEvent() public {
        setUpCreator();
        
        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit ProfileUpdated(creator1, "Alice Updated", "https://example.com/new-avatar.png", block.timestamp);
        tipJar.updateProfile("Alice Updated", "Updated description", "https://example.com/new-avatar.png");
    }
    
    function test_UpdateProfile_RevertIfNotRegistered() public {
        vm.prank(tipper1);
        vm.expectRevert("Not registered");
        tipJar.updateProfile("Name", "Description", AVATAR);
    }
    
    function test_UpdateProfile_ValidatesInputs() public {
        setUpCreator();
        
        vm.prank(creator1);
        vm.expectRevert("Name required");
        tipJar.updateProfile("", "Desc", AVATAR);
    }
}

