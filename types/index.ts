import type { NextPage, NextPageWithAuth } from 'next'
import type { AppProps } from 'next/app'
import type { ReactElement } from 'react'

declare module 'next' {
  type PropsWithChildren = {
    children: ReactElement
  }
  type NextPageWithAuth<P = {}, IP = P> = NextPage<P, IP> & {
    layout?: ({ children }: PropsWithChildren) => ReactElement
  }
}

declare module 'next/app' {
  type AppPropsWithLayout<P = {}> = AppProps<P> & {
    Component: NextPageWithAuth<P>
  }
}
