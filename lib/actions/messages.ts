"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Message } from "@/lib/supabase/types"

export async function getMessages(filters?: {
  userId?: string
  intent?: string
  search?: string
  startDate?: string
  endDate?: string
  limit?: number
}) {
  const supabase = await createClient()
  let query = supabase.from("messages").select("*, users(name, phone)").order("created_at", { ascending: false })

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId)
  }
  if (filters?.intent) {
    query = query.eq("intent", filters.intent)
  }
  if (filters?.search) {
    query = query.ilike("content", `%${filters.search}%`)
  }
  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMessagesByUser(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data as Message[]
}

export async function markMessageAsHandled(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("messages").update({ is_handled: true }).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/dashboard/messages")
  return data as Message
}

export async function deleteMessage(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("messages").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/messages")
}

export async function getMessageStats() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalResult, todayResult, unhandledResult] = await Promise.all([
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_handled", false),
  ])

  return {
    total: totalResult.count || 0,
    today: todayResult.count || 0,
    unhandled: unhandledResult.count || 0,
  }
}
