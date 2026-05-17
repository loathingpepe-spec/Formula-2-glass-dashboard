"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function HeroSection() {
  const [price, setPrice] = useState(0.000042)
  const [marketCap, setMarketCap] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => {
        const newPrice = prev + (Math.random() * 0.000005 - 0.000002)
        return Math.max(0.000001, newPrice)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setMarketCap(Math.floor(price * 690000000))
  }, [price])

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="relative float-animation">
        <div className="goblin-glow absolute inset-0 rounded-full" />
        <Image
          src="/images/goblin.png"
          alt="David Goblins - The Soul Snatcher"
          width={400}
          height={400}
          className="relative z-10 rounded-full"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold text-primary md:text-6xl">
          DAVID GOBLINS
        </h1>
        <p className="max-w-md text-lg text-muted-foreground italic">
          &quot;Snatchin&apos; souls, smokin&apos; memes, makin&apos; you money so you can live your dreams.&quot;
        </p>
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-primary/30 bg-card/50 px-6 py-4 backdrop-blur-sm">
          <span className="text-3xl font-mono font-bold text-foreground">
            ${price.toFixed(8)}
          </span>
          <span className="text-sm text-muted-foreground">
            ${marketCap.toLocaleString()} Market Cap
          </span>
        </div>
      </div>
    </section>
  )
}
