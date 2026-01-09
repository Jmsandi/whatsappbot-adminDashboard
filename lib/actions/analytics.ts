"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsersResult,
    activeUsersResult,
    totalMessagesResult,
    todayMessagesResult,
    failedMessagesResult,
    handledMessagesResult
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_handled", false),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_handled", true),
  ])

  const totalMessages = totalMessagesResult.count || 0
  const handledMessages = handledMessagesResult.count || 0
  const failedMessages = failedMessagesResult.count || 0

  // Calculate success rate
  const successRate = totalMessages > 0
    ? ((handledMessages / totalMessages) * 100).toFixed(1)
    : "0.0"

  return {
    totalUsers: totalUsersResult.count || 0,
    activeUsers: activeUsersResult.count || 0,
    totalMessages,
    todayMessages: todayMessagesResult.count || 0,
    failedQueries: failedMessages,
    successRate: `${successRate}%`,
  }
}

export async function getUserGrowth() {
  const supabase = await createClient()

  // Get users from last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data, error } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())

  if (error) throw error

  // Group by month
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const counts: Record<string, number> = {}

  data.forEach((user) => {
    const date = new Date(user.created_at)
    const month = monthNames[date.getMonth()]
    counts[month] = (counts[month] || 0) + 1
  })

  // Get last 6 months in order
  const result = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const month = monthNames[d.getMonth()]
    result.push({
      month,
      users: counts[month] || 0
    })
  }

  return result
}

export async function getIntentDistribution() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("intents")
    .select("name, qa_count")
    .order("qa_count", { ascending: false })

  if (error) throw error
  return data.map((intent) => ({
    intent: intent.name,
    count: intent.qa_count,
  }))
}

export async function getMessageTrend(days = 7) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from("messages")
    .select("created_at")
    .gte("created_at", startDate.toISOString())

  if (error) throw error

  // Group by day
  const grouped = data.reduce(
    (acc, msg) => {
      const date = new Date(msg.created_at).toLocaleDateString("en-US", { weekday: "short" })
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(grouped).map(([day, messages]) => ({
    day,
    messages,
  }))
}

export async function getRecentActivity(limit = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getPeakHours() {
  const supabase = await createClient()

  // Get messages from last 7 days
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const { data, error } = await supabase
    .from("messages")
    .select("created_at")
    .gte("created_at", startDate.toISOString())

  if (error) throw error

  // Group by hour
  const hourCounts: Record<number, number> = {}

  data.forEach((msg) => {
    const hour = new Date(msg.created_at).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  // Get top 5 peak hours
  const sortedHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({
      hour: Number.parseInt(hour),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Calculate max for percentage
  const maxCount = sortedHours[0]?.count || 1

  return sortedHours.map(({ hour, count }) => ({
    hour: formatHour(hour),
    activity: Math.round((count / maxCount) * 100),
    count,
  }))
}

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:00 ${ampm}`
}
