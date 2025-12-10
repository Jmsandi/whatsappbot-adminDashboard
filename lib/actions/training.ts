"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TrainingData, Intent, Correction, TrainingStatus } from "@/lib/supabase/types"

// Training Data CRUD
export async function getTrainingData(filters?: { intent?: string; status?: TrainingStatus }) {
  const supabase = await createClient()
  let query = supabase.from("training_data").select("*").order("created_at", { ascending: false })

  if (filters?.intent) {
    query = query.eq("intent", filters.intent)
  }
  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as TrainingData[]
}

export async function createTrainingData(training: {
  intent: string
  question: string
  answer: string
  added_by: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("training_data")
    .insert({
      intent: training.intent,
      question: training.question,
      answer: training.answer,
      added_by: training.added_by,
      status: "active",
    })
    .select()
    .single()

  if (error) throw error

  // Update intent qa_count
  await supabase.rpc("increment_intent_count", { intent_name: training.intent })

  revalidatePath("/dashboard/training")
  return data as TrainingData
}

export async function updateTrainingData(id: string, updates: Partial<TrainingData>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("training_data")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/training")
  return data as TrainingData
}

export async function deleteTrainingData(id: string) {
  const supabase = await createClient()

  // Get the training data to know its intent
  const { data: training } = await supabase.from("training_data").select("intent").eq("id", id).single()

  const { error } = await supabase.from("training_data").delete().eq("id", id)

  if (error) throw error

  // Decrement intent qa_count
  if (training?.intent) {
    await supabase.rpc("decrement_intent_count", { intent_name: training.intent })
  }

  revalidatePath("/dashboard/training")
}

// Intents CRUD
export async function getIntents() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("intents").select("*").order("name")

  if (error) throw error
  return data as Intent[]
}

export async function createIntent(intent: { name: string; description?: string; color?: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("intents")
    .insert({
      name: intent.name,
      description: intent.description || null,
      color: intent.color || "bg-chart-1",
      qa_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/training")
  return data as Intent
}

export async function deleteIntent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("intents").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/training")
}

// Corrections CRUD
export async function getCorrections() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("corrections")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Correction[]
}

export async function applyCorrection(id: string, correctAnswer: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("corrections")
    .update({ correct_answer: correctAnswer, status: "applied" })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/training")
  return data as Correction
}

export async function dismissCorrection(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("corrections")
    .update({ status: "dismissed" })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/training")
  return data as Correction
}
