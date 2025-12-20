import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";

describe("TipJar - Simplified Tests", async function () {
	const { viem } = await network.connect();
	const publicClient = await viem.getPublicClient();

	// Get test accounts
	const accounts = await viem.getWalletClients();
	const [deployer, creator1, creator2, creator3, tipper1, tipper2, voter1] =
		accounts;

	describe("Registration", function () {
		it("Should emit CreatorRegistered event with correct data", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			const deploymentBlock = await publicClient.getBlockNumber();
			
			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			// Check event was emitted - get the most recent event
			const events = await publicClient.getContractEvents({
				address: tipJar.address,
				abi: tipJar.abi,
				eventName: "CreatorRegistered",
				fromBlock: deploymentBlock,
			});

			assert.ok(events.length > 0, "CreatorRegistered event should be emitted");
			// Get the last event (most recent)
			const lastEvent = events[events.length - 1];
			assert.equal(lastEvent.args.creator.toLowerCase(), creator1.account.address.toLowerCase());
			assert.equal(lastEvent.args.name, "Alice");
			assert.equal(lastEvent.args.avatar, "https://example.com/avatar.png");
		});

		it("Should revert if already registered", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			// Register first time
			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			// Try to register again - should revert
			await assert.rejects(
				tipJarAsCreator1.write.registerCreator([
					"Alice Again",
					"Duplicate",
					"https://example.com/avatar.png",
				]),
				(error: any) => error.message.includes("Already registered"),
			);
		});

		it("Should revert if name is empty", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await assert.rejects(
				tipJarAsCreator1.write.registerCreator([
					"",
					"Description",
					"https://example.com/avatar.png",
				]),
				(error: any) => error.message.includes("Name required"),
			);
		});

		it("Should revert if name is too long", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			const longName = "a".repeat(101);
			await assert.rejects(
				tipJarAsCreator1.write.registerCreator([
					longName,
					"Description",
					"https://example.com/avatar.png",
				]),
				(error: any) => error.message.includes("Name too long"),
			);
		});

		it("Should revert if description is too long", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			const longDescription = "a".repeat(501);
			await assert.rejects(
				tipJarAsCreator1.write.registerCreator([
					"Name",
					longDescription,
					"https://example.com/avatar.png",
				]),
				(error: any) => error.message.includes("Description too long"),
			);
		});

		it("Should revert if avatar is empty", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await assert.rejects(
				tipJarAsCreator1.write.registerCreator(["Name", "Description", ""]),
				(error: any) => error.message.includes("Avatar required"),
			);
		});

		it("Should revert if avatar is too long", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			const longAvatar = "a".repeat(201);
			await assert.rejects(
				tipJarAsCreator1.write.registerCreator([
					"Name",
					"Description",
					longAvatar,
				]),
				(error: any) => error.message.includes("Avatar URL too long"),
			);
		});
	});

	describe("Tipping", function () {
		it("Should emit TipSent event and update contract balance", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			// Register creator first
			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			const tipAmount = parseEther("0.1");
			const initialBalance = await publicClient.getBalance({
				address: tipJar.address,
			});

			const deploymentBlock = await publicClient.getBlockNumber();

			// Send tip
			await tipJar.write.tipCreator([creator1.account.address], {
				value: tipAmount,
			});

			// Verify event was emitted
			const events = await publicClient.getContractEvents({
				address: tipJar.address,
				abi: tipJar.abi,
				eventName: "TipSent",
				fromBlock: deploymentBlock,
			});

			assert.ok(events.length > 0, "TipSent event should be emitted");
			assert.equal(events[0].args.from, tipper1.account.address);
			assert.equal(events[0].args.to, creator1.account.address);
			assert.equal(events[0].args.amount, tipAmount);

			// Verify contract balance increased
			const finalBalance = await publicClient.getBalance({
				address: tipJar.address,
			});
			assert.equal(finalBalance - initialBalance, tipAmount);
		});

		it("Should update pendingWithdrawals mapping", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			// Register creator
			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			const tipAmount1 = parseEther("0.05");
			const tipAmount2 = parseEther("0.03");

			// Send first tip
			await tipJar.write.tipCreator([creator1.account.address], {
				value: tipAmount1,
			});

			let pending = await tipJar.read.pendingWithdrawals([
				creator1.account.address,
			]);
			assert.equal(pending, tipAmount1);

			// Send second tip
			await tipJar.write.tipCreator([creator1.account.address], {
				value: tipAmount2,
			});

			pending = await tipJar.read.pendingWithdrawals([
				creator1.account.address,
			]);
			assert.equal(pending, tipAmount1 + tipAmount2);
		});

		it("Should revert if amount is zero", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			await assert.rejects(
				tipJar.write.tipCreator([creator1.account.address], { value: 0n }),
				(error: any) => error.message.includes("Must send MATIC"),
			);
		});

		it("Should revert if creator doesn't exist", async function () {
			const tipJar = await viem.deployContract("TipJar");

			await assert.rejects(
				tipJar.write.tipCreator([tipper1.account.address], {
					value: parseEther("0.1"),
				}),
				(error: any) => error.message.includes("Creator not found"),
			);
		});

		it("Should revert if address is zero", async function () {
			const tipJar = await viem.deployContract("TipJar");

			await assert.rejects(
				tipJar.write.tipCreator([
					"0x0000000000000000000000000000000000000000",
				], {
					value: parseEther("0.1"),
				}),
				(error: any) => error.message.includes("Invalid address"),
			);
		});
	});

	describe("Withdrawal", function () {
		it("Should emit Withdrawal event and transfer funds", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator2 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator2,
			});

			// Register creator
			await tipJarAsCreator2.write.registerCreator([
				"Bob",
				"Content creator",
				"https://example.com/bob.png",
			]);

			// Send tips
			const tipAmount = parseEther("0.5");
			await tipJar.write.tipCreator([creator2.account.address], {
				value: tipAmount,
			});

			const initialBalance = await publicClient.getBalance({
				address: creator2.account.address,
			});

			const deploymentBlock = await publicClient.getBlockNumber();

			// Withdraw
			await tipJarAsCreator2.write.withdraw();

			// Verify event was emitted
			const events = await publicClient.getContractEvents({
				address: tipJar.address,
				abi: tipJar.abi,
				eventName: "Withdrawal",
				fromBlock: deploymentBlock,
			});

			assert.ok(events.length > 0, "Withdrawal event should be emitted");
			assert.equal(events[0].args.creator, creator2.account.address);
			assert.equal(events[0].args.amount, tipAmount);

			// Verify pendingWithdrawals is reset
			const pending = await tipJar.read.pendingWithdrawals([
				creator2.account.address,
			]);
			assert.equal(pending, 0n);

			// Verify balance increased (allowing for gas)
			const finalBalance = await publicClient.getBalance({
				address: creator2.account.address,
			});
			assert.ok(finalBalance > initialBalance);
		});

		it("Should revert if not registered", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsTipper = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: tipper1,
			});

			await assert.rejects(
				tipJarAsTipper.write.withdraw(),
				(error: any) => error.message.includes("Not registered"),
			);
		});

		it("Should revert if no funds to withdraw", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator3 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator3,
			});

			// Register but don't send tips
			await tipJarAsCreator3.write.registerCreator([
				"Charlie",
				"New creator",
				"https://example.com/charlie.png",
			]);

			await assert.rejects(
				tipJarAsCreator3.write.withdraw(),
				(error: any) => error.message.includes("No funds to withdraw"),
			);
		});
	});

	describe("Voting", function () {
		it("Should emit VoteCast event and track votes", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});
			const tipJarAsCreator2 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator2,
			});

			// Register creators
			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);
			await tipJarAsCreator2.write.registerCreator([
				"Bob",
				"Content creator",
				"https://example.com/bob.png",
			]);

			const currentWeek = await tipJar.read.getCurrentWeek();
			const deploymentBlock = await publicClient.getBlockNumber();

			// Vote
			await tipJar.write.voteForCreator([creator1.account.address]);

			// Verify event was emitted
			const events = await publicClient.getContractEvents({
				address: tipJar.address,
				abi: tipJar.abi,
				eventName: "VoteCast",
				fromBlock: deploymentBlock,
			});

			assert.ok(events.length > 0, "VoteCast event should be emitted");
			assert.equal(events[0].args.voter, voter1.account.address);
			assert.equal(events[0].args.creator, creator1.account.address);
			assert.equal(events[0].args.week, currentWeek);

			// Verify vote was recorded
			const votes = await tipJar.read.weeklyVotes([
				currentWeek,
				creator1.account.address,
			]);
			assert.equal(votes, 1n);

			// Verify hasVoted is set using hasUserVotedThisWeek
			const hasVoted = await tipJar.read.hasUserVotedThisWeek([
				voter1.account.address,
			]);
			assert.equal(hasVoted, true);
		});

		it("Should prevent double voting in same week", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});
			const tipJarAsVoter = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: voter1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			// Vote once using voter1 account
			await tipJarAsVoter.write.voteForCreator([creator1.account.address]);

			// Try to vote again with same account - should revert
			await assert.rejects(
				tipJarAsVoter.write.voteForCreator([creator1.account.address]),
				(error: any) => error.message.includes("Already voted this week"),
			);
		});

		it("Should revert if creator doesn't exist", async function () {
			const tipJar = await viem.deployContract("TipJar");

			await assert.rejects(
				tipJar.write.voteForCreator([tipper1.account.address]),
				(error: any) => error.message.includes("Creator not found"),
			);
		});

		it("Should revert if address is zero", async function () {
			const tipJar = await viem.deployContract("TipJar");

			await assert.rejects(
				tipJar.write.voteForCreator([
					"0x0000000000000000000000000000000000000000",
				]),
				(error: any) => error.message.includes("Invalid address"),
			);
		});
	});

	describe("View Functions", function () {
		it("Should get current week number", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const week = await tipJar.read.getCurrentWeek();
			assert.ok(week >= 0n);
		});

		it("Should get votes for specific week", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			const currentWeek = await tipJar.read.getCurrentWeek();
			await tipJar.write.voteForCreator([creator1.account.address]);

			const votes = await tipJar.read.getVotesForWeek([
				creator1.account.address,
				currentWeek,
			]);
			assert.equal(votes, 1n);
		});

		it("Should get current week votes", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			await tipJar.write.voteForCreator([creator1.account.address]);

			const votes = await tipJar.read.getCurrentWeekVotes([
				creator1.account.address,
			]);
			assert.equal(votes, 1n);
		});

		it("Should check if user voted this week", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			// Before voting
			let hasVoted = await tipJar.read.hasUserVotedThisWeek([
				voter1.account.address,
			]);
			assert.equal(hasVoted, false);

			// After voting
			await tipJar.write.voteForCreator([creator1.account.address]);
			hasVoted = await tipJar.read.hasUserVotedThisWeek([
				voter1.account.address,
			]);
			assert.equal(hasVoted, true);
		});

		it("Should get pending withdrawal", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			const tipAmount = parseEther("0.1");
			await tipJar.write.tipCreator([creator1.account.address], {
				value: tipAmount,
			});

			const pending = await tipJar.read.getPendingWithdrawal([
				creator1.account.address,
			]);
			assert.equal(pending, tipAmount);
		});
	});

	describe("Profile Update", function () {
		it("Should emit ProfileUpdated event", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			const deploymentBlock = await publicClient.getBlockNumber();

			// Update profile
			await tipJarAsCreator1.write.updateProfile([
				"Alice Updated",
				"Updated description",
				"https://example.com/new-avatar.png",
			]);

			// Verify event was emitted
			const events = await publicClient.getContractEvents({
				address: tipJar.address,
				abi: tipJar.abi,
				eventName: "ProfileUpdated",
				fromBlock: deploymentBlock,
			});

			assert.ok(events.length > 0, "ProfileUpdated event should be emitted");
			assert.equal(events[0].args.creator, creator1.account.address);
			assert.equal(events[0].args.name, "Alice Updated");
			assert.equal(events[0].args.avatar, "https://example.com/new-avatar.png");
		});

		it("Should revert if not registered", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsTipper = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: tipper1,
			});

			await assert.rejects(
				tipJarAsTipper.write.updateProfile([
					"Name",
					"Description",
					"https://example.com/avatar.png",
				]),
				(error: any) => error.message.includes("Not registered"),
			);
		});

		it("Should validate inputs same as registration", async function () {
			const tipJar = await viem.deployContract("TipJar");
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJar.address, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			await assert.rejects(
				tipJarAsCreator1.write.updateProfile(["", "Desc", "Avatar"]),
				(error: any) => error.message.includes("Name required"),
			);
		});
	});
});

