import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'
import whitelistAddresses from '../config/whitelist.json'

export default new (class Whitelist {
  private merkleTree!: MerkleTree

  public getMerkleTree(): MerkleTree {
    if (this.merkleTree === undefined) {
      const leafNodes = whitelistAddresses.map((addr) => keccak256(addr))

      this.merkleTree = new MerkleTree(leafNodes, keccak256, {
        sortPairs: true,
      })
    }

    return this.merkleTree
  }

  public getProofForAddress(address: string): string[] {
    return this.getMerkleTree().getHexProof(keccak256(address))
  }

  public getRawProofForAddress(address: string): string {
    return this.getProofForAddress(address).toString().replaceAll("'", '').replaceAll(' ', '')
  }

  public contains(address: string): boolean {
    return this.getMerkleTree().getLeafIndex(Buffer.from(keccak256(address))) >= 0
  }
})()
