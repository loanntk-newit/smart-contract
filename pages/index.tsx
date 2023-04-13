import type { NextPageWithAuth } from 'next'
import useTitle from '../hooks/useTitle'
import React from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import MintTemplate from '../components/MintTemplate'
import Layout from '../layouts/Layout'

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  return library
}

const Mint: NextPageWithAuth = () => {
  useTitle('')

  return (
    <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <MintTemplate />
      </Web3ReactProvider>
    </React.StrictMode>
  )
}

Mint.layout = Layout

export default Mint
