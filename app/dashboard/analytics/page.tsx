"use client"

import { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardContent, NeoCardDescription } from "@/components/ui/neo-card"
import { NeoButton } from "@/components/ui/neo-button"
import { NeoBadge } from "@/components/ui/neo-badge"
import {
  NeoSelect,
  NeoSelectContent,
  NeoSelectItem,
  NeoSelectTrigger,
  NeoSelectValue,
} from "@/components/ui/neo-select"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartContainer } from "@/components/ui/chart-container"
import { Users, MessageSquare, TrendingUp, AlertCircle, Download, Calendar, Clock, Zap } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const dailyMessages = [
  { date: "Jan 1", messages: 2400, failed: 45 },
  { date: "Jan 2", messages: 1398, failed: 32 },
  { date: "Jan 3", messages: 9800, failed: 120 },
  { date: "Jan 4", messages: 3908, failed: 65 },
  { date: "Jan 5", messages: 4800, failed: 78 },
  { date: "Jan 6", messages: 3800, failed: 52 },
  { date: "Jan 7", messages: 4300, failed: 61 },
  { date: "Jan 8", messages: 5200, failed: 89 },
  { date: "Jan 9", messages: 6100, failed: 95 },
  { date: "Jan 10", messages: 7200, failed: 110 },
  { date: "Jan 11", messages: 6800, failed: 102 },
  { date: "Jan 12", messages: 5900, failed: 88 },
  { date: "Jan 13", messages: 7500, failed: 115 },
  { date: "Jan 14", messages: 8200, failed: 125 },
]

const userGrowth = [
  { month: "Jul", users: 4000 },
  { month: "Aug", users: 5200 },
  { month: "Sep", users: 6800 },
  { month: "Oct", users: 8100 },
  { month: "Nov", users: 9800 },
  { month: "Dec", users: 12847 },
]

const intentDistribution = [
  { name: "Greeting", value: 25, color: "var(--foreground)" },
  { name: "FAQ", value: 22, color: "var(--chart-2)" },
  { name: "Support", value: 20, color: "var(--chart-3)" },
  { name: "Order", value: 18, color: "var(--chart-4)" },
  { name: "Other", value: 15, color: "var(--chart-5)" },
]

const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  activity: Math.floor(Math.random() * 100) + 20,
}))

const responseMetrics = [
  { metric: "Avg Response Time", value: "1.2s", change: -15, icon: Clock },
  { metric: "Success Rate", value: "98.7%", change: 2.3, icon: TrendingUp },
  { metric: "Auto-Resolved", value: "87%", change: 5.1, icon: Zap },
  { metric: "Escalated", value: "156", change: -8, icon: AlertCircle },
]

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights into your bot performance</p>
        </div>
        <div className="flex items-center gap-4">
          <NeoSelect defaultValue="7d">
            <NeoSelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <NeoSelectValue />
            </NeoSelectTrigger>
            <NeoSelectContent>
              <NeoSelectItem value="24h">Last 24 hours</NeoSelectItem>
              <NeoSelectItem value="7d">Last 7 days</NeoSelectItem>
              <NeoSelectItem value="30d">Last 30 days</NeoSelectItem>
              <NeoSelectItem value="90d">Last 90 days</NeoSelectItem>
            </NeoSelectContent>
          </NeoSelect>
          <NeoButton variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </NeoButton>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value="12,847" icon={Users} trend={{ value: 12, isPositive: true }} />
        <StatsCard
          title="Active Users"
          value="2,847"
          icon={Users}
          description="Last 24 hours"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard title="Total Messages" value="1.2M" icon={MessageSquare} trend={{ value: 15, isPositive: true }} />
        <StatsCard title="Failed Queries" value="2,341" icon={AlertCircle} trend={{ value: 5, isPositive: false }} />
      </div>

      {/* Response Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {responseMetrics.map((item) => (
          <NeoCard key={item.metric} hover>
            <NeoCardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-foreground bg-secondary flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{item.metric}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{item.value}</span>
                    <NeoBadge variant={item.change > 0 ? "success" : "destructive"} className="text-[10px]">
                      {item.change > 0 ? "+" : ""}
                      {item.change}%
                    </NeoBadge>
                  </div>
                </div>
              </div>
            </NeoCardContent>
          </NeoCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Messages */}
        <NeoCard className="lg:col-span-2">
          <NeoCardHeader>
            <NeoCardTitle>Daily Messages</NeoCardTitle>
            <NeoCardDescription>Message volume over the last 14 days</NeoCardDescription>
          </NeoCardHeader>
          <NeoCardContent>
            <ChartContainer height={350}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyMessages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} fontWeight={600} />
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
                    stroke="var(--foreground)"
                    strokeWidth={3}
                    fill="var(--muted)"
                    name="Total Messages"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stroke="var(--destructive)"
                    strokeWidth={2}
                    fill="var(--destructive)"
                    fillOpacity={0.2}
                    name="Failed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </NeoCardContent>
        </NeoCard>

        {/* User Growth */}
        <NeoCard>
          <NeoCardHeader>
            <NeoCardTitle>User Growth</NeoCardTitle>
            <NeoCardDescription>Monthly user acquisition</NeoCardDescription>
          </NeoCardHeader>
          <NeoCardContent>
            <ChartContainer height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} fontWeight={600} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} fontWeight={600} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "4px solid var(--foreground)",
                      borderRadius: "1rem",
                      fontWeight: 600,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--foreground)"
                    strokeWidth={3}
                    dot={{ fill: "var(--foreground)", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </NeoCardContent>
        </NeoCard>

        {/* Intent Distribution */}
        <NeoCard>
          <NeoCardHeader>
            <NeoCardTitle>Intent Distribution</NeoCardTitle>
            <NeoCardDescription>Most common user intents</NeoCardDescription>
          </NeoCardHeader>
          <NeoCardContent>
            <ChartContainer height={300} className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="var(--background)"
                  >
                    {intentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "4px solid var(--foreground)",
                      borderRadius: "1rem",
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {intentDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-foreground"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </NeoCardContent>
        </NeoCard>
      </div>

      {/* Hourly Activity */}
      <NeoCard>
        <NeoCardHeader>
          <NeoCardTitle>Hourly Activity</NeoCardTitle>
          <NeoCardDescription>Message distribution throughout the day</NeoCardDescription>
        </NeoCardHeader>
        <NeoCardContent>
          <ChartContainer height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} fontWeight={600} interval={2} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} fontWeight={600} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "4px solid var(--foreground)",
                    borderRadius: "1rem",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="activity" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </NeoCardContent>
      </NeoCard>
    </div>
  )
}
