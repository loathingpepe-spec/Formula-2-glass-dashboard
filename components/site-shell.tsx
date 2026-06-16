"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GoblinGame } from "@/components/goblin-game"
import { Leaderboard } from "@/components/leaderboard"
import { ChartSection } from "@/components/chart-section"
import { ComingSoonSection } from "@/components/coming-soon-section"
import { MembershipDialog } from "@/components/membership-dialog"
import { MemberProvider } from "@/components/member-provider"
import { PhantomProvider } from "@/components/phantom-provider"

export function SiteShell() {
  const [showMembership, setShowMembership] = useState(false)

  return (
    <PhantomProvider>
      <MemberProvider>
        <main className="min-h-screen">
          <Header onJoinClick={() => setShowMembership(true)} />
          <HeroSection />
          <GoblinGame onJoinClick={() => setShowMembership(true)} />
          <Leaderboard />
          <ChartSection />
          <ComingSoonSection />
          <footer className="border-t border-primary/20 py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} wallin.fun - All rights reserved</p>
          </footer>
        </main>
        <MembershipDialog open={showMembership} onOpenChange={setShowMembership} />
      </MemberProvider>
    </PhantomProvider>
  )
}
