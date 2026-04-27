# Blockchain Swap Deployment Guide

This guide provides step-by-step instructions for deploying the Blockchain Swap DEX platform to production/testnet environments.

## 🌐 Frontend Deployment (Vercel)

1.  **Framework Setup**: Ensure your project is using **Next.js 14+**.
2.  **Environment Variables**: In your Vercel Dashboard, configure the following secrets:
    - `NEXT_PUBLIC_STELLAR_RPC_URL`: `https://soroban-testnet.stellar.org`
    - `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`: `Test SDF Network ; September 2015`
    - `NEXT_PUBLIC_TOKEN_CONTRACT_ID`: Your deployed Token Contract ID.
    - `NEXT_PUBLIC_POOL_CONTRACT_ID`: Your deployed Pool Contract ID.
    - `NEXT_PUBLIC_ROUTER_CONTRACT_ID`: Your deployed Router Contract ID.
3.  **Deploy**: 
    - Push your changes to the `main` branch.
    - Vercel will automatically trigger a build and deploy.

---

## 🦀 Soroban Contract Deployment (Blockchain Testnet)

Follow these steps to deploy the smart contracts manually or via CLI.

### 1. Prerequisites
- **Stellar CLI**: Install via `cargo install --locked stellar-cli`.
- **Identity**: Create a deployment identity:
  ```bash
  stellar keys add deployer --network testnet
  ```
- **Funding**: Fund your account using Friendbot:
  ```bash
  curl "https://friendbot.stellar.org/?addr=$(stellar keys address deployer)"
  ```

### 2. Build Contracts
Compile the Rust contracts to WASM:
```bash
stellar contract build
```

### 3. Deploy
Deploy the WASM files to the Testnet:
```bash
# Example for the Token contract
stellar contract deploy \
  --wasm ./target/wasm32-unknown-unknown/release/blockchain-swap_token.wasm \
  --source deployer \
  --network testnet
```
**Capture the returned Contract ID** (e.g., `CDLZFC...`) and save it for your configuration.

---

## 📱 Mobile Responsive Verification

To verify responsiveness during deployment:
1. Open your live demo in Chrome/Brave.
2. Open **DevTools (F12)**.
3. Click the **Device Toolbar** icon (or `Ctrl+Shift+M`).
4. Select **iPhone 12 Pro** or **Pixel 7** breakpoint.
5. **Take a screenshot** of the mobile view to include in your README.
