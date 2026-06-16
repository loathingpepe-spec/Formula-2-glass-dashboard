"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useMember } from "@/components/member-provider"
import { submitScore } from "@/app/actions"

type TokenType = "bonk" | "wif" | "pepe"

interface TokenConfig {
  type: TokenType
  points: number
  image: string
  label: string
  spawnWeight: number
  size: number
}

const TOKENS: Record<TokenType, TokenConfig> = {
  bonk: { type: "bonk", points: 10, image: "/images/bonk-coin.png", label: "BONK", spawnWeight: 60, size: 56 },
  wif: { type: "wif", points: 20, image: "/images/wif-coin.png", label: "WIF", spawnWeight: 30, size: 60 },
  pepe: { type: "pepe", points: 50, image: "/images/pepe-coin.png", label: "PEPE", spawnWeight: 10, size: 64 },
}

interface FallingToken {
  id: number
  type: TokenType
  x: number
  y: number
  speed: number
}

interface CollectEffect {
  id: number
  x: number
  y: number
  points: number
}

function pickTokenType(): TokenType {
  const total = Object.values(TOKENS).reduce((sum, t) => sum + t.spawnWeight, 0)
  let roll = Math.random() * total
  for (const token of Object.values(TOKENS)) {
    if (roll < token.spawnWeight) return token.type
    roll -= token.spawnWeight
  }
  return "bonk"
}

