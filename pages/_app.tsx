import '../styles/globals.scss'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '../functions/animate-on-scroll'
import type { AppPropsWithLayout } from 'next/app'

function MyApp({ Component, pageProps: { ...pageProps } }: AppPropsWithLayout) {
  const Layout = Component.layout || (({ children }) => <>{children}</>)

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
