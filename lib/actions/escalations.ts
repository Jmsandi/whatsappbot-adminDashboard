"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getEscalations(filters?: {
    status?: string
    priority?: string
    limit?: number
}) {
    const supabase = await createClient()

    let query = supabase
        .from("escalations")
        .select(`
      *,
      users (
        id,
        name,
        phone
      ),
      messages (
        content,
        created_at
      )
    `)
        .order("created_at", { ascending: false })

    if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
    }

    if (filters?.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority)
    }

    if (filters?.limit) {
        query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data
}

export async function getEscalationById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("escalations")
        .select(`
      *,
      users (
        id,
        name,
        phone,
        status,
        tags
      )
    `)
        .eq("id", id)
        .single()

    if (error) throw error
    return data
}

export async function getEscalationMessages(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })

    if (error) throw error
    return data
}

export async function assignEscalation(id: string, adminName: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("escalations")
        .update({
            assigned_to: adminName,
            status: "assigned",
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/escalations")
    return data
}

export async function addEscalationNote(id: string, note: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("escalations")
        .update({
            admin_notes: note,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/escalations")
    return data
}

export async function resolveEscalation(id: string, resolution?: string) {
    const supabase = await createClient()

    const updateData: any = {
        status: "resolved",
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    if (resolution) {
        updateData.admin_response = resolution
    }

    const { data, error } = await supabase
        .from("escalations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/escalations")
    return data
}

export async function updateEscalationStatus(id: string, status: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("escalations")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/dashboard/escalations")
    return data
}

export async function getEscalationStats() {
    const supabase = await createClient()

    const [totalResult, pendingResult, urgentResult, todayResult] = await Promise.all([
        supabase.from("escalations").select("*", { count: "exact", head: true }),
        supabase.from("escalations").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("escalations").select("*", { count: "exact", head: true }).eq("priority", "urgent"),
        supabase
            .from("escalations")
            .select("*", { count: "exact", head: true })
            .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ])

    return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        urgent: urgentResult.count || 0,
        today: todayResult.count || 0,
    }
}

export async function sendEscalationResponse(id: string, phone: string, message: string) {
    const supabase = await createClient()

    try {
        // Send message via bot API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL}/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.BOT_API_KEY || ""
            },
            body: JSON.stringify({ phone, message })
        })

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || "Failed to send message")
        }

        // Update escalation with response
        const { data: escalation, error } = await supabase
            .from("escalations")
            .update({
                admin_response: message,
                status: "in_progress",
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single()

        if (error) throw error

        revalidatePath("/dashboard/escalations")
        return { success: true, escalation }

    } catch (error) {
        console.error("Error sending escalation response:", error)
        throw error
    }
}
