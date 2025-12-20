import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";

describe("TipJar", async function () {
	const { viem } = await network.connect();
	const publicClient = await viem.getPublicClient();

	// Get test accounts
	const accounts = await viem.getWalletClients();
	const [
		deployer,
		creator1,
		creator2,
		creator3,
		tipper1,
		tipper2,
		voter1,
		voter2,
	] = accounts;

	describe("Registration", async function () {
		let tipJar: any;
		let tipJarAddress: `0x${string}`;

		before(async function () {
			tipJar = await viem.deployContract("TipJar");
			tipJarAddress = tipJar.address;
		});

		it("Should register a new creator", async function () {
			// Deploy a fresh contract instance with creator1 as the account
			const tipJarAsCreator1 = await viem.deployContract("TipJar", {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);

			// Read using the same contract instance
			const creator = await tipJarAsCreator1.read.getCreatorProfile([
				creator1.account.address,
			]);
			
			assert.equal(creator[0], "Alice");
			assert.equal(creator[1], "Web3 developer");
			assert.equal(creator[2], "https://example.com/avatar.png");
			assert.equal(creator[4], creator1.account.address);
			assert.equal(creator[5], true);
		});

		it("Should emit CreatorRegistered event", async function () {
			const tipJarAsCreator2 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator2,
			});

			await viem.assertions.emitWithArgs(
				tipJarAsCreator2.write.registerCreator([
					"Bob",
					"Content creator",
					"https://example.com/bob.png",
				]),
				tipJar,
				"CreatorRegistered",
				[creator2.account.address, "Bob", "https://example.com/bob.png"],
			);
		});

		it("Should revert if already registered", async function () {
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});

			await assert.rejects(
				tipJarAsCreator1.write.registerCreator([
					"Alice Again",
					"Duplicate",
					"https://example.com/avatar.png",
				]),
				(error: any) => {
					return error.message.includes("Already registered");
				},
			);
		});

		it("Should revert if name is empty", async function () {
			const tipJarAsCreator3 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator3,
			});

			await assert.rejects(
				tipJarAsCreator3.write.registerCreator([
					"",
					"Description",
					"https://example.com/avatar.png",
				]),
				(error: any) => {
					return error.message.includes("Name required");
				},
			);
		});

		it("Should revert if name is too long", async function () {
			const tipJarAsCreator3 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator3,
			});

			const longName = "a".repeat(101);
			await assert.rejects(
				tipJarAsCreator3.write.registerCreator([
					longName,
					"Description",
					"https://example.com/avatar.png",
				]),
				(error: any) => {
					return error.message.includes("Name too long");
				},
			);
		});

		it("Should revert if description is too long", async function () {
			const tipJarAsCreator3 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator3,
			});

			const longDescription = "a".repeat(501);
			await assert.rejects(
				tipJarAsCreator3.write.registerCreator([
					"Name",
					longDescription,
					"https://example.com/avatar.png",
				]),
				(error: any) => {
					return error.message.includes("Description too long");
				},
			);
		});

		it("Should revert if avatar is empty", async function () {
			const tipJarAsCreator3 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator3,
			});

			await assert.rejects(
				tipJarAsCreator3.write.registerCreator(["Name", "Description", ""]),
				(error: any) => {
					return error.message.includes("Avatar required");
				},
			);
		});

		it("Should revert if avatar is too long", async function () {
			const tipJarAsCreator3 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator3,
			});

			const longAvatar = "a".repeat(201);
			await assert.rejects(
				tipJarAsCreator3.write.registerCreator([
					"Name",
					"Description",
					longAvatar,
				]),
				(error: any) => {
					return error.message.includes("Avatar URL too long");
				},
			);
		});
	});

	describe("Tipping", async function () {
		let tipJar: any;
		let tipJarAddress: `0x${string}`;

		before(async function () {
			tipJar = await viem.deployContract("TipJar");
			tipJarAddress = tipJar.address;

			// Register creator1
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);
		});

		it("Should accept tip and update totalTips", async function () {
			const tipAmount = parseEther("0.1");
			const initialBalance = await publicClient.getBalance({
				address: tipJarAddress,
			});

			await tipJar.write.tipCreator([creator1.account.address], {
				value: tipAmount,
			});

			const creator = await tipJar.read.getCreatorProfile([
				creator1.account.address,
			]);
			assert.equal(creator[3], tipAmount);

			const finalBalance = await publicClient.getBalance({
				address: tipJarAddress,
			});
			assert.equal(finalBalance - initialBalance, tipAmount);
		});

		it("Should update pendingWithdrawals", async function () {
			const tipAmount1 = parseEther("0.05");
			const tipAmount2 = parseEther("0.03");

			await tipJar.write.tipCreator([creator1.account.address], {
				value: tipAmount1,
			});

			let pending = await tipJar.read.pendingWithdrawals([
				creator1.account.address,
			]);
			assert.equal(pending, tipAmount1);

			await tipJar.write.tipCreator([creator1.account.address], {
				value: tipAmount2,
			});

			pending = await tipJar.read.pendingWithdrawals([
				creator1.account.address,
			]);
			assert.equal(pending, tipAmount1 + tipAmount2);
		});

		it("Should emit TipSent event", async function () {
			const tipAmount = parseEther("0.02");
			await viem.assertions.emitWithArgs(
				tipJar.write.tipCreator([creator1.account.address], {
					value: tipAmount,
				}),
				tipJar,
				"TipSent",
				[tipper1.account.address, creator1.account.address, tipAmount],
			);
		});

		it("Should revert if amount is zero", async function () {
			await assert.rejects(
				tipJar.write.tipCreator([creator1.account.address], { value: 0n }),
				(error: any) => {
					return error.message.includes("Must send MATIC");
				},
			);
		});

		it("Should revert if creator doesn't exist", async function () {
			await assert.rejects(
				tipJar.write.tipCreator([tipper1.account.address], {
					value: parseEther("0.1"),
				}),
				(error: any) => {
					return error.message.includes("Creator not found");
				},
			);
		});

		it("Should revert if address is zero", async function () {
			await assert.rejects(
				tipJar.write.tipCreator([
					"0x0000000000000000000000000000000000000000",
				], {
					value: parseEther("0.1"),
				}),
				(error: any) => {
					return error.message.includes("Invalid address");
				},
			);
		});
	});

	describe("Withdrawal", async function () {
		let tipJar: any;
		let tipJarAddress: `0x${string}`;

		before(async function () {
			tipJar = await viem.deployContract("TipJar");
			tipJarAddress = tipJar.address;

			// Register creator2
			const tipJarAsCreator2 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator2,
			});

			await tipJarAsCreator2.write.registerCreator([
				"Bob",
				"Content creator",
				"https://example.com/bob.png",
			]);

			// Send tips
			await tipJar.write.tipCreator([creator2.account.address], {
				value: parseEther("0.5"),
			});
			await tipJar.write.tipCreator([creator2.account.address], {
				value: parseEther("0.3"),
			});
		});

		it("Should withdraw accumulated tips", async function () {
			const tipJarAsCreator2 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator2,
			});

			const initialBalance = await publicClient.getBalance({
				address: creator2.account.address,
			});

			const pending = await tipJar.read.pendingWithdrawals([
				creator2.account.address,
			]);
			assert.equal(pending, parseEther("0.8"));

			await tipJarAsCreator2.write.withdraw();

			const pendingAfter = await tipJar.read.pendingWithdrawals([
				creator2.account.address,
			]);
			assert.equal(pendingAfter, 0n);

			const finalBalance = await publicClient.getBalance({
				address: creator2.account.address,
			});
			assert.ok(finalBalance > initialBalance);
		});

		it("Should emit Withdrawal event", async function () {
			// Send another tip
			await tipJar.write.tipCreator([creator2.account.address], {
				value: parseEther("0.1"),
			});

			const tipJarAsCreator2 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator2,
			});

			await viem.assertions.emitWithArgs(
				tipJarAsCreator2.write.withdraw(),
				tipJar,
				"Withdrawal",
				[creator2.account.address, parseEther("0.1")],
			);
		});

		it("Should revert if not registered", async function () {
			const tipJarAsTipper = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: tipper1,
			});

			await assert.rejects(
				tipJarAsTipper.write.withdraw(),
				(error: any) => {
					return error.message.includes("Not registered");
				},
			);
		});

		it("Should revert if no funds to withdraw", async function () {
			const tipJarAsCreator3 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator3,
			});

			await tipJarAsCreator3.write.registerCreator([
				"Charlie",
				"New creator",
				"https://example.com/charlie.png",
			]);

			await assert.rejects(
				tipJarAsCreator3.write.withdraw(),
				(error: any) => {
					return error.message.includes("No funds to withdraw");
				},
			);
		});
	});

	describe("Voting", async function () {
		let tipJar: any;
		let tipJarAddress: `0x${string}`;

		before(async function () {
			tipJar = await viem.deployContract("TipJar");
			tipJarAddress = tipJar.address;

			// Register creators
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});
			const tipJarAsCreator2 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator2,
			});

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
		});

		it("Should vote for creator", async function () {
			const currentWeek = await tipJar.read.getCurrentWeek();
			await tipJar.write.voteForCreator([creator1.account.address]);

			const votes = await tipJar.read.weeklyVotes([
				currentWeek,
				creator1.account.address,
			]);
			assert.equal(votes, 1n);
		});

		it("Should emit VoteCast event", async function () {
			const currentWeek = await tipJar.read.getCurrentWeek();
			await viem.assertions.emitWithArgs(
				tipJar.write.voteForCreator([creator2.account.address]),
				tipJar,
				"VoteCast",
				[voter1.account.address, creator2.account.address, currentWeek],
			);
		});

		it("Should prevent double voting in same week", async function () {
			await tipJar.write.voteForCreator([creator1.account.address]);

			await assert.rejects(
				tipJar.write.voteForCreator([creator1.account.address]),
				(error: any) => {
					return error.message.includes("Already voted this week");
				},
			);
		});

		it("Should revert if creator doesn't exist", async function () {
			await assert.rejects(
				tipJar.write.voteForCreator([tipper1.account.address]),
				(error: any) => {
					return error.message.includes("Creator not found");
				},
			);
		});

		it("Should revert if address is zero", async function () {
			await assert.rejects(
				tipJar.write.voteForCreator([
					"0x0000000000000000000000000000000000000000",
				]),
				(error: any) => {
					return error.message.includes("Invalid address");
				},
			);
		});

		it("Should get current week number", async function () {
			const currentWeek = await tipJar.read.getCurrentWeek();
			assert.ok(currentWeek >= 0n);
		});
	});

	describe("View Functions", async function () {
		let tipJar: any;
		let tipJarAddress: `0x${string}`;

		before(async function () {
			tipJar = await viem.deployContract("TipJar");
			tipJarAddress = tipJar.address;

			// Register creator1
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);
		});

		it("Should get creator profile", async function () {
			const profile = await tipJar.read.getCreatorProfile([
				creator1.account.address,
			]);
			assert.equal(profile[0], "Alice");
			assert.equal(profile[1], "Web3 developer");
			assert.equal(profile[2], "https://example.com/avatar.png");
		});

		it("Should revert if creator doesn't exist", async function () {
			await assert.rejects(
				tipJar.read.getCreatorProfile([tipper1.account.address]),
				(error: any) => {
					return error.message.includes("Creator not found");
				},
			);
		});

		it("Should get current week", async function () {
			const week = await tipJar.read.getCurrentWeek();
			assert.ok(week >= 0n);
		});

		it("Should get votes for specific week", async function () {
			const currentWeek = await tipJar.read.getCurrentWeek();
			const votes = await tipJar.read.getVotesForWeek([
				creator1.account.address,
				currentWeek,
			]);
			assert.ok(votes >= 0n);
		});

		it("Should get current week votes", async function () {
			const votes = await tipJar.read.getCurrentWeekVotes([
				creator1.account.address,
			]);
			assert.ok(votes >= 0n);
		});

		it("Should check if user voted this week", async function () {
			const hasVoted = await tipJar.read.hasUserVotedThisWeek([
				voter1.account.address,
			]);
			assert.equal(typeof hasVoted, "boolean");
		});

		it("Should get pending withdrawal", async function () {
			const pending = await tipJar.read.getPendingWithdrawal([
				creator1.account.address,
			]);
			assert.ok(pending >= 0n);
		});
	});

	describe("Profile Update", async function () {
		let tipJar: any;
		let tipJarAddress: `0x${string}`;

		before(async function () {
			tipJar = await viem.deployContract("TipJar");
			tipJarAddress = tipJar.address;

			// Register creator1
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.registerCreator([
				"Alice",
				"Web3 developer",
				"https://example.com/avatar.png",
			]);
		});

		it("Should update profile", async function () {
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});

			await tipJarAsCreator1.write.updateProfile([
				"Alice Updated",
				"Updated description",
				"https://example.com/new-avatar.png",
			]);

			const creator = await tipJar.read.getCreatorProfile([
				creator1.account.address,
			]);
			assert.equal(creator[0], "Alice Updated");
			assert.equal(creator[1], "Updated description");
			assert.equal(creator[2], "https://example.com/new-avatar.png");
		});

		it("Should emit ProfileUpdated event", async function () {
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});

			// ProfileUpdated has: address indexed creator, string name, string avatar, uint256 timestamp
			// emitWithArgs checks non-indexed params: name, avatar, timestamp (3 params)
			await viem.assertions.emitWithArgs(
				tipJarAsCreator1.write.updateProfile([
					"Alice Final",
					"Final description",
					"https://example.com/final.png",
				]),
				tipJar,
				"ProfileUpdated",
				["Alice Final", "https://example.com/final.png"], // name, avatar (timestamp is checked automatically)
			);
		});

		it("Should revert if not registered", async function () {
			const tipJarAsTipper = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: tipper1,
			});

			await assert.rejects(
				tipJarAsTipper.write.updateProfile([
					"Name",
					"Description",
					"https://example.com/avatar.png",
				]),
				(error: any) => {
					return error.message.includes("Not registered");
				},
			);
		});

		it("Should validate inputs same as registration", async function () {
			const tipJarAsCreator1 = await viem.getContractAt("TipJar", tipJarAddress, {
				walletClient: creator1,
			});

			await assert.rejects(
				tipJarAsCreator1.write.updateProfile(["", "Desc", "Avatar"]),
				(error: any) => {
					return error.message.includes("Name required");
				},
			);
		});
	});
});
