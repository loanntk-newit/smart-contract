import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";

const NETWORK = "goerli";
// const NETWORK = "mainnet";
const INFURA_API_KEY = "a4e894db57a74d9ea47e4fe50cf0f095";
const PRIVATE_KEY =
  "471f4bddc870b6302918bcf9aae77954cae14bf11730a60bfdae62a4aa5390f1";
  // "b7d2f37d475830013e1f1fe8858686e43cebc6d16f88df7de2db4ae4e741f6e4";
const ETHERSCAN_API_KEY = "5MK5SDTQ25QQ1AI9EHZNH73N3TYZQ2FQXC";

const config: HardhatUserConfig = {
  defaultNetwork: NETWORK,
  networks: {
    hardhat: {},
    goerli: {
      url: `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    mainnet: {
      url: `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
export default config;
