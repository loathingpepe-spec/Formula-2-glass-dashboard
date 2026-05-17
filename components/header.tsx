"use client"

import { Button } from "@/components/ui/button"
import { useModal, usePhantom, useSolana } from "@phantom/react-sdk"

export function Header() {
  const { open } = useModal()
  const { isConnected, user } = usePhantom()
  const { solana } = useSolana()

  const handleSignMessage = async () => {
    if (!solana) return
    try {
      const signature = await solana.signMessage("Welcome to wallin.fun - Snatchin' souls, smokin' memes!")
      console.log("Message signed:", signature)
    } catch (error) {
      console.error("Sign message failed:", error)
    }
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-xl font-bold text-primary">wallin.fun</div>
        {isConnected && user ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSignMessage}
              className="border-primary/50 text-primary hover:bg-primary/10 font-bold"
            >
              SIGN
            </Button>
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-bold"
            >
              {truncateAddress(user.addresses?.solana?.[0] || "")}
            </Button>
          </div>
        ) : (
          <Button
            onClick={open}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/30"
          >
            CONNECT WALLET
          </Button>
        )}
      </div>
    </header>
  )
}
