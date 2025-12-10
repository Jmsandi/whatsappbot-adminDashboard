"use client"

import * as React from "react"
import { NeoCard, NeoCardContent } from "@/components/ui/neo-card"
import { NeoButton } from "@/components/ui/neo-button"
import { NeoBadge } from "@/components/ui/neo-badge"
import { NeoInput } from "@/components/ui/neo-input"
import {
  NeoSelect,
  NeoSelectContent,
  NeoSelectItem,
  NeoSelectTrigger,
  NeoSelectValue,
} from "@/components/ui/neo-select"
import {
  Search,
  Download,
  Filter,
  FileText,
  UserPlus,
  Settings,
  Radio,
  Shield,
  Clock,
  Eye,
  Loader2,
  AlertTriangle,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getLogs } from "@/lib/actions/logs"
import type { SystemLog } from "@/lib/supabase/types"
import useSWR from "swr"

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: "default" | "secondary" | "destructive" | "success" | "warning" }
> = {
  create: { icon: UserPlus, color: "success" },
  update: { icon: Settings, color: "warning" },
  delete: { icon: Trash2, color: "destructive" },
  login: { icon: Shield, color: "default" },
  export: { icon: Download, color: "secondary" },
  broadcast: { icon: Radio, color: "secondary" },
  settings: { icon: Settings, color: "warning" },
}

export default function LogsPage() {
  const [selectedLog, setSelectedLog] = React.useState<SystemLog | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [dateFilter, setDateFilter] = React.useState("")

  const { data: logs = [], error, isLoading } = useSWR("logs", () => getLogs({ limit: 100 }))

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log: SystemLog) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.admin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesType = typeFilter === "all" || log.action_type === typeFilter
      return matchesSearch && matchesType
    })
  }, [logs, searchQuery, typeFilter])

  const stats = React.useMemo(
    () => [
      { label: "Total Logs", count: logs.length, icon: FileText, color: "default" as const },
      {
        label: "Create",
        count: logs.filter((l: SystemLog) => l.action_type === "create").length,
        ...typeConfig.create,
      },
      {
        label: "Update",
        count: logs.filter((l: SystemLog) => l.action_type === "update").length,
        ...typeConfig.update,
      },
      {
        label: "Delete",
        count: logs.filter((l: SystemLog) => l.action_type === "delete").length,
        ...typeConfig.delete,
      },
      {
        label: "Broadcasts",
        count: logs.filter((l: SystemLog) => l.action_type === "broadcast").length,
        ...typeConfig.broadcast,
      },
    ],
    [logs],
  )

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <NeoCard>
          <NeoCardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Failed to load logs</h2>
            <p className="text-muted-foreground">Please run the database migration scripts first.</p>
          </NeoCardContent>
        </NeoCard>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">System Logs</h1>
          <p className="text-muted-foreground mt-1">Track all admin activities and system changes</p>
        </div>
        <NeoButton variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </NeoButton>
      </div>

      {/* Stats - Using real data */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <NeoCard key={stat.label} hover>
            <NeoCardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-foreground bg-secondary flex items-center justify-center">
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.count}</p>
                <p className="text-xs text-muted-foreground font-bold">{stat.label}</p>
              </div>
            </NeoCardContent>
          </NeoCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <NeoInput
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
        <NeoSelect value={typeFilter} onValueChange={setTypeFilter}>
          <NeoSelectTrigger className="w-full lg:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <NeoSelectValue placeholder="Filter by type" />
          </NeoSelectTrigger>
          <NeoSelectContent>
            <NeoSelectItem value="all">All Types</NeoSelectItem>
            <NeoSelectItem value="create">Create</NeoSelectItem>
            <NeoSelectItem value="update">Update</NeoSelectItem>
            <NeoSelectItem value="delete">Delete</NeoSelectItem>
            <NeoSelectItem value="login">Login</NeoSelectItem>
            <NeoSelectItem value="broadcast">Broadcast</NeoSelectItem>
            <NeoSelectItem value="settings">Settings</NeoSelectItem>
            <NeoSelectItem value="export">Export</NeoSelectItem>
          </NeoSelectContent>
        </NeoSelect>
        <NeoInput
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full lg:w-48"
        />
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <NeoCard>
          <NeoCardContent className="p-0">
            <div className="divide-y-2 divide-muted">
              {filteredLogs.map((log: SystemLog) => {
                const config = typeConfig[log.action_type] || { icon: FileText, color: "secondary" as const }
                const Icon = config.icon
                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-foreground bg-secondary flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{log.action}</span>
                          <NeoBadge variant={config.color} className="text-xs">
                            {log.action_type}
                          </NeoBadge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {log.admin_name || "System"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <NeoButton variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </NeoButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </NeoCardContent>
        </NeoCard>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="border-4 border-foreground rounded-[1rem] neo-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Log Details</DialogTitle>
            <DialogDescription>{selectedLog && new Date(selectedLog.created_at).toLocaleString()}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-[1rem] border-2 border-foreground bg-secondary">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Action</p>
                  <p className="font-bold">{selectedLog.action}</p>
                </div>
                <div className="p-4 rounded-[1rem] border-2 border-foreground bg-secondary">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Type</p>
                  <NeoBadge variant={typeConfig[selectedLog.action_type]?.color || "secondary"}>
                    {selectedLog.action_type}
                  </NeoBadge>
                </div>
              </div>
              {selectedLog.details && (
                <div className="p-4 rounded-[1rem] border-2 border-foreground bg-secondary">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Details</p>
                  <pre className="text-sm font-mono overflow-auto">{JSON.stringify(selectedLog.details, null, 2)}</pre>
                </div>
              )}
              <div className="p-4 rounded-[1rem] border-2 border-foreground bg-secondary">
                <p className="text-xs font-bold text-muted-foreground mb-1">Admin</p>
                <p className="font-bold">{selectedLog.admin_name || "System"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <NeoButton variant="outline" onClick={() => setSelectedLog(null)}>
              Close
            </NeoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
