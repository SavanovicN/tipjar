# Hardhat Keystore Setup (More Secure)

## Why Use Hardhat Keystore?

✅ **Encrypted storage** - Private keys are encrypted, not plain text  
✅ **Password protected** - Requires password to access  
✅ **More secure** - Better than `.env` files  
✅ **Built-in** - No additional dependencies needed

## Setup Instructions

### Step 1: Set Your Private Key in Keystore

```bash
cd hardhat
bunx hardhat keystore set PRIVATE_KEY
```

This will:
1. Prompt you to enter your private key
2. Ask you to set a password (to encrypt the keystore)
3. Store it securely encrypted

### Step 2: Verify It's Stored

```bash
# List all keys in keystore
bunx hardhat keystore list

# Get the value (will prompt for password)
bunx hardhat keystore get PRIVATE_KEY

# See where keystore is stored
bunx hardhat keystore path
```

### Step 3: Use in Deployment

The `hardhat.config.ts` is already configured to use `configVariable("PRIVATE_KEY")`, so when you deploy:

```bash
bunx hardhat ignition deploy --network amoy ignition/modules/YourContract.ts
```

It will automatically prompt you for the keystore password to decrypt the private key.

## Managing Your Keystore

### Change Password
```bash
bunx hardhat keystore change-password
```

### Delete a Key
```bash
bunx hardhat keystore delete PRIVATE_KEY
```

### Update a Key
```bash
bunx hardhat keystore set PRIVATE_KEY
# (will overwrite existing)
```

## Migration from .env

If you already have a `.env` file:

1. **Set up keystore** (as shown above)
2. **Delete `.env` file** (keystore is more secure):
   ```bash
   rm hardhat/.env
   ```
3. **Verify** `.env` is in `.gitignore` (already done)

## Security Notes

- ⚠️ **Never share your keystore password**
- ⚠️ **Backup your keystore** (location shown by `keystore path`)
- ✅ **Keystore is encrypted** - safer than plain text `.env`
- ✅ **Password protected** - extra layer of security

## Keystore Location

The keystore is stored in:
- **macOS/Linux**: `~/.hardhat/keystore/`
- **Windows**: `%APPDATA%\Hardhat\keystore\`

You can check the exact path with:
```bash
bunx hardhat keystore path
```

