import React from 'react'
import { useEffect, useReducer, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import Loading from './Loading'
import { injected } from '../utils/connectors'
import { switchChain } from '../utils/switchChain'
import config from '../config'
import { getContractProvider } from '../utils/getContractProvider'
import MintWidget from './MintWidget'

const contractAbi = require('../abi/contract.abi.json')

interface State {
  userAddress: string | null
  price: BigNumber
  currentPhase: number
  totalSupply: number
  isCombinable: boolean
  phaseValues: string
  phaseKey: string[]
  loading: boolean
  balance: BigNumber
  errorMessage: string | JSX.Element | null
}

const defaultState: State = {
  userAddress: null,
  price: BigNumber.from(0),
  currentPhase: 0,
  totalSupply: 0,
  isCombinable: false,
  phaseValues: '',
  phaseKey: [],
  loading: false,
  balance: BigNumber.from(0),
  errorMessage: null,
}

const reducer = (state: any, action: any) => {
  state[action.key] = action.value
  return { ...state }
}

const CombineTemplate = () => {
  const { account, activate, deactivate, active, library } = useWeb3React<Web3Provider>()
  const [state, dispatch] = useReducer(reducer, defaultState)
  const [contract, setContract] = useState<any>()
  const [chooseValue, setChooseValue] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      setContract(await getContractProvider())
    }
    init()
  }, [])

  useEffect(() => {
    const init = async () => {
      await connectWallet()
    }
    if (!active) {
      init()
      dispatch({
        key: 'userAddress',
        value: account,
      })
    }
  }, [])

  useEffect(() => {
    if (account) {
      dispatch({
        key: 'userAddress',
        value: account,
      })
    }
  }, [account])

  useEffect(() => {
    if (state.userAddress) {
      const refresh = async () => {
        await refreshContractStateHasAddress()
      }
      refresh()
    }
  }, [state.userAddress])

  useEffect(() => {
    if (library) {
      setContract(
        new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          contractAbi,
          library.getSigner()
        )
      )
    }
  }, [library])

  useEffect(() => {
    if (contract) {
      const init = async () => {
        dispatch({ key: 'loading', value: true })
        await refreshContractState()
        dispatch({ key: 'loading', value: false })
      }
      init()
    }
  }, [contract])

  useEffect(() => {
    if (contract && state.currentPhase) {
      const init = async () => {
        dispatch({ key: 'phaseValues', value: await contract.phaseValues(state.currentPhase) })
        // dispatch({ key: 'phaseKey', value: await contract.phaseKey(state.currentPhase, 0) })
      }
      init()
    }
  }, [contract, state.currentPhase])

  const refreshContractState = async (): Promise<void> => {
    dispatch({ key: 'price', value: await contract.price() })
    dispatch({ key: 'currentPhase', value: (await contract.currentPhase()).toNumber() })
    dispatch({ key: 'totalSupply', value: (await contract.totalSupply()).toNumber() })
    dispatch({ key: 'isCombinable', value: await contract.isCombinable() })
  }

  const refreshContractStateHasAddress = async (): Promise<void> => {
    dispatch({ key: 'balance', value: await contract.balanceOf(state.userAddress) })
  }

  const refreshStateAfterMint = async (): Promise<void> => {
    dispatch({ key: 'currentPhase', value: (await contract.currentPhase()).toNumber() })
    dispatch({ key: 'totalSupply', value: (await contract.totalSupply()).toNumber() })
  }

  const connectWallet = async () => {
    await activate(
      injected,
      async (error) => {
        const network = config.unsupportedChainSetup[config.chainId]
        const hasSetup = await switchChain(
          network ?? { chainId: `0x${parseInt(config.chainId.toString()).toString(16)}` }
        )
        if (hasSetup) {
          setError(null)
          await activate(injected, async () => {
            console.log(`${error.message}`)
          })
        } else {
          setError(`Unable to connect to required network ${config.chainId}`)
          alert(`Unable to connect to required network ${config.chainId}`)
        }
      },
      false
    )
  }

  const setError = (error: any = null): void => {
    let errorMessage = 'Unknown error...'

    if (null === error || typeof error === 'string') {
      errorMessage = error
    } else if (typeof error === 'object') {
      if (error?.error?.message !== undefined) {
        errorMessage = error.error.message
      } else if (error?.data?.message !== undefined) {
        errorMessage = error.data.message
      } else if (error?.message !== undefined) {
        errorMessage = error.message
      } else if (React.isValidElement(error)) {
        dispatch({ key: 'errorMessage', value: error })
        return
      }
    }
    dispatch({
      key: 'errorMessage',
      value:
        null === errorMessage ? null : errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
    })
  }

  const isWalletConnected = (): boolean => {
    return state.userAddress !== null
  }

  const mintTokens = async (amount: number, price: string): Promise<void> => {
    try {
      dispatch({ key: 'loading', value: true })
      let transaction
      if (!state.isPaused) {
        console.log(amount, chooseValue)
        transaction = await contract.mint(amount, chooseValue, {
          value: ethers.utils.parseUnits(price, 'ether'),
        })
      }
      setChooseValue(null)
      dispatch({ key: 'loading', value: false })
      await transaction.wait()
      await refreshStateAfterMint()
    } catch (e) {
      console.log(e)
      alert(
        'An error occurred during the transaction. \n\nPlease check and ensure you have sufficient Gas and funds to complete this transaction.\n\nTry reconnecting or switching to a different wallet, then refresh the page to proceed with the transaction.'
      )
      dispatch({ key: 'loading', value: false })
    }
  }

  const mintPack = async (price: string): Promise<void> => {
    try {
      dispatch({ key: 'loading', value: true })
      let transaction
      if (!state.isPaused) {
        transaction = await contract.mintPack({
          value: ethers.utils.parseUnits(price, 'ether'),
        })
      }
      setChooseValue(null)
      dispatch({ key: 'loading', value: false })
      await transaction.wait()
      await refreshStateAfterMint()
    } catch (e) {
      console.log(e)
      alert(
        'An error occurred during the transaction. \n\nPlease check and ensure you have sufficient Gas and funds to complete this transaction.\n\nTry reconnecting or switching to a different wallet, then refresh the page to proceed with the transaction.'
      )
      dispatch({ key: 'loading', value: false })
    }
  }

  return (
    <div className="relative bg-black min-h-screen flex justify-center items-center pt-[60px] sm:pt-[72px]">
      {state.loading ? <Loading /> : null}
      <div className="max-w-7xl w-full px-8 mx-auto md:mt-8 flex flex-col gap-8 items-center justify-between animate-fadeIn text-white">
        <div className="w-full rounded-3xl flex gap-8 text-center items-center justify-center mb-10 md:mb-0">
          <div className="animate-toBottom font-megrim text-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-flow-col-dense items-center gap-16">
              <MintWidget
                userAddress={state.userAddress}
                price={state.price}
                currentPhase={state.currentPhase}
                totalSupply={state.totalSupply}
                phaseValues={state.phaseValues}
                phaseKey={state.phaseKey}
                balance={state.balance}
                loading={state.loading}
                isWalletConnected={active}
                disabled={!isWalletConnected()}
                mintTokens={(mintAmount, price) => mintTokens(mintAmount, price)}
                mintPack={(price) => mintPack(price)}
                connectWallet={() => connectWallet()}
                disconnectWallet={() => deactivate()}
              />
              <div className="grid gap-4 grid-cols-[repeat(5,minmax(0,150px))] sm:grid-cols-[repeat(4,minmax(0,150px))]">
                {state.phaseValues &&
                  state.phaseValues.split('').map((character: string, i: number) => (
                    <div
                      key={i}
                      className="border-2 max-w-xs w-full aspect-square flex justify-center items-center text-[4rem] cursor-pointer hover:font-bold hover:border-4"
                      style={{
                        borderWidth: chooseValue == character ? '3px' : '2px',
                        borderColor: chooseValue == character ? '#2771ff' : 'white',
                        fontWeight: chooseValue == character ? 'bold' : 'normal',
                        color: chooseValue == character ? '#2771ff' : 'white',
                      }}
                      onClick={() => setChooseValue(character)}
                    >
                      {character}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CombineTemplate
