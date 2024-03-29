import type { NextPageWithAuth } from 'next'
import useTitle from '../hooks/useTitle'
import React from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import CombineTemplate from '../components/Combine'
import Layout from '../layouts/Layout'

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  return library
}

const Combine: NextPageWithAuth = () => {
  useTitle('COMBINE')

  return (
    <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <CombineTemplate />
      </Web3ReactProvider>
    </React.StrictMode>
  )
}

Combine.layout = Layout

export default Combine
