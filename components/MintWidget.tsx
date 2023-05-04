import React from 'react'
import { utils, BigNumber } from 'ethers'
import ConnectMetamask from './ConnectMetamask'
interface Props {
  userAddress: string | null
  price: BigNumber
  currentPhase: number
  totalSupply: number
  phaseValues: string
  phaseKey: string[]
  balance: BigNumber
  loading: boolean
  isWalletConnected: boolean
  disabled: boolean
  mintTokens(mintAmount: number, price: string): Promise<void>
  mintPack(price: string): Promise<void>
  connectWallet(): Promise<void>
  disconnectWallet(): void
}

interface State {
  mintAmount: number
}

const defaultState: State = {
  mintAmount: 1,
}

export default class MintWidget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = defaultState
  }

  private incrementMintAmount(): void {
    this.setState({
      mintAmount: Math.min(10, this.state.mintAmount + 1),
    })
  }

  private decrementMintAmount(): void {
    this.setState({
      mintAmount: Math.max(1, this.state.mintAmount - 1),
    })
  }

  private getPrice(mintAmount: number): string {
    let amount = mintAmount
    return utils.formatEther(this.props.price.mul(amount))
  }

  private async mint(amount = this.state.mintAmount, pack = false): Promise<void> {
    if (amount != this.state.mintAmount) {
      this.setState({ mintAmount: amount })
    }
    if (pack) {
      this.setState({ mintAmount: this.props.phaseValues.length })
      let price = this.getPrice(this.props.phaseValues.length)
      await this.props.mintPack(price)
      return
    }
    if (this.props.currentPhase !== 0) {
      let price = this.getPrice(amount)
      await this.props.mintTokens(amount, price)
      return
    }
  }

  private textButtonMint(): string {
    if ((this.props.isWalletConnected || !this.props.loading) && this.props.currentPhase != 0) {
      return 'Mint'
    }
    return 'Not open yet'
  }

  render() {
    return (
      <>
        <div className="px-0 sm:p-8 w-full relative text-white pt-14">
          <div className="flex flex-col space-y-4 w-full">
            <div className="flex items-center justify-center flex-col space-x-2">
              <p className="text-5xl font-bold my-4">Total Supply: {this.props.totalSupply}</p>
            </div>
            <div className="flex flex-col gap-1 sm:gap-4 mx-auto">
              <div className="flex w-full items-center justify-between mx-auto">
                <button
                  type="button"
                  className="h-20 w-20 p-0 hover:bg-transparent rounded-none border-[3px] border-white border-opacity-30 hover:border-white hover:border-opacity-100 group"
                  onClick={() => this.decrementMintAmount()}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-6xl text-white text-opacity-30 group-hover:text-opacity-100">
                      -
                    </span>
                  </div>
                </button>
                <div className="h-20 w-20 mx-6 flex items-center justify-center">
                  <div className="font-bold text-4xl">{this.state.mintAmount}</div>
                </div>
                <button
                  type="button"
                  className="h-20 w-20 p-0 hover:bg-transparent rounded-none border-[3px] border-white border-opacity-30 hover:border-white hover:border-opacity-100 group"
                  onClick={() => this.incrementMintAmount()}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-6xl text-white text-opacity-30 group-hover:text-opacity-100">
                      +
                    </span>
                  </div>
                </button>
              </div>
              <p className="mt-4">Total: {this.getPrice(this.state.mintAmount)} ETH</p>
            </div>

            <div className="grid grid-cols-1 max-w-xs mx-auto justify-between items-center gap-5 pt-8">
              <ConnectMetamask
                userAddress={this.props.userAddress}
                isWalletConnected={this.props.isWalletConnected}
                connectWallet={() => this.props.connectWallet()}
                disconnectWallet={() => this.props.disconnectWallet()}
              />

              <button
                className="w-[280px] h-[50px] bg-[linear-gradient(45deg,#AF00DB_0%,#FF8A00_100%)] hover:bg-[linear-gradient(45deg,#AF00DB_50%,#FF8A00_100%)] text-white hover:text-white border-none rounded-none hover:shadow-[3px_3px_8px_0_rgba(91,91,91,1)] py-2 font-semibold text-2xl uppercase disabled:bg-[#B7B7B7] disabled:text-[#090909] disabled:hover:cursor-not-allowed"
                disabled={
                  !this.props.isWalletConnected ||
                  this.props.currentPhase == 0 ||
                  this.props.loading ||
                  this.props.disabled ||
                  this.props.phaseValues.length == 0
                }
                onClick={() => this.mint()}
              >
                <span className="flex items-center relative h-full w-full opacity-100 justify-center">
                  <span className="flex items-center px-2">{this.textButtonMint()}</span>
                </span>
              </button>

              <button
                className="w-[280px] h-[50px] bg-[linear-gradient(45deg,#AF00DB_0%,#FF8A00_100%)] hover:bg-[linear-gradient(45deg,#AF00DB_50%,#FF8A00_100%)] text-white hover:text-white border-none rounded-none hover:shadow-[3px_3px_8px_0_rgba(91,91,91,1)] py-2 font-semibold text-2xl uppercase disabled:bg-[#B7B7B7] disabled:text-[#090909] disabled:hover:cursor-not-allowed"
                disabled={
                  !this.props.isWalletConnected ||
                  this.props.currentPhase == 0 ||
                  this.props.loading ||
                  this.props.phaseValues.length == 0
                }
                onClick={() => this.mint(1, true)}
              >
                <span className="flex items-center relative h-full w-full opacity-100 justify-center">
                  <span className="flex items-center px-2">Mint 1 Pack</span>
                </span>
              </button>
              <hr />
              <button
                className="w-[280px] h-[50px] bg-[linear-gradient(45deg,#AF00DB_0%,#FF8A00_100%)] hover:bg-[linear-gradient(45deg,#AF00DB_50%,#FF8A00_100%)] text-white hover:text-white border-none rounded-none hover:shadow-[3px_3px_8px_0_rgba(91,91,91,1)] py-2 font-semibold text-2xl uppercase disabled:bg-[#B7B7B7] disabled:text-[#090909] disabled:hover:cursor-not-allowed"
                onClick={() => (window.location.href = '/combine')}
              >
                <span className="flex items-center relative h-full w-full opacity-100 justify-center">
                  <span className="flex items-center px-2">Combine &gt;&gt;</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }
}
