'use client'

import Script from 'next/script'

export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = 'G-ETQT995RPQ'
  const GOOGLE_ADS_ID = 'AW-17232820139'

  return (
    <>
      {/* Google tag (gtag.js) - Analytics + Ads */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Google Analytics
          gtag('config', '${GA_MEASUREMENT_ID}');
          
          // Google Ads
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  )
}

