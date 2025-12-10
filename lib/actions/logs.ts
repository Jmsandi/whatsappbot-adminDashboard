"use server"

import { createClient } from "@/lib/supabase/server"
import type { SystemLog, LogActionType } from "@/lib/supabase/types"

export async function getLogs(filters?: {
  actionType?: LogActionType
  adminName?: string
  limit?: number
}) {
  const supabase = await createClient()
  let query = supabase.from("system_logs").select("*").order("created_at", { ascending: false })

  if (filters?.actionType) {
    query = query.eq("action_type", filters.actionType)
  }
  if (filters?.adminName) {
    query = query.eq("admin_name", filters.adminName)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data as SystemLog[]
}

export async function createLog(log: {
  action: string
  action_type: LogActionType
  admin_name: string
  details?: Record<string, unknown>
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("system_logs")
    .insert({
      action: log.action,
      action_type: log.action_type,
      admin_name: log.admin_name,
      details: log.details || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as SystemLog
}
