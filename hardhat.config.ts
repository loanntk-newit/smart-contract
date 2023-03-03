import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const NETWORK = "goerli";
// const NETWORK = "mainnet";
const ALCHAEMY_API_KEY_TESTNET = "vCW9I_OL1TEq7kAXbwB5ae2iQTmvu3Ro";
const ALCHAEMY_API_KEY_MAINNET = "LQf3lQx4zdkyVpzzloPk325iKIPYbyum";
const PRIVATE_KEY = "vCW9I_OL1TEq7kAXbwB5ae2iQTmvu3Ro";
const API_KEY = "5MK5SDTQ25QQ1AI9EHZNH73N3TYZQ2FQXC";

const config: HardhatUserConfig = {
  defaultNetwork: NETWORK,
  networks: {
    hardhat: {},
    goerli: {
      url: `https://eth-${NETWORK}.g.alchemy.com/v2/${ALCHAEMY_API_KEY_TESTNET}`,
      accounts: [`0x${PRIVATE_KEY}`],
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
    apiKey: API_KEY,
  },
  // paths: {
  //   sources: "./contracts",
  //   tests: "./test",
  //   cache: "./cache",
  //   artifacts: "./artifacts",
  // },
};
export default config;
