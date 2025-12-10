"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getHealthTopics(filters?: {
    isActive?: boolean
    category?: string
}) {
    console.log('[Server] getHealthTopics called with filters:', filters)
    const supabase = await createClient()

    let query = supabase
        .from("health_topics")
        .select("*")
        .order("priority", { ascending: false })

    if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive)
    }

    if (filters?.category) {
        query = query.eq("category", filters.category)
    }

    const { data, error } = await query

    console.log('[Server] Health topics query result:', { data, error, count: data?.length })

    if (error) {
        console.error('[Server] Error fetching health topics:', error)
        throw error
    }
    return data
}

export async function getHealthTopicById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("health_topics")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw error
    return data
}

export async function createHealthTopic(topic: {
    title: string
    category: string
    short_message: string
    detailed_info: string
    prevention_tips: string[]
    icon_emoji: string
    priority: number
}) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("health_topics")
        .insert(topic)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/broadcast")
    return data
}

export async function updateHealthTopic(id: string, updates: any) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("health_topics")
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/broadcast")
    return data
}

export async function deleteHealthTopic(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("health_topics")
        .delete()
        .eq("id", id)

    if (error) throw error
    revalidatePath("/dashboard/broadcast")
}

export async function toggleTopicStatus(id: string, isActive: boolean) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("health_topics")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/broadcast")
    return data
}

export async function getAutomatedBroadcasts(limit: number = 50) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("automated_broadcasts")
        .select(`
      *,
      health_topics (
        title,
        category,
        icon_emoji
      )
    `)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

export async function getBroadcastInteractions(broadcastId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("broadcast_interactions")
        .select(`
      *,
      users (
        name,
        phone
      )
    `)
        .eq("broadcast_id", broadcastId)
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function getHealthTopicStats() {
    const supabase = await createClient()

    const [totalResult, activeResult, broadcastsResult, interactionsResult] = await Promise.all([
        supabase.from("health_topics").select("*", { count: "exact", head: true }),
        supabase.from("health_topics").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("automated_broadcasts").select("*", { count: "exact", head: true }).eq("status", "sent"),
        supabase.from("broadcast_interactions").select("*", { count: "exact", head: true }),
    ])

    return {
        totalTopics: totalResult.count || 0,
        activeTopics: activeResult.count || 0,
        totalBroadcasts: broadcastsResult.count || 0,
        totalInteractions: interactionsResult.count || 0,
    }
}

export async function getInteractionsByType() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("broadcast_interactions")
        .select("interaction_type")

    if (error) throw error

    const counts = {
        learn_more: 0,
        prevention_tips: 0,
        ask_question: 0,
        share: 0
    }

    data?.forEach((interaction: any) => {
        if (interaction.interaction_type in counts) {
            counts[interaction.interaction_type as keyof typeof counts]++
        }
    })

    return counts
}

// =============================================
// AI CONTENT GENERATION ACTIONS
// =============================================

export async function generateHealthTopicWithAI(options?: {
    category?: string
    seasonalFocus?: string
}) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL}/api/admin/generate-topic`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options),
        })

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || "Failed to generate topic")
        }

        revalidatePath("/dashboard/health-topics")
        return data
    } catch (error) {
        console.error("Error generating topic:", error)
        throw error
    }
}

export async function getPendingTopics() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("health_topics")
        .select("*")
        .eq("status", "pending_review")
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function getDraftTopics() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("health_topics")
        .select("*")
        .eq("status", "draft")
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function approveTopic(id: string, reviewedBy: string = "admin") {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("approve_health_topic", {
        p_topic_id: id,
        p_reviewed_by: reviewedBy,
    })

    if (error) throw error
    revalidatePath("/dashboard/health-topics")
    return data
}

export async function rejectTopic(id: string, reason?: string, reviewedBy: string = "admin") {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("reject_health_topic", {
        p_topic_id: id,
        p_reviewed_by: reviewedBy,
        p_rejection_reason: reason,
    })

    if (error) throw error
    revalidatePath("/dashboard/health-topics")
    return data
}

export async function getSystemSettings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("system_settings")
        .select("*")

    if (error) throw error

    // Convert to key-value object
    const settings: Record<string, any> = {}
    data?.forEach((setting: any) => {
        settings[setting.setting_key] = setting.setting_value
    })

    return settings
}

export async function updateAutoPublishSettings(enabled: boolean, frequency: string = "weekly") {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("update_system_setting", {
        p_setting_key: "health_topics_auto_publish",
        p_setting_value: { enabled, frequency, last_generated: null },
        p_updated_by: "admin",
    })

    if (error) throw error
    revalidatePath("/dashboard/health-topics")
    return data
}

// =============================================
// BROADCAST SETTINGS ACTIONS
// =============================================

export async function getBroadcastSettings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("broadcast_settings")
        .select("*")
        .single()

    if (error) throw error
    return data
}

export async function updateBroadcastSettings(settings: {
    auto_send_enabled?: boolean
    interval_value?: number
    interval_unit?: string
}) {
    const supabase = await createClient()

    // Get current settings first
    const { data: currentSettings } = await supabase
        .from("broadcast_settings")
        .select("*")
        .single()

    if (!currentSettings) {
        throw new Error("Broadcast settings not found")
    }

    // Calculate next broadcast time if interval changed or auto-send enabled
    let next_broadcast_at = currentSettings.next_broadcast_at

    if (settings.auto_send_enabled || settings.interval_value || settings.interval_unit) {
        const intervalValue = settings.interval_value || currentSettings.interval_value
        const intervalUnit = settings.interval_unit || currentSettings.interval_unit
        next_broadcast_at = calculateNextBroadcastTime(intervalValue, intervalUnit)
    }

    // Update settings
    const { data, error } = await supabase
        .from("broadcast_settings")
        .update({
            ...settings,
            next_broadcast_at,
            updated_at: new Date().toISOString()
        })
        .eq("id", currentSettings.id)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/health-topics")
    return data
}

function calculateNextBroadcastTime(intervalValue: number, intervalUnit: string): string {
    const now = new Date()
    let nextTime = new Date(now)

    switch (intervalUnit) {
        case 'minutes':
            nextTime.setMinutes(now.getMinutes() + intervalValue)
            break
        case 'hours':
            nextTime.setHours(now.getHours() + intervalValue)
            break
        case 'days':
            nextTime.setDate(now.getDate() + intervalValue)
            break
        case 'weeks':
            nextTime.setDate(now.getDate() + (intervalValue * 7))
            break
        case 'months':
            nextTime.setMonth(now.getMonth() + intervalValue)
            break
        default:
            nextTime.setDate(now.getDate() + intervalValue)
    }

    return nextTime.toISOString()
}

export async function triggerManualBroadcast() {
    try {
        // Call the WhatsApp bot API to trigger immediate broadcast
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL}/admin/trigger-broadcast`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.BOT_API_KEY || ""
            },
        })

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || "Failed to trigger broadcast")
        }

        revalidatePath("/dashboard/health-topics")
        return data
    } catch (error) {
        console.error("Error triggering manual broadcast:", error)
        throw error
    }
}
