import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <div className="w-full bg-black bg-opacity-20 fixed z-50 ease-in duration-300">
      <div className="mx-auto max-w-5xl">
        <nav className="relative container z-50 flex flex-wrap items-center justify-between py-4 px-8 mx-auto xl:px-0">
          <div className="flex">
            {/* <img src="/logo.png" alt="NAKAMIGONE" className="h-10" /> */}
          </div>
          <div className="flex gap-8 items-center">
            <div className="text-center lg:flex lg:items-center">
              <ul className="items-center justify-end flex-1 list-none lg:flex">
                <li className="flex items-center px-3 gap-2">
                  {process.env.NEXT_PUBLIC_URL_DISCORD ? (
                    <Link href={process.env.NEXT_PUBLIC_URL_DISCORD}>
                      <a target={'_blank'}>
                        <img
                          src="./imgs/icons/discord.png"
                          alt="Discord"
                          className="w-7 h-7 sm:w-10 sm:h-10"
                        />
                      </a>
                    </Link>
                  ) : null}
                  {process.env.NEXT_PUBLIC_URL_TWITTER ? (
                    <Link href={process.env.NEXT_PUBLIC_URL_TWITTER}>
                      <a target={'_blank'}>
                        <img
                          src="./imgs/icons/twitter.png"
                          alt="Twitter"
                          className="w-7 h-7 sm:w-10 sm:h-10"
                        />
                      </a>
                    </Link>
                  ) : null}
                  {process.env.NEXT_PUBLIC_URL_OPENSEA ? (
                    <Link href={process.env.NEXT_PUBLIC_URL_OPENSEA}>
                      <a target={'_blank'}>
                        <img
                          src="./imgs/icons/opensea.png"
                          alt="Opensea"
                          className="w-7 h-7 sm:w-10 sm:h-10"
                        />
                      </a>
                    </Link>
                  ) : null}
                  {process.env.NEXT_PUBLIC_URL_ETHERSCAN ? (
                    <Link href={process.env.NEXT_PUBLIC_URL_ETHERSCAN}>
                      <a target={'_blank'}>
                        <img
                          src="./imgs/icons/etherscan.png"
                          alt="Etherscan"
                          className="w-7 h-7 sm:w-10 sm:h-10"
                        />
                      </a>
                    </Link>
                  ) : null}
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Header