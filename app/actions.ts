"use server"

import { createClient } from "@/lib/supabase/server"

export async function signUpMember(name: string, email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is disabled, a session exists immediately.
  return { success: true, hasSession: !!data.session }
}

export async function signInMember(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOutMember() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}

export async function getCurrentMember() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: member } = await supabase
    .from("members")
    .select("id, name, email, member_number")
    .eq("id", user.id)
    .single()

  return member
}

export async function submitScore(
  score: number,
  bonk: number,
  wif: number,
  pepe: number,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not signed in" }

  const { error } = await supabase.from("high_scores").insert({
    member_id: user.id,
    score,
    bonk_collected: bonk,
    wif_collected: wif,
    pepe_collected: pepe,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
