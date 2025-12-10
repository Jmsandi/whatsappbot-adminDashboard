"use client"

import { StatsCard } from "@/components/dashboard/stats-card"
import { Marquee } from "@/components/dashboard/marquee"
import { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardContent } from "@/components/ui/neo-card"
import { NeoButton } from "@/components/ui/neo-button"
import { NeoBadge } from "@/components/ui/neo-badge"
import { Users, MessageSquare, TrendingUp, AlertCircle, Activity, Clock, ArrowRight, Loader2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { getDashboardStats, getIntentDistribution, getRecentActivity, getMessageTrend, getPeakHours } from "@/lib/actions/analytics"
import useSWR from "swr"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useSWR(
    "dashboardStats",
    getDashboardStats,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      fallbackData: { totalUsers: 0, activeUsers: 0, totalMessages: 0, todayMessages: 0, failedMessages: 0, successRate: "0%" }
    }
  )

  const { data: intentData = [], isLoading: intentLoading } = useSWR(
    "intentDistribution",
    getIntentDistribution,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  const { data: recentActivity = [], isLoading: activityLoading } = useSWR(
    "recentActivity",
    () => getRecentActivity(5),
    {
      refreshInterval: 15000, // Refresh every 15 seconds
      revalidateOnFocus: true,
    }
  )

  // Fetch message trend for chart
  const { data: messageTrendData = [], isLoading: trendLoading } = useSWR(
    "messageTrend",
    () => getMessageTrend(7),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  )

  // Fetch peak hours
  const { data: peakHoursData = [], isLoading: peakHoursLoading } = useSWR(
    "peakHours",
    getPeakHours,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  const marqueeItems = [
    { label: "Active Users", value: stats?.activeUsers?.toLocaleString() ?? "..." },
    { label: "Messages Today", value: stats?.todayMessages?.toLocaleString() ?? "..." },
    { label: "Bot Response Rate", value: "98.7%" },
    { label: "Avg Response Time", value: "1.2s" },
    { label: "Uptime", value: "99.99%" },
  ]

  // Sample message data for chart (would come from analytics in production)
  const messageData = [
    { name: "Mon", messages: 2400 },
    { name: "Tue", messages: 1398 },
    { name: "Wed", messages: 9800 },
    { name: "Thu", messages: 3908 },
    { name: "Fri", messages: 4800 },
    { name: "Sat", messages: 3800 },
    { name: "Sun", messages: 4300 },
  ]

  return (
    <div className="space-y-0">
      {/* Marquee */}
      <Marquee items={marqueeItems} />

      {/* Header */}
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Monitor your Kai health assistant performance and activity</p>
          </div>
          <NeoButton>
            <Activity className="h-4 w-4 mr-2" />
            View Live Activity
          </NeoButton>
        </div>

        {/* Stats Grid - Using real data */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={statsLoading ? "..." : (stats?.totalUsers?.toLocaleString() ?? "0")}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Daily Messages"
            value={statsLoading ? "..." : (stats?.todayMessages?.toLocaleString() ?? "0")}
            icon={MessageSquare}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Success Rate"
            value={statsLoading ? "..." : (stats?.successRate ?? "0%")}
            icon={TrendingUp}
            trend={{ value: 2, isPositive: true }}
          />
          <StatsCard
            title="Failed Queries"
            value={statsLoading ? "..." : (stats?.failedMessages?.toLocaleString() ?? "0")}
            icon={AlertCircle}
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages Chart - Using real data */}
          <NeoCard>
            <NeoCardHeader>
              <NeoCardTitle>Messages This Week</NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <div className="h-[300px]">
                {trendLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={messageTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} fontWeight={600} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} fontWeight={600} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "4px solid var(--foreground)",
                          borderRadius: "1rem",
                          fontWeight: 600,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="messages"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fill="var(--primary)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </NeoCardContent>
          </NeoCard>

          {/* Top Intents Chart - Using real data */}
          <NeoCard>
            <NeoCardHeader>
              <NeoCardTitle>Top Intents</NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <div className="h-[300px]">
                {intentLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={intentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} fontWeight={600} />
                      <YAxis
                        dataKey="intent"
                        type="category"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        fontWeight={600}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "4px solid var(--foreground)",
                          borderRadius: "1rem",
                          fontWeight: 600,
                        }}
                      />
                      <Bar dataKey="count" fill="var(--foreground)" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </NeoCardContent>
          </NeoCard>
        </div>

        {/* Recent Activity & Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Using real data */}
          <NeoCard className="lg:col-span-2">
            <NeoCardHeader className="flex flex-row items-center justify-between">
              <NeoCardTitle>Recent Activity</NeoCardTitle>
              <NeoButton variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </NeoButton>
            </NeoCardHeader>
            <NeoCardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map(
                    (activity: { id: string; action: string; admin_name: string | null; created_at: string }) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 rounded-[1rem] border-2 border-foreground bg-secondary"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full border-2 border-foreground bg-card flex items-center justify-center">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{activity.action}</p>
                            <p className="text-xs text-muted-foreground font-mono">{activity.admin_name || "System"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            {new Date(activity.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </NeoCardContent>
          </NeoCard>

          {/* Peak Hours - Using real data */}
          <NeoCard>
            <NeoCardHeader>
              <NeoCardTitle>Peak Active Hours</NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              {peakHoursLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : peakHoursData.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {peakHoursData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{item.hour}</span>
                        <NeoBadge variant="secondary">{item.activity}%</NeoBadge>
                      </div>
                      <div className="h-3 rounded-full border-2 border-foreground bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${item.activity}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </NeoCardContent>
          </NeoCard>
        </div>
      </div>
    </div>
  )
}
