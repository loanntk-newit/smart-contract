import { AbstractConnector } from '@web3-react/abstract-connector'

export interface WalletConfig {
  defaultConnector?: Connectors
  chainId: number
  rpcUrl: string
  supportedChainIds: number[]
  unsupportedChainSetup: {
    [key: number]: Network
  }
}
export interface Network {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export enum Connectors {
  INJECTED,
  WALLET_CONNECT,
  ETH,
}

export interface ConnectorList {
  [key: number]: AbstractConnector
}
