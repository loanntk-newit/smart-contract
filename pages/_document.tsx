import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { GA_TRACKING_ID } from '../lib/gtag'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width, minimum-scale=1.0" />
        <meta name="referrer" content="origin" />
        <meta property="description" content={process.env.NEXT_PUBLIC_SITE_DESCRIPTION} />

        <meta name="og:keywords" content="hayaoki, nft, nfts, blockchain, token" />
        <meta property="og:image" content="/thumbnail.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={process.env.NEXT_PUBLIC_SITE_NAME} />
        <meta property="og:title" content={process.env.NEXT_PUBLIC_SITE_NAME} />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL} />
        <meta property="og:description" content={process.env.NEXT_PUBLIC_SITE_DESCRIPTION} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:image:src" content="/thumbnail.jpg" />
        <meta property="twitter:type" content="website" />
        <meta property="twitter:site_name" content={process.env.NEXT_PUBLIC_SITE_NAME} />
        <meta property="twitter:title" content={process.env.NEXT_PUBLIC_SITE_NAME} />
        <meta property="twitter:url" content={process.env.NEXT_PUBLIC_SITE_URL} />
        <meta property="twitter:description" content={process.env.NEXT_PUBLIC_SITE_DESCRIPTION} />

        <link rel="image_src" href="/thumbnail.jpg" />
        <link rel="icon" type="image/png" href="/favicon.ico" />

        {/* Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Megrim&display=swap"
          rel="stylesheet"
        />

        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
