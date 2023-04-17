import { ethers } from 'ethers'

export const getContractProvider = async () => {
  const ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const contractAbi = require('../abi/contract.abi.json')
  const provider = new ethers.providers.InfuraProvider(
    process.env.NEXT_PUBLIC_TEST_MINT ? 'goerli' : 'homestead'
  )
  const icoContract = ADDRESS && new ethers.Contract(ADDRESS, contractAbi, provider)
  return icoContract
}