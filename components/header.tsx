"use client"

import { Button } from "@/components/ui/button"
import { useModal, usePhantom } from "@phantom/react-sdk"
import { useMember } from "@/components/member-provider"

export function Header({ onJoinClick }: { onJoinClick: () => void }) {
  const { open } = useModal()
  const { isConnected, user } = usePhantom()
  const { member, signOut } = useMember()

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-xl font-bold text-primary">wallin.fun</div>
        <div className="flex items-center gap-2">
          {member ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-bold text-foreground">{member.name}</span>
                <span className="text-xs text-primary">Member #{member.member_number}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="border-primary/50 text-primary hover:bg-primary/10 font-bold"
              >
                LOG OUT
              </Button>
            </div>
          ) : (
            <Button
              onClick={onJoinClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/30"
            >
              JOIN FREE
            </Button>
          )}

          {isConnected && user ? (
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-bold"
            >
              {truncateAddress(user.addresses?.solana?.[0] || "")}
            </Button>
          ) : (
            <Button
              onClick={open}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-bold hidden sm:inline-flex"
            >
              CONNECT WALLET
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
