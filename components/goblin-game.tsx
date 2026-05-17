"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface FallingSol {
  id: number
  x: number
  y: number
  speed: number
  collected: boolean
}

interface CollectEffect {
  id: number
  x: number
  y: number
}

export function GoblinGame() {
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [fallingSols, setFallingSols] = useState<FallingSol[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [collectEffects, setCollectEffects] = useState<CollectEffect[]>([])
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setIsPlaying(true)
    setGameOver(false)
    setFallingSols([])
    setCollectEffects([])
  }

  const collectSol = useCallback((id: number, x: number, y: number) => {
    setFallingSols(prev => {
      const sol = prev.find(s => s.id === id)
      if (!sol || sol.collected) return prev
      return prev.filter(s => s.id !== id)
    })
    setScore(prev => prev + 1)
    
    // Add collect effect
    const effectId = Date.now() + Math.random()
    setCollectEffects(prev => [...prev, { id: effectId, x, y }])
    setTimeout(() => {
      setCollectEffects(prev => prev.filter(e => e.id !== effectId))
    }, 400)
  }, [])

  // Handle touch/click on game area for better mobile responsiveness
  const handleGameAreaInteraction = useCallback((clientX: number, clientY: number) => {
    if (!gameAreaRef.current || !isPlaying) return
    
    const rect = gameAreaRef.current.getBoundingClientRect()
    const touchX = ((clientX - rect.left) / rect.width) * 100
    const touchY = ((clientY - rect.top) / rect.height) * 100
    
    // Find the closest sol within tap range (increased hitbox for touch)
    const hitRadius = 12 // percentage-based hit radius
    
    setFallingSols(prev => {
      let collected = false
      let collectedX = 0
      let collectedY = 0
      
      const updated = prev.filter(sol => {
        if (sol.collected) return false
        
        const dx = sol.x - touchX
        const dy = sol.y - touchY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < hitRadius && !collected) {
          collected = true
          collectedX = sol.x
          collectedY = sol.y
          return false
        }
        return true
      })
      
      if (collected) {
        setScore(s => s + 1)
        const effectId = Date.now() + Math.random()
        setCollectEffects(e => [...e, { id: effectId, x: collectedX, y: collectedY }])
        setTimeout(() => {
          setCollectEffects(e => e.filter(ef => ef.id !== effectId))
        }, 400)
      }
      
      return updated
    })
  }, [isPlaying])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleGameAreaInteraction(touch.clientX, touch.clientY)
  }, [handleGameAreaInteraction])

  const handleClick = useCallback((e: React.MouseEvent) => {
    handleGameAreaInteraction(e.clientX, e.clientY)
  }, [handleGameAreaInteraction])

  const shareOnTwitter = () => {
    const tweetText = encodeURIComponent(
      `🎮 I just stayed hard for $GOBLINS! 💀\n\nScore: ${score} SOL collected\n\n@DavidGoblins #StayHard #Solana`
    )
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank")
  }

  // Game timer
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying])

  // Spawn falling SOL coins
  useEffect(() => {
    if (!isPlaying) return

    const spawnInterval = setInterval(() => {
      const newSol: FallingSol = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: -10,
        speed: Math.random() * 2 + 2,
        collected: false,
      }
      setFallingSols(prev => [...prev, newSol])
    }, 500)

    return () => clearInterval(spawnInterval)
  }, [isPlaying])

  // Animate falling SOL coins with requestAnimationFrame for smoother animation
  useEffect(() => {
    if (!isPlaying) return

    let lastTime = performance.now()
    let animationId: number

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67 // normalize to ~60fps
      lastTime = currentTime

      setFallingSols(prev => 
        prev
          .map(sol => ({ ...sol, y: sol.y + sol.speed * deltaTime }))
          .filter(sol => sol.y < 110 && !sol.collected)
      )

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isPlaying])

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-primary text-center mb-8">
          SNATCH THE SOL
        </h2>

        <div 
          ref={gameAreaRef}
          className="relative bg-card/50 border-2 border-primary/30 rounded-2xl overflow-hidden select-none"
          style={{ height: "400px", touchAction: "none" }}
          onTouchStart={isPlaying ? handleTouchStart : undefined}
          onClick={isPlaying ? handleClick : undefined}
        >
          {/* Game HUD */}
          {isPlaying && (
            <div className="absolute top-4 left-0 right-0 z-10 flex justify-between px-6 pointer-events-none">
              <div className="bg-background/80 px-4 py-2 rounded-full border border-primary/50">
                <span className="text-primary font-bold">{score} SOL</span>
              </div>
              <div className="bg-background/80 px-4 py-2 rounded-full border border-primary/50">
                <span className="text-primary font-bold">{timeLeft}s</span>
              </div>
            </div>
          )}

          {/* Collect effects */}
          {collectEffects.map(effect => (
            <div
              key={effect.id}
              className="absolute pointer-events-none z-20 animate-ping"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/50" />
            </div>
          ))}

          {/* +1 score popup */}
          {collectEffects.map(effect => (
            <div
              key={`text-${effect.id}`}
              className="absolute pointer-events-none z-30 text-primary font-black text-2xl"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                transform: "translate(-50%, -50%)",
                animation: "floatUp 0.4s ease-out forwards",
              }}
            >
              +1
            </div>
          ))}

          {/* Falling SOL coins */}
          {fallingSols.map(sol => (
            <div
              key={sol.id}
              className="absolute w-14 h-14 md:w-12 md:h-12 pointer-events-none"
              style={{
                left: `${sol.x}%`,
                top: `${sol.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div 
                className="w-full h-full rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-lg shadow-primary/50"
                style={{ 
                  animation: "spin 2s linear infinite",
                }}
              >
                <span className="text-background font-black text-xs">SOL</span>
              </div>
            </div>
          ))}

          {/* Start screen */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/80">
              <Image
                src="/images/goblin.png"
                alt="David Goblin"
                width={150}
                height={150}
                className="rounded-full border-4 border-primary animate-pulse"
              />
              <p className="text-muted-foreground text-center max-w-xs px-4">
                Tap the falling SOL coins before they escape! You have 30 seconds.
              </p>
              <Button
                onClick={startGame}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl px-8 py-6 active:scale-95 transition-transform"
              >
                START SNATCHIN&apos;
              </Button>
            </div>
          )}

          {/* Game over screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/90">
              <h3 className="text-4xl font-black text-primary">GAME OVER</h3>
              <div className="text-center">
                <p className="text-6xl font-black text-foreground mb-2">{score}</p>
                <p className="text-muted-foreground">SOL COLLECTED</p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={startGame}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 font-bold active:scale-95 transition-transform"
                >
                  PLAY AGAIN
                </Button>
                <Button
                  onClick={shareOnTwitter}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold active:scale-95 transition-transform"
                >
                  SHARE ON X
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground mt-4 text-sm">
          Stay hard and snatch those souls
        </p>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1.5);
          }
        }
      `}</style>
    </section>
  )
}
