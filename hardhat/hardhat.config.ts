import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatIgnition from "@nomicfoundation/hardhat-ignition";

const config = defineConfig({
  plugins: [hardhatViem, hardhatIgnition],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {},
});

if (process.env.POLYGON_AMOY_RPC_URL) {
  config.networks!.amoy = {
    type: "http",
    chainType: "l1",
    url: process.env.POLYGON_AMOY_RPC_URL,
    accounts: process.env.POLYGON_AMOY_PRIVATE_KEY
      ? [process.env.POLYGON_AMOY_PRIVATE_KEY]
      : [],
  };
}

export default config;
