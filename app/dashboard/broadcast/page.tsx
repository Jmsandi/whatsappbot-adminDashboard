"use client"

import * as React from "react"
import useSWR, { mutate } from "swr"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Send,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Pause,
  Trash2,
  Eye,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getBroadcasts, createBroadcast, deleteBroadcast, sendBroadcast } from "@/lib/actions/broadcasts"
import { getUserStats } from "@/lib/actions/users"
import type { Broadcast } from "@/lib/supabase/types"

const statusConfig: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "success" | "warning"; icon: React.ElementType }
> = {
  sent: { variant: "success", icon: CheckCircle },
  scheduled: { variant: "warning", icon: Clock },
  draft: { variant: "secondary", icon: Pause },
  failed: { variant: "destructive", icon: XCircle },
}

export default function BroadcastPage() {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = React.useState<Broadcast | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "",
    message: "",
    target: "all" as "all" | "active" | "vip" | "tagged",
    scheduledAt: "",
  })

  // Fetch broadcasts with real-time updates
  const { data: broadcasts = [], error: broadcastsError, isLoading } = useSWR<Broadcast[]>(
    "broadcasts",
    () => getBroadcasts(),
    {
      refreshInterval: 15000, // Refresh every 15 seconds
      revalidateOnFocus: true,
    }
  )

  // Fetch user stats for target count
  const { data: userStats } = useSWR("userStats", getUserStats, {
    refreshInterval: 30000,
  })

  const getTargetCount = (target: string) => {
    if (!userStats) return 0
    switch (target) {
      case "all":
        return userStats.total
      case "active":
        return userStats.active
      case "vip":
        return userStats.vip
      default:
        return 0
    }
  }

  const handleCreateBroadcast = async () => {
    if (!formData.title || !formData.message) return

    setIsSubmitting(true)
    try {
      await createBroadcast({
        title: formData.title,
        message: formData.message,
        target: formData.target,
        target_count: getTargetCount(formData.target),
        scheduled_at: formData.scheduledAt || undefined,
        created_by: "Admin", // Replace with actual admin name
      })

      mutate("broadcasts")
      setShowCreateDialog(false)
      setFormData({ title: "", message: "", target: "all", scheduledAt: "" })
    } catch (error) {
      console.error("Failed to create broadcast:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendNow = async (id: string) => {
    if (!confirm("Send this broadcast now?")) return

    try {
      await sendBroadcast(id)
      mutate("broadcasts")
    } catch (error) {
      console.error("Failed to send broadcast:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this broadcast?")) return

    try {
      await deleteBroadcast(id)
      mutate("broadcasts")
    } catch (error) {
      console.error("Failed to delete broadcast:", error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const total = broadcasts.length
    const sent = broadcasts.filter(b => b.status === "sent").length
    const scheduled = broadcasts.filter(b => b.status === "scheduled").length
    const totalDelivered = broadcasts
      .filter(b => b.status === "sent")
      .reduce((sum, b) => sum + (b.delivered_count || 0), 0)

    return { total, sent, scheduled, totalDelivered }
  }, [broadcasts])

  if (broadcastsError) {
    return (
      <div className="p-6 lg:p-8">
        <NeoCard>
          <NeoCardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Failed to load broadcasts</h2>
            <p className="text-muted-foreground">{broadcastsError.message}</p>
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
          <h1 className="text-3xl lg:text-4xl font-bold">Broadcast Messages</h1>
          <p className="text-muted-foreground mt-1">Send bulk messages to your users</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <NeoButton>
              <Plus className="h-4 w-4 mr-2" />
              New Broadcast
            </NeoButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Broadcast</DialogTitle>
              <DialogDescription>Send a message to multiple users at once</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <NeoInput
                  id="title"
                  placeholder="Holiday Promotion"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your broadcast message..."
                  className="min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Audience</Label>
                  <NeoSelect
                    value={formData.target}
                    onValueChange={(value: any) => setFormData({ ...formData, target: value })}
                  >
                    <NeoSelectTrigger>
                      <NeoSelectValue />
                    </NeoSelectTrigger>
                    <NeoSelectContent>
                      <NeoSelectItem value="all">All Users ({userStats?.total || 0})</NeoSelectItem>
                      <NeoSelectItem value="active">Active Users ({userStats?.active || 0})</NeoSelectItem>
                      <NeoSelectItem value="vip">VIP Users ({userStats?.vip || 0})</NeoSelectItem>
                    </NeoSelectContent>
                  </NeoSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
                  <NeoInput
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <NeoButton variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </NeoButton>
              <NeoButton onClick={handleCreateBroadcast} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {formData.scheduledAt ? "Schedule" : "Send Now"}
                  </>
                )}
              </NeoButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="icon-bg-primary">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground font-bold">Total Campaigns</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="icon-bg-info">
              <CheckCircle className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sent}</p>
              <p className="text-xs text-muted-foreground font-bold">Sent</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="icon-bg-warning">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
              <p className="text-xs text-muted-foreground font-bold">Scheduled</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="icon-bg-highlight">
              <Users className="h-5 w-5 text-highlight" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalDelivered.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-bold">Total Delivered</p>
            </div>
          </NeoCardContent>
        </NeoCard>
      </div>

      {/* Broadcasts List */}
      <NeoCard>
        <NeoCardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading broadcasts...</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No broadcasts yet</h3>
              <p className="text-muted-foreground mb-4">Create your first broadcast campaign</p>
              <NeoButton onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Broadcast
              </NeoButton>
            </div>
          ) : (
            <div className="space-y-4">
              {broadcasts.map((broadcast) => {
                const StatusIcon = statusConfig[broadcast.status || "draft"]?.icon || MessageSquare

                return (
                  <div
                    key={broadcast.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{broadcast.title}</h3>
                          <NeoBadge variant={statusConfig[broadcast.status || "draft"]?.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {broadcast.status}
                          </NeoBadge>
                        </div>
                        <p className="text-muted-foreground mb-3">{broadcast.message}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>
                            <Users className="h-4 w-4 inline mr-1" />
                            {broadcast.target_count} users
                          </span>
                          {broadcast.status === "sent" && broadcast.sent_at && (
                            <>
                              <span>
                                Sent: {formatDate(broadcast.sent_at)}
                              </span>
                              <span>
                                Delivered: {broadcast.delivered_count || 0}/{broadcast.target_count}
                              </span>
                              {broadcast.failed_count > 0 && (
                                <span className="text-destructive">
                                  Failed: {broadcast.failed_count}
                                </span>
                              )}
                            </>
                          )}
                          {broadcast.status === "scheduled" && broadcast.scheduled_at && (
                            <span>
                              <Clock className="h-4 w-4 inline mr-1" />
                              {formatDate(broadcast.scheduled_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {broadcast.status === "draft" && (
                          <NeoButton size="sm" onClick={() => handleSendNow(broadcast.id)}>
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </NeoButton>
                        )}
                        <NeoButton
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBroadcast(broadcast)}
                        >
                          <Eye className="h-4 w-4" />
                        </NeoButton>
                        <NeoButton
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(broadcast.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </NeoButton>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </NeoCardContent>
      </NeoCard>

      {/* View Dialog */}
      <Dialog open={!!selectedBroadcast} onOpenChange={() => setSelectedBroadcast(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBroadcast?.title}</DialogTitle>
            <DialogDescription>Broadcast details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Message</Label>
              <p className="mt-2">{selectedBroadcast?.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target</Label>
                <p className="mt-2">{selectedBroadcast?.target}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="mt-2">{selectedBroadcast?.status}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <NeoButton variant="outline" onClick={() => setSelectedBroadcast(null)}>
              Close
            </NeoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