export function GoblinGame({ onJoinClick }: { onJoinClick?: () => void }) {
  const { member } = useMember()
  const [score, setScore] = useState(0)
  const [counts, setCounts] = useState({ bonk: 0, wif: 0, pepe: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [tokens, setTokens] = useState<FallingToken[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [collectEffects, setCollectEffects] = useState<CollectEffect[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const startGame = () => {
    setScore(0)
    setCounts({ bonk: 0, wif: 0, pepe: 0 })
    setTimeLeft(30)
    setIsPlaying(true)
    setGameOver(false)
    setTokens([])
    setCollectEffects([])
    setSaved(false)
  }

  const handleGameAreaInteraction = useCallback(
    (clientX: number, clientY: number) => {
      if (!gameAreaRef.current || !isPlaying) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      const touchX = ((clientX - rect.left) / rect.width) * 100
      const touchY = ((clientY - rect.top) / rect.height) * 100
      const hitRadius = 12

      setTokens((prev) => {
        let hit: FallingToken | null = null
        const updated = prev.filter((token) => {
          if (hit) return true
          const dx = token.x - touchX
          const dy = token.y - touchY
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < hitRadius) {
            hit = token
            return false
          }
          return true
        })

        if (hit) {
          const config = TOKENS[hit.type]
          setScore((s) => s + config.points)
          setCounts((c) => ({ ...c, [hit!.type]: c[hit!.type] + 1 }))
          const effectId = Date.now() + Math.random()
          setCollectEffects((e) => [...e, { id: effectId, x: hit!.x, y: hit!.y, points: config.points }])
          setTimeout(() => {
            setCollectEffects((e) => e.filter((ef) => ef.id !== effectId))
          }, 500)
        }

        return updated
      })
    },
    [isPlaying],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleGameAreaInteraction(touch.clientX, touch.clientY)
    },
    [handleGameAreaInteraction],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      handleGameAreaInteraction(e.clientX, e.clientY)
    },
    [handleGameAreaInteraction],
  )

  const shareOnTwitter = () => {
    const tweetText = encodeURIComponent(
      `🎮 I just stayed hard for $GOBLINS! 💀\n\nScore: ${score} points\n\n@DavidGoblins #StayHard #Solana`,
    )
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank")
  }

  const handleSaveScore = async () => {
    if (!member) {
      onJoinClick?.()
      return
    }
    setSaving(true)
    const result = await submitScore(score, counts.bonk, counts.wif, counts.pepe)
    setSaving(false)
    if (!result.error) {
      setSaved(true)
    }
  }

  // Game timer
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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

  // Spawn tokens
  useEffect(() => {
    if (!isPlaying) return
    const spawnInterval = setInterval(() => {
      const type = pickTokenType()
      const newToken: FallingToken = {
        id: Date.now() + Math.random(),
        type,
        x: Math.random() * 80 + 10,
        y: -10,
        speed: Math.random() * 2 + 2,
      }
      setTokens((prev) => [...prev, newToken])
    }, 600)
    return () => clearInterval(spawnInterval)
  }, [isPlaying])

  // Animate falling tokens
  useEffect(() => {
    if (!isPlaying) return
    let lastTime = performance.now()
    let animationId: number
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67
      lastTime = currentTime
      setTokens((prev) =>
        prev.map((t) => ({ ...t, y: t.y + t.speed * deltaTime })).filter((t) => t.y < 110),
      )
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isPlaying])

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-primary text-center mb-2">SNATCH THE SOULS</h2>
        <p className="text-center text-muted-foreground mb-6">
          Tap the tokens! BONK = 10 · WIF = 20 · PEPE = 50
        </p>

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
                <span className="text-primary font-bold">{score} pts</span>
              </div>
              <div className="bg-background/80 px-4 py-2 rounded-full border border-primary/50">
                <span className="text-primary font-bold">{timeLeft}s</span>
              </div>
            </div>
          )}

          {/* Collect effects */}
          {collectEffects.map((effect) => (
            <div
              key={`text-${effect.id}`}
              className="absolute pointer-events-none z-30 text-primary font-black text-2xl"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                transform: "translate(-50%, -50%)",
                animation: "floatUp 0.5s ease-out forwards",
              }}
            >
              +{effect.points}
            </div>
          ))}

          {/* Falling tokens */}
          {tokens.map((token) => {
            const config = TOKENS[token.type]
            return (
              <div
                key={token.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${token.x}%`,
                  top: `${token.y}%`,
                  width: `${config.size}px`,
                  height: `${config.size}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="w-full h-full rounded-full overflow-hidden shadow-lg shadow-primary/40 ring-2 ring-primary/40"
                  style={{ animation: "tokenSpin 2.5s linear infinite" }}
                >
                  <Image
                    src={config.image || "/placeholder.svg"}
                    alt={config.label}
                    width={config.size}
                    height={config.size}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )
          })}

          {/* Start screen */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/80">
              <Image
                src="/images/goblin.png"
                alt="David Goblin"
                width={150}
                height={150}
                className="rounded-full border-4 border-primary animate-pulse object-cover"
              />
              <p className="text-muted-foreground text-center max-w-xs px-4">
                Tap falling tokens before they escape! Rarer coins are worth more. You have 30 seconds.
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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 px-4">
              <h3 className="text-4xl font-black text-primary">GAME OVER</h3>
              <div className="text-center">
                <p className="text-6xl font-black text-foreground mb-1">{score}</p>
                <p className="text-muted-foreground text-sm">POINTS</p>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>BONK x{counts.bonk}</span>
                <span>WIF x{counts.wif}</span>
                <span>PEPE x{counts.pepe}</span>
              </div>

              {saved ? (
                <p className="text-primary font-bold">Score saved to the leaderboard!</p>
              ) : member ? (
                <Button
                  onClick={handleSaveScore}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold active:scale-95 transition-transform"
                >
                  {saving ? "SAVING..." : "SAVE TO LEADERBOARD"}
                </Button>
              ) : (
                <Button
                  onClick={() => onJoinClick?.()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold active:scale-95 transition-transform"
                >
                  JOIN FREE TO SAVE SCORE
                </Button>
              )}

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
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 font-bold active:scale-95 transition-transform"
                >
                  SHARE ON X
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground mt-4 text-sm">Stay hard and snatch those souls</p>
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
        @keyframes tokenSpin {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </section>
  )
}
