import { WalletConfig, Connectors } from './types'

const config: WalletConfig = {
  defaultConnector: Connectors.INJECTED,
  chainId: process.env.NEXT_PUBLIC_TEST_MINT ? 11155111 : 1,
  rpcUrl: 'https://mainnet.infura.io/v3/',
  supportedChainIds: process.env.NEXT_PUBLIC_TEST_MINT ? [11155111] : [1],
  unsupportedChainSetup: {},
}

export default config