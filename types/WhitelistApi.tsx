import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

export default new (class Whitelist {
  private merkleTree!: MerkleTree

  public async getMerkleTree(): Promise<MerkleTree> {
    if (this.merkleTree === undefined && process.env.NEXT_PUBLIC_API_URL) {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL)
      const whitelist = (await res.json()).data.WHITELIST
      const leafNodes = JSON.parse(whitelist).map((addr: string) => keccak256(addr))
      this.merkleTree = new MerkleTree(leafNodes, keccak256, {
        sortPairs: true,
      })
    }

    return this.merkleTree
  }

  public async getProofForAddress(address: string): Promise<string[]> {
    const merkleTree = await this.getMerkleTree()
    return merkleTree.getHexProof(keccak256(address))
  }

  public async getRawProofForAddress(address: string): Promise<string> {
    const rawProofForAddress = await this.getProofForAddress(address)
    return rawProofForAddress.toString().replaceAll("'", '').replaceAll(' ', '')
  }

  public async contains(address: string): Promise<boolean> {
    const merkleTree = await this.getMerkleTree()
    return merkleTree.getLeafIndex(Buffer.from(keccak256(address))) >= 0
  }
})()
