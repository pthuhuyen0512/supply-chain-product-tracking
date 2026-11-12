import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.34",
        settings: {
          evmVersion: "paris",
          optimizer: {
            enabled: false,
          },
        },
      },
      production: {
        version: "0.8.34",
        settings: {
          evmVersion: "paris",
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    ganache: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:7545",
      // Use the local Ganache node's unlocked accounts to sign transactions
      // tài khoản đầu tiên sẽ là người deploy, tức Admin
      accounts: "remote",
    },
  },
});
