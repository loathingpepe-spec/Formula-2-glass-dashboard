"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMember } from "@/components/member-provider"
import { Trophy, Medal, RefreshCw } from "lucide-react"

interface LeaderboardEntry {
  member_id: string
  score: number
  name: string
  member_number: number
}

export function Leaderboard() {
  const { member } = useMember()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchLeaderboard = useCallback(async () => {
    // Get top scores joined with member info
    const { data } = await supabase
      .from("high_scores")
      .select("member_id, score, members(name, member_number)")
      .order("score", { ascending: false })
      .limit(50)

    if (data) {
      // Keep only each member's best score
      const bestByMember = new Map<string, LeaderboardEntry>()
      for (const row of data as any[]) {
        const existing = bestByMember.get(row.member_id)
        if (!existing || row.score > existing.score) {
          bestByMember.set(row.member_id, {
            member_id: row.member_id,
            score: row.score,
            name: row.members?.name ?? "Goblin",
            member_number: row.members?.member_number ?? 0,
          })
        }
      }
      const sorted = Array.from(bestByMember.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      setEntries(sorted)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchLeaderboard()

    // Subscribe to live updates on high_scores
    const channel = supabase
      .channel("high_scores_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "high_scores" },
        () => fetchLeaderboard(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeaderboard, supabase])

  const rankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-primary" />
    if (index === 1) return <Medal className="w-5 h-5 text-zinc-300" />
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />
    return <span className="w-5 text-center text-muted-foreground font-bold">{index + 1}</span>
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Trophy className="w-7 h-7 text-primary" />
          <h2 className="text-3xl md:text-4xl font-black text-primary text-center">
            HIGH SCORE LEADERBOARD
          </h2>
        </div>

        <div className="bg-card/50 border-2 border-primary/30 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-primary/20 text-xs uppercase tracking-wider text-muted-foreground">
            <span>Rank / Goblin</span>
            <span>Score</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading the den...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No scores yet. Be the first to snatch some souls!
            </div>
          ) : (
            <ul>
              {entries.map((entry, index) => {
                const isMe = member?.id === entry.member_id
                return (
                  <li
                    key={entry.member_id}
                    className={`flex items-center justify-between px-6 py-4 border-b border-primary/10 last:border-0 ${
                      isMe ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {rankIcon(index)}
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-foreground">
                          {entry.name}
                          {isMe && <span className="text-primary text-xs ml-2">(YOU)</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Member #{entry.member_number}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-primary text-lg">{entry.score}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <p className="text-center text-muted-foreground mt-4 text-sm">
          Live leaderboard updates the moment a goblin scores
        </p>
      </div>
    </section>
  )
}
