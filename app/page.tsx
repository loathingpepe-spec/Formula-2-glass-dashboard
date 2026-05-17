import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GoblinGame } from "@/components/goblin-game"
import { ChartSection } from "@/components/chart-section"
import { ComingSoonSection } from "@/components/coming-soon-section"
import { PhantomProvider } from "@/components/phantom-provider"

export default function Home() {
  return (
    <PhantomProvider>
      <main className="min-h-screen">
        <Header />
        <HeroSection />
        <GoblinGame />
        <ChartSection />
        <ComingSoonSection />
        <footer className="border-t border-primary/20 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} wallin.fun - All rights reserved</p>
        </footer>
      </main>
    </PhantomProvider>
  )
}
