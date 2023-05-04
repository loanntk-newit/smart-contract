import type { NextPageWithAuth } from 'next'
import useTitle from '../hooks/useTitle'
import React from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import Layout from '../layouts/Layout'
import MatchTemplate from '../components/Match'

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  return library
}

const Match: NextPageWithAuth = () => {
  useTitle('MATCH')

  return (
    <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <MatchTemplate />
      </Web3ReactProvider>
    </React.StrictMode>
  )
}

Match.layout = Layout

export default Match
