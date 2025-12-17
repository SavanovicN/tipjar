// Test script to verify Polygon Amoy network connection and keystore
import hre from "hardhat";
import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  console.log("🔍 Testing Hardhat Keystore & Polygon Amoy Connection...\n");

  // Test 1: Verify keystore is accessible
  console.log("1️⃣ Checking keystore...");
  const amoyConfig = hre.config.networks.amoy;
  
  if (!amoyConfig.accounts || amoyConfig.accounts.length === 0) {
    console.error("❌ No accounts configured for Amoy network");
    process.exit(1);
  }
  
  console.log("   ✅ Keystore accessible - accounts configured\n");

  // Test 2: Get account from keystore
  console.log("2️⃣ Getting account from keystore...");
  // configVariable is resolved by Hardhat when accessing network config
  // The accounts array should contain the resolved private key
  const privateKeyValue = amoyConfig.accounts[0];
  
  // Convert to string and ensure proper format
  let privateKey: `0x${string}`;
  const keyStr = String(privateKeyValue);
  
  // Ensure it starts with 0x
  if (keyStr.startsWith('0x')) {
    privateKey = keyStr as `0x${string}`;
  } else {
    privateKey = `0x${keyStr}` as `0x${string}`;
  }
  
  const account = privateKeyToAccount(privateKey);
  console.log(`   ✅ Account address: ${account.address}\n`);

  // Test 3: Connect to Polygon Amoy network
  console.log("3️⃣ Connecting to Polygon Amoy network...");
  const publicClient = createPublicClient({
    chain: {
      id: 80002,
      name: "Polygon Amoy",
      network: "amoy",
      nativeCurrency: {
        decimals: 18,
        name: "MATIC",
        symbol: "MATIC",
      },
      rpcUrls: {
        default: {
          http: [amoyConfig.url as string],
        },
        public: {
          http: [amoyConfig.url as string],
        },
      },
      blockExplorers: {
        default: {
          name: "Polygonscan",
          url: "https://amoy.polygonscan.com",
        },
      },
    },
    transport: http(amoyConfig.url as string),
  });

  try {
    // Test 4: Get chain ID
    const chainId = await publicClient.getChainId();
    console.log(`   ✅ Connected! Chain ID: ${chainId}\n`);

    // Test 5: Get account balance
    console.log("4️⃣ Checking account balance...");
    const balance = await publicClient.getBalance({
      address: account.address,
    });
    const balanceInMatic = formatEther(balance);
    console.log(`   ✅ Balance: ${balanceInMatic} MATIC\n`);

    // Test 6: Get latest block
    console.log("5️⃣ Fetching latest block...");
    const blockNumber = await publicClient.getBlockNumber();
    console.log(`   ✅ Latest block: ${blockNumber}\n`);

    console.log("🎉 All tests passed! Keystore and network are working correctly.\n");
    console.log("📋 Summary:");
    console.log(`   - Account: ${account.address}`);
    console.log(`   - Balance: ${balanceInMatic} MATIC`);
    console.log(`   - Network: Polygon Amoy (Chain ID: ${chainId})`);
    console.log(`   - Latest Block: ${blockNumber}\n`);
    console.log("✅ Ready to deploy contracts!\n");
  } catch (error: any) {
    console.error("❌ Error connecting to network:");
    console.error(`   ${error.message}\n`);
    console.log("💡 Make sure:");
    console.log("   - You have test MATIC in your wallet");
    console.log("   - The RPC URL is correct");
    console.log("   - Your internet connection is working");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

