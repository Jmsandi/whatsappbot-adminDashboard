"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { SpecialContact, ContactRole } from "@/lib/supabase/types"

export async function getContacts() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("special_contacts").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data as SpecialContact[]
}

export async function createContact(contact: {
  name: string
  phone: string
  email?: string
  role: ContactRole
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("special_contacts")
    .insert({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || null,
      role: contact.role,
      status: "active",
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/contacts")
  return data as SpecialContact
}

export async function updateContact(id: string, updates: Partial<SpecialContact>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("special_contacts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/contacts")
  return data as SpecialContact
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("special_contacts").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/contacts")
}
