"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { BotSetting } from "@/lib/supabase/types"

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("bot_settings").select("*").order("key")

  if (error) throw error
  return data as BotSetting[]
}

export async function getSettingsMap() {
  const settings = await getSettings()
  return settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, string | null>,
  )
}

export async function updateSetting(key: string, value: string, updatedBy: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bot_settings")
    .upsert({
      key,
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/settings")
  return data as BotSetting
}

export async function updateMultipleSettings(settings: { key: string; value: string }[], updatedBy: string) {
  const supabase = await createClient()
  const updates = settings.map((s) => ({
    key: s.key,
    value: s.value,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from("bot_settings").upsert(updates)

  if (error) throw error
  revalidatePath("/dashboard/settings")
}
