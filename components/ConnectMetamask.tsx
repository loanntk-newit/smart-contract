import React from 'react'
import { formatAddress } from '../utils/helpers'

interface Props {
  userAddress: string | null
  isWalletConnected: boolean
  connectWallet(): Promise<void>
  disconnectWallet(): void
}

const ConnectMetamask = (props: Props) => {
  return (
    <>
      <button
        type="button"
        className="w-[280px] h-[50px] text-default hover:text-default bg-transparent hover:bg-opacity-20 border-[3px] border-default hover:border-default rounded-none hover:shadow-[3px_3px_8px_0_rgba(91,91,91,1)] font-semibold text-2xl uppercase"
        onClick={!props.isWalletConnected ? props.connectWallet : props.disconnectWallet}
      >
        <span className="flex items-center justify-center">
          {!props.isWalletConnected ? (
            <span>Connect</span>
          ) : (
            <>
              <span className="mr-2">
                {props.userAddress && formatAddress(props.userAddress, 4)}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <rect width="256" height="256" fill="none"></rect>
                <line
                  x1="200"
                  y1="56"
                  x2="56"
                  y2="200"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                ></line>
                <line
                  x1="200"
                  y1="200"
                  x2="56"
                  y2="56"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                ></line>
              </svg>
            </>
          )}
        </span>
      </button>
    </>
  )
}

export default ConnectMetamask
