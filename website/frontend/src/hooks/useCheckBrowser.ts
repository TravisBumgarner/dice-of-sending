import { useState, useEffect } from 'react'

interface BrowserCheckResult {
  isSupported: boolean
}

export const useCheckBrowser = (): BrowserCheckResult => {
  const [browserInfo, setBrowserInfo] = useState<BrowserCheckResult>({
    isSupported: false
  })

  useEffect(() => {
    const detectBrowser = (): BrowserCheckResult => {
      const userAgent = navigator.userAgent.toLowerCase()

      // Check for Chromium-based browsers
      // This includes Chrome, Edge, Opera, Brave, Vivaldi, etc.
      const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg')
      const isEdge = userAgent.includes('edg') // New Chromium-based Edge
      const isOpera = userAgent.includes('opr') || userAgent.includes('opera')
      const isBrave = userAgent.includes('brave') || (navigator as any).brave
      const isVivaldi = userAgent.includes('vivaldi')

      // Check for non-Chromium browsers that we want to exclude
      const isFirefox = userAgent.includes('firefox')
      const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome')
      const isIE = userAgent.includes('trident') || userAgent.includes('msie')

      let isChromiumBrowser = false

      if (isChrome) {
        isChromiumBrowser = true
      } else if (isEdge) {
        isChromiumBrowser = true
      } else if (isOpera) {
        isChromiumBrowser = true
      } else if (isBrave) {
        isChromiumBrowser = true
      } else if (isVivaldi) {
        isChromiumBrowser = true
      } else if (isFirefox) {
        isChromiumBrowser = false
      } else if (isSafari) {
        isChromiumBrowser = false
      } else if (isIE) {
        isChromiumBrowser = false
      }

      // Additional check for Chromium API availability
      // Many Chromium browsers expose the chrome object
      const hasChromiumAPIs = !!(window as any).chrome

      // Final determination - browser must be Chromium-based AND have Chromium APIs
      const isSupported = isChromiumBrowser && (hasChromiumAPIs || isChrome || isEdge)

      return {
        isSupported
      }
    }

    setBrowserInfo(detectBrowser())
  }, [])

  return browserInfo
}

export default useCheckBrowser
