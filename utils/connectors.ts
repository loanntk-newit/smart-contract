import { InjectedConnector } from '@web3-react/injected-connector'

export const injected = new InjectedConnector({
  supportedChainIds: process.env.NEXT_PUBLIC_TEST_MINT ? [5] : [1],
})