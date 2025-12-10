"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface BotSettings {
    id: string
    // Prompts
    system_prompt: string | null
    welcome_message: string | null
    fallback_response: string | null
    escalation_message: string | null
    away_message: string | null
    // AI Model
    ai_model: string
    temperature: number
    max_tokens: number
    top_p: number
    frequency_penalty: number
    presence_penalty: number
    confidence_threshold: number
    auto_escalate_threshold: number
    enable_memory: boolean
    memory_window: number
    stream_responses: boolean
    // Behavior
    response_tone: string
    response_language: string
    response_length: string
    emoji_usage: string
    bot_name: string
    bot_status_text: string
    block_harmful_content: boolean
    block_pii_sharing: boolean
    block_financial_advice: boolean
    block_medical_advice: boolean
    block_legal_advice: boolean
    rate_limit_messages_per_minute: number
    rate_limit_messages_per_day: number
    rate_limit_cooldown_seconds: number
    // Features
    feature_auto_reply: boolean
    feature_human_handoff: boolean
    feature_multi_language: boolean
    feature_analytics: boolean
    feature_notifications: boolean
    feature_rate_limit: boolean
    feature_ai_confidence_check: boolean
    feature_sentiment_analysis: boolean
    feature_intent_detection: boolean
    feature_context_awareness: boolean
    // Metadata
    created_at: string
    updated_at: string
    last_modified_by: string | null
}

export interface UpdateBotSettingsInput {
    // Prompts
    system_prompt?: string
    welcome_message?: string
    fallback_response?: string
    escalation_message?: string
    away_message?: string
    // AI Model
    ai_model?: string
    temperature?: number
    max_tokens?: number
    top_p?: number
    frequency_penalty?: number
    presence_penalty?: number
    confidence_threshold?: number
    auto_escalate_threshold?: number
    enable_memory?: boolean
    memory_window?: number
    stream_responses?: boolean
    // Behavior
    response_tone?: string
    response_language?: string
    response_length?: string
    emoji_usage?: string
    bot_name?: string
    bot_status_text?: string
    block_harmful_content?: boolean
    block_pii_sharing?: boolean
    block_financial_advice?: boolean
    block_medical_advice?: boolean
    block_legal_advice?: boolean
    rate_limit_messages_per_minute?: number
    rate_limit_messages_per_day?: number
    rate_limit_cooldown_seconds?: number
    // Features
    feature_auto_reply?: boolean
    feature_human_handoff?: boolean
    feature_multi_language?: boolean
    feature_analytics?: boolean
    feature_notifications?: boolean
    feature_rate_limit?: boolean
    feature_ai_confidence_check?: boolean
    feature_sentiment_analysis?: boolean
    feature_intent_detection?: boolean
    feature_context_awareness?: boolean
    // Metadata
    last_modified_by?: string
}

/**
 * Get current bot settings
 */
export async function getBotSettings(): Promise<BotSettings | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from("bot_settings")
            .select("*")
            .single()

        if (error) {
            console.error("Error fetching bot settings:", error)
            throw error
        }

        return data
    } catch (error) {
        console.error("Failed to get bot settings:", error)
        return null
    }
}

/**
 * Update bot settings
 */
export async function updateBotSettings(
    updates: UpdateBotSettingsInput
): Promise<BotSettings | null> {
    try {
        const supabase = await createClient()

        // Get current settings to find the ID
        const { data: currentSettings } = await supabase
            .from("bot_settings")
            .select("id")
            .single()

        if (!currentSettings) {
            throw new Error("Bot settings not found")
        }

        // Update settings
        const { data, error } = await supabase
            .from("bot_settings")
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq("id", currentSettings.id)
            .select()
            .single()

        if (error) {
            console.error("Error updating bot settings:", error)
            throw error
        }

        revalidatePath("/dashboard/settings")
        return data
    } catch (error) {
        console.error("Failed to update bot settings:", error)
        return null
    }
}

/**
 * Reset bot settings to defaults
 */
export async function resetBotSettings(): Promise<BotSettings | null> {
    try {
        const supabase = await createClient()

        const { data: currentSettings } = await supabase
            .from("bot_settings")
            .select("id")
            .single()

        if (!currentSettings) {
            throw new Error("Bot settings not found")
        }

        const { data, error } = await supabase
            .from("bot_settings")
            .update({
                system_prompt: "You are a public health assistant for Sierra Leone. You ONLY answer questions related to public health topics in Sierra Leone, including but not limited to: diseases (malaria, cholera, Ebola, etc.), vaccinations, healthcare facilities, maternal and child health, nutrition, sanitation, hygiene, disease prevention, and health services. If a user asks about topics unrelated to public health in Sierra Leone, politely explain that you can only assist with public health questions about Sierra Leone and encourage them to ask a relevant question.",
                welcome_message: "Hello! I'm your AI health assistant for Sierra Leone. How can I help you today?",
                fallback_response: "I'm not quite sure I understand. Let me connect you with a health worker who can better assist you.",
                escalation_message: "I understand this needs special attention. I'm connecting you with a human agent who can better assist you. Please hold on for a moment.",
                away_message: "Thank you for your message! Our team is currently offline. The AI assistant is still here to help with common questions, or a human agent will respond during business hours.",
                ai_model: "geneline",
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.9,
                frequency_penalty: 0,
                presence_penalty: 0,
                confidence_threshold: 0.75,
                auto_escalate_threshold: 0.5,
                enable_memory: true,
                memory_window: 10,
                stream_responses: true,
                response_tone: "friendly",
                response_language: "en",
                response_length: "medium",
                emoji_usage: "moderate",
                bot_name: "AI Assistant",
                bot_status_text: "Powered by AI • Always Online",
                block_harmful_content: true,
                block_pii_sharing: true,
                block_financial_advice: true,
                block_medical_advice: true,
                block_legal_advice: true,
                rate_limit_messages_per_minute: 20,
                rate_limit_messages_per_day: 500,
                rate_limit_cooldown_seconds: 60,
                feature_auto_reply: true,
                feature_human_handoff: true,
                feature_multi_language: true,
                feature_analytics: true,
                feature_notifications: true,
                feature_rate_limit: true,
                feature_ai_confidence_check: true,
                feature_sentiment_analysis: true,
                feature_intent_detection: true,
                feature_context_awareness: true,
                updated_at: new Date().toISOString()
            })
            .eq("id", currentSettings.id)
            .select()
            .single()

        if (error) {
            console.error("Error resetting bot settings:", error)
            throw error
        }

        revalidatePath("/dashboard/settings")
        return data
    } catch (error) {
        console.error("Failed to reset bot settings:", error)
        return null
    }
}
