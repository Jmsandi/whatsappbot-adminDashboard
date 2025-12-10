"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Broadcast, BroadcastTarget, BroadcastStatus } from "@/lib/supabase/types"

export async function getBroadcasts(filters?: { status?: BroadcastStatus }) {
  const supabase = await createClient()
  let query = supabase.from("broadcasts").select("*").order("created_at", { ascending: false })

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Broadcast[]
}

export async function createBroadcast(broadcast: {
  title: string
  message: string
  target: BroadcastTarget
  target_count: number
  scheduled_at?: string
  created_by: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("broadcasts")
    .insert({
      title: broadcast.title,
      message: broadcast.message,
      target: broadcast.target,
      target_count: broadcast.target_count,
      status: broadcast.scheduled_at ? "scheduled" : "draft",
      scheduled_at: broadcast.scheduled_at || null,
      created_by: broadcast.created_by,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/broadcast")
  return data as Broadcast
}

export async function updateBroadcast(id: string, updates: Partial<Broadcast>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("broadcasts").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/dashboard/broadcast")
  return data as Broadcast
}

export async function deleteBroadcast(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("broadcasts").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/broadcast")
}

export async function sendBroadcast(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("broadcasts")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/broadcast")
  return data as Broadcast
}
