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

const contractAbi = require('../abi/contract.abi.json')

interface State {
  userAddress: string | null
  price: BigNumber
  currentPhase: number
  isCombinable: boolean
  phaseValues: string
  phaseKey: string[]
  ownerTokens: {
    token: number
    value: string
  }[]
  loading: boolean
  balance: BigNumber
  errorMessage: string | JSX.Element | null
}

const defaultState: State = {
  userAddress: null,
  price: BigNumber.from(0),
  currentPhase: 0,
  isCombinable: false,
  phaseValues: '',
  phaseKey: [],
  ownerTokens: [],
  loading: false,
  balance: BigNumber.from(0),
  errorMessage: null,
}

const reducer = (state: any, action: any) => {
  state[action.key] = action.value
  return { ...state }
}

const MatchTemplate = () => {
  const { account, activate, deactivate, active, library } = useWeb3React<Web3Provider>()
  const [state, dispatch] = useReducer(reducer, defaultState)
  const [contract, setContract] = useState<any>()
  const [isCheck, setIsCheck] = useState<string[]>([])

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

  useEffect(() => {
    if (state.userAddress && state.currentPhase) {
      refreshOwnerTokens()
    }
  }, [state.userAddress, state.currentPhase])

  const refreshContractState = async (): Promise<void> => {
    dispatch({ key: 'price', value: await contract.price() })
    dispatch({ key: 'currentPhase', value: (await contract.currentPhase()).toNumber() })
    dispatch({ key: 'isCombinable', value: await contract.isCombinable() })
  }

  const refreshOwnerTokens = async (): Promise<void> => {
    const walletOfOwner = await contract.walletOfOwner(state.userAddress)
    const values = await Promise.all(
      walletOfOwner.map(async (token: BigNumber) =>
        getValueInPhase(token.toNumber(), state.currentPhase)
      )
    )
    const tokens = values.filter((elm) => elm.value != '')
    console.log(tokens)
    dispatch({ key: 'ownerTokens', value: tokens })
  }

  const refreshContractStateHasAddress = async (): Promise<void> => {
    dispatch({ key: 'balance', value: await contract.balanceOf(state.userAddress) })
  }

  const getValue = async (token: number): Promise<string> => {
    return await contract.getValue(token)
  }

  const getValueInPhase = async (token: number, phase: number) => {
    return {
      token: token,
      value: await contract.newValues(0, token),
    }
  }

  const refreshStateAfterMint = async (): Promise<void> => {
    dispatch({ key: 'currentPhase', value: (await contract.currentPhase()).toNumber() })
    refreshOwnerTokens()
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

  const matchStr = async (): Promise<void> => {
    if (state.isCombinable) {
      alert('Cannot perform this action when combining is active!')
    } else {
      try {
        dispatch({ key: 'loading', value: true })
        let transaction
        if (!state.isPaused) {
          transaction = await contract.matchStr(isCheck)
        }
        setIsCheck([])
        // dispatch({ key: 'loading', value: false })
        await transaction.wait()
        await refreshStateAfterMint()
      } catch (e) {
        console.log(e)
        alert(
          'An error occurred during the transaction. \n\nPlease check and ensure you have sufficient Gas and funds to complete this transaction.\n\nTry reconnecting or switching to a different wallet, then refresh the page to proceed with the transaction.'
        )
      } finally {
        dispatch({ key: 'loading', value: false })
      }
    }
  }

  const handleClick = (e: any) => {
    const { id, checked } = e.target
    setIsCheck([...isCheck, id])
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id))
    }
  }

  return (
    <div className="relative bg-black min-h-screen flex justify-center items-center pt-[60px] sm:pt-[72px]">
      {state.loading ? <Loading /> : null}
      <div className="max-w-7xl w-full px-8 mx-auto md:mt-8 flex flex-col gap-8 items-center justify-between animate-fadeIn text-white">
        <div className="w-full rounded-3xl flex gap-8 text-center items-center justify-center mb-10 md:mb-0">
          <div className="animate-toBottom font-megrim text-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-flow-col-dense items-center gap-16">
              <div className=" flex flex-col justify-center items-center gap-4">
                <div
                  onClick={(e) => handleClick(e)}
                  className="border-2 max-w-xs w-full aspect-square leading-snug flex justify-center items-center text-[4rem] cursor-pointer hover:font-bold hover:border-4"
                >
                  {isCheck.map(
                    (token) =>
                      state.ownerTokens.find((elm: any) => elm.token == token)?.value + '\n'
                  )}
                </div>
                <button
                  className="w-[280px] h-[50px] bg-[linear-gradient(45deg,#AF00DB_0%,#FF8A00_100%)] hover:bg-[linear-gradient(45deg,#AF00DB_50%,#FF8A00_100%)] text-white hover:text-white border-none rounded-none hover:shadow-[3px_3px_8px_0_rgba(91,91,91,1)] py-2 font-semibold text-2xl uppercase disabled:bg-[#B7B7B7] disabled:text-[#090909] disabled:hover:cursor-not-allowed"
                  disabled={state.isCombinable || isCheck.length == 0}
                  onClick={() => matchStr()}
                >
                  <span className="flex items-center relative h-full w-full opacity-100 justify-center">
                    <span className="flex items-center px-2">Match</span>
                  </span>
                </button>
              </div>

              <div className="grid gap-4 grid-cols-[repeat(5,minmax(0,150px))] sm:grid-cols-[repeat(4,minmax(0,150px))]">
                {state.ownerTokens && state.ownerTokens.length == 0 ? (
                  <>You don&lsquo;t have any tokens.</>
                ) : (
                  <>
                    {state.ownerTokens.map((elm: any, i: number) => (
                      <label key={i} htmlFor={elm.token}>
                        <div
                          onClick={(e) => handleClick(e)}
                          className="border-2 max-w-xs w-full leading-snug aspect-square flex justify-center items-center text-[4rem] cursor-pointer hover:font-bold hover:border-4"
                          style={
                            isCheck.includes(elm.token)
                              ? {
                                  borderWidth: '3px',
                                  borderColor: '#2771ff',
                                  fontWeight: 'bold',
                                  color: '#2771ff',
                                }
                              : {
                                  borderWidth: '2px',
                                  borderColor: 'white',
                                  fontWeight: 'normal',
                                  color: 'white',
                                }
                          }
                        >
                          <input
                            type="checkbox"
                            id={elm.token}
                            value={elm.token}
                            className="absolute opacity-0 -left-full"
                          />
                          {elm.value}
                        </div>
                      </label>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchTemplate
