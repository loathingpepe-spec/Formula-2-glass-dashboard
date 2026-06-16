"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Member {
  id: string
  name: string
  email: string
  member_number: number
}

interface MemberContextValue {
  member: Member | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const MemberContext = createContext<MemberContextValue>({
  member: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
})

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMember(null)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("members")
      .select("id, name, email, member_number")
      .eq("id", user.id)
      .single()

    setMember(data as Member | null)
    setLoading(false)
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setMember(null)
  }, [supabase])

  useEffect(() => {
    refresh()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh()
    })

    return () => subscription.unsubscribe()
  }, [refresh, supabase])

  return (
    <MemberContext.Provider value={{ member, loading, refresh, signOut }}>
      {children}
    </MemberContext.Provider>
  )
}

export function useMember() {
  return useContext(MemberContext)
}
