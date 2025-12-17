# Environment Variables Setup

## PRIVATE_KEY for Deployment

To deploy contracts to Polygon Amoy Testnet, you need to set your MetaMask account's private key as an environment variable.

### ⚠️ SECURITY WARNING

- **NEVER share your private key with anyone**
- **NEVER commit your private key to git**
- **Only use a testnet account** (not your mainnet account with real funds)
- The `.env` file is already in `.gitignore` - keep it that way!

### Step 1: Get Your Private Key from MetaMask

1. Open MetaMask extension
2. Click the three dots (menu) → **Account details**
3. Click **Export Private Key**
4. Enter your MetaMask password
5. **Copy the private key** (starts with `0x...`)

### Step 2: Create `.env` File

In the `contracts/` directory, create a `.env` file:

```bash
cd contracts
touch .env
```

Add your private key to the `.env` file:

```bash
PRIVATE_KEY=0xYourPrivateKeyHereWithoutQuotes
```

**Example:**
```bash
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Step 3: Verify `.env` is Ignored

Make sure `.env` is in `.gitignore` (it should already be there):

```bash
# In root .gitignore, you should see:
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### Step 4: Test Deployment

After setting up, you can deploy:

```bash
cd contracts
bunx hardhat ignition deploy --network amoy ignition/modules/YourContract.ts
```

### Alternative: Use Hardhat Keystore (More Secure)

Instead of `.env`, you can use Hardhat's keystore:

```bash
bunx hardhat keystore set PRIVATE_KEY
```

This will prompt you to enter the private key securely.

### Best Practices

1. ✅ Use a **separate MetaMask account** for testing
2. ✅ Only use **testnet accounts** (no real funds)
3. ✅ Never commit `.env` files
4. ✅ Use Hardhat keystore for better security
5. ✅ Rotate keys if accidentally exposed

