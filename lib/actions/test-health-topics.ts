"use server"

import { createClient } from "@/lib/supabase/server"

export async function testHealthTopicsConnection() {
    try {
        const supabase = await createClient()

        // Test 1: Check if table exists
        const { data: tableCheck, error: tableError } = await supabase
            .from("health_topics")
            .select("count")
            .limit(1)

        console.log("Table check:", { tableCheck, tableError })

        // Test 2: Try to get all data
        const { data: allData, error: allError } = await supabase
            .from("health_topics")
            .select("*")

        console.log("All data:", { count: allData?.length, allError, sample: allData?.[0] })

        // Test 3: Check RLS policies
        const { data: user } = await supabase.auth.getUser()
        console.log("Current user:", user)

        return {
            tableExists: !tableError,
            dataCount: allData?.length || 0,
            error: tableError || allError,
            sampleData: allData?.[0],
            user: user.user?.email
        }
    } catch (error) {
        console.error("Test error:", error)
        return {
            tableExists: false,
            dataCount: 0,
            error: String(error)
        }
    }
}
