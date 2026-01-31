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
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from("messages")
    .select("*, users(name, phone)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId)
  }
  if (filters?.intent && filters.intent !== "all") {
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

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export async function getUniqueIntents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("intents")
    .select("name")
    .order("name", { ascending: true })

  if (error) throw error
  return data.map(i => i.name)
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
