import { ethers } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory("BG_BLACK");
  const contract = await Contract.deploy();
  await contract.deployed();
  console.log(`Deployed to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat clean
// npx hardhat compile
// npx hardhat run scripts/deploy.ts --network sepolia
// npx hardhat verify --network sepolia 0xf9D634D9Df20cEdD982Bb7d5351914f2F0A4C843
// npx hardhat verify --network sepolia [ADDRESS] --show-stack-traces