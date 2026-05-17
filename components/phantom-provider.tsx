"use client"

import { PhantomProvider as Provider, darkTheme } from "@phantom/react-sdk"
import { AddressType } from "@phantom/browser-sdk"
import type { ReactNode } from "react"

interface PhantomProviderProps {
  children: ReactNode
}

export function PhantomProvider({ children }: PhantomProviderProps) {
  return (
    <Provider
      config={{
        providers: ["google", "apple", "phantom", "injected", "deeplink"],
        appId: "wallin-fun",
        addressTypes: [AddressType.solana],
      }}
      theme={darkTheme}
      appIcon="/images/goblin.png"
      appName="wallin.fun"
    >
      {children}
    </Provider>
  )
}
