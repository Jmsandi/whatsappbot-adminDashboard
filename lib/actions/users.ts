"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { User, UserStatus } from "@/lib/supabase/types"

export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data as User[]
}

export async function getUserById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) throw error
  return data as User
}

export async function createUser(user: {
  phone: string
  name?: string
  status?: UserStatus
  tags?: string[]
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .insert({
      phone: user.phone,
      name: user.name || null,
      status: user.status || "active",
      tags: user.tags || [],
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/users")
  return data as User
}

export async function updateUser(id: string, updates: Partial<User>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/users")
  return data as User
}

export async function updateUserStatus(id: string, status: UserStatus) {
  return updateUser(id, { status })
}

export async function updateUserTags(id: string, tags: string[]) {
  return updateUser(id, { tags })
}

export async function deleteUser(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("users").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/users")
}

export async function getUserStats() {
  const supabase = await createClient()

  const [totalResult, activeResult, vipResult, bannedResult] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("users").select("*", { count: "exact", head: true }).contains("tags", ["VIP"]),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "banned"),
  ])

  return {
    total: totalResult.count || 0,
    active: activeResult.count || 0,
    vip: vipResult.count || 0,
    banned: bannedResult.count || 0,
  }
}
