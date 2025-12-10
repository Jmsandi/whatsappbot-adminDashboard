"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Admin, AdminRole } from "@/lib/supabase/types"

export async function getAdmins() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data as Admin[]
}

export async function createAdmin(admin: {
  name: string
  email: string
  role: AdminRole
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admins")
    .insert({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: "active",
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/admins")
  return data as Admin
}

export async function updateAdmin(id: string, updates: Partial<Admin>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admins")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/dashboard/admins")
  return data as Admin
}

export async function deleteAdmin(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("admins").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/admins")
}
