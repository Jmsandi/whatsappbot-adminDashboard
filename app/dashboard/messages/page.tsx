"use client"

import * as React from "react"
import useSWR from "swr"
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
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  RefreshCw,
  FileText,
  Eye,
  Users,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getMessages, getMessageStats, getUniqueIntents } from "@/lib/actions/messages"
import type { Message } from "@/lib/supabase/types"

const statusConfig: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "success" | "warning"; icon: React.ElementType }
> = {
  handled: { variant: "success", icon: CheckCircle },
  pending: { variant: "warning", icon: Clock },
  failed: { variant: "destructive", icon: AlertCircle },
}

type MessageWithUser = Message & {
  users?: {
    name?: string | null
    phone: string
  } | null
}

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = React.useState<MessageWithUser | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [intentFilter, setIntentFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [isLiveMode, setIsLiveMode] = React.useState(false)
  const LIMIT = 50

  // Fetch unique intents for filter
  const { data: intents = [] } = useSWR('unique-intents', getUniqueIntents)

  // Fetch messages from database
  const { data: messagesData, error: messagesError, mutate: refreshMessages, isLoading: messagesLoading } = useSWR(
    ['messages', searchQuery, statusFilter, intentFilter, page],
    () => getMessages({
      search: searchQuery || undefined,
      intent: intentFilter,
      page: page,
      limit: LIMIT
    }),
    {
      refreshInterval: isLiveMode ? 5000 : 0, // Auto-refresh every 5s in live mode
      revalidateOnFocus: true,
    }
  )

  const messages = messagesData?.data || []
  const totalCount = messagesData?.count || 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  // Fetch stats from database
  const { data: stats, mutate: refreshStats } = useSWR(
    'message-stats',
    () => getMessageStats(),
    {
      refreshInterval: isLiveMode ? 5000 : 0,
    }
  )

  // Filter messages based on status
  const filteredMessages = React.useMemo(() => {
    if (!messages) return []

    return messages.filter((msg) => {
      // Status filter
      if (statusFilter === "handled" && !msg.is_handled) return false
      if (statusFilter === "pending" && msg.is_handled) return false

      return true
    })
  }, [messages, statusFilter])

  const handleRefresh = () => {
    refreshMessages()
    refreshStats()
  }

  const handleExport = (format: "csv" | "pdf") => {
    alert(`Exporting as ${format.toUpperCase()}... (Coming soon)`)
  }

  const getStatusLabel = (message: MessageWithUser) => {
    if (message.is_handled) return 'handled'
    return 'pending'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Group messages by user for conversation view
  const getConversation = (message: MessageWithUser) => {
    if (!messages) return []
    return messages.filter(m => m.user_id === message.user_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">User Messages</h1>
          <p className="text-muted-foreground mt-1">View and manage all bot conversations</p>
        </div>
        <div className="flex items-center gap-4">
          <NeoButton
            variant={isLiveMode ? "default" : "outline"}
            onClick={() => setIsLiveMode(!isLiveMode)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLiveMode ? "animate-spin" : ""}`} />
            {isLiveMode ? "Live Mode On" : "Live Mode Off"}
          </NeoButton>
          <NeoButton variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </NeoButton>
          <NeoButton variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </NeoButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="icon-bg-primary">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground font-bold">Total Messages</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="icon-bg-info">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.unhandled.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground font-bold">Pending</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="icon-bg-highlight">
              <MessageSquare className="h-5 w-5 text-highlight" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.today.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground font-bold">Today</p>
            </div>
          </NeoCardContent>
        </NeoCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <NeoInput
            placeholder="Search messages, users, or phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <NeoSelect value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
          <NeoSelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <NeoSelectValue placeholder="Status" />
          </NeoSelectTrigger>
          <NeoSelectContent>
            <NeoSelectItem value="all">All Status</NeoSelectItem>
            <NeoSelectItem value="handled">Handled</NeoSelectItem>
            <NeoSelectItem value="pending">Pending</NeoSelectItem>
          </NeoSelectContent>
        </NeoSelect>

        <NeoSelect value={intentFilter} onValueChange={(val) => { setIntentFilter(val); setPage(1); }}>
          <NeoSelectTrigger className="w-full sm:w-[150px]">
            <FileText className="h-4 w-4 mr-2" />
            <NeoSelectValue placeholder="Intent" />
          </NeoSelectTrigger>
          <NeoSelectContent>
            <NeoSelectItem value="all">All Intents</NeoSelectItem>
            {intents.map(intent => (
              <NeoSelectItem key={intent} value={intent}>{intent}</NeoSelectItem>
            ))}
          </NeoSelectContent>
        </NeoSelect>
      </div>

      {/* Error State */}
      {messagesError && (
        <NeoCard>
          <NeoCardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Messages</h3>
            <p className="text-muted-foreground mb-4">{messagesError.message}</p>
            <NeoButton onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </NeoButton>
          </NeoCardContent>
        </NeoCard>
      )}

      {/* Messages Table */}
      {!messagesError && (
        <NeoCard>
          <NeoCardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold">User</th>
                    <th className="text-left p-4 font-semibold">Phone</th>
                    <th className="text-left p-4 font-semibold">Message</th>
                    <th className="text-left p-4 font-semibold">Intent</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Time</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-semibold">No messages found</p>
                        <p className="text-sm mt-2">
                          {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Messages will appear here when users chat with your bot'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((message) => {
                      const status = getStatusLabel(message)
                      const StatusIcon = statusConfig[status]?.icon || MessageSquare

                      return (
                        <tr key={message.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium">{message.users?.name || 'Unknown'}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground font-mono">
                              {message.users?.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs truncate" title={message.content}>
                              {message.content}
                            </div>
                          </td>
                          <td className="p-4">
                            <NeoBadge variant="secondary">
                              {message.intent || 'General'}
                            </NeoBadge>
                          </td>
                          <td className="p-4">
                            <NeoBadge variant={statusConfig[status]?.variant || "default"}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status}
                            </NeoBadge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground">
                              {formatTimestamp(message.created_at)}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <NeoButton
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedMessage(message)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </NeoButton>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(page - 1) * LIMIT + 1}</span> to <span className="font-medium">{Math.min(page * LIMIT, totalCount)}</span> of <span className="font-medium">{totalCount}</span> messages
                </p>
                <div className="flex items-center gap-2">
                  <NeoButton
                    variant="outline"
                    size="sm"
                    disabled={page === 1 || messagesLoading}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </NeoButton>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Simple pagination logic for showing few pages around current
                      let pageNum = page
                      if (totalPages <= 5) pageNum = i + 1
                      else {
                        if (page <= 3) pageNum = i + 1
                        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                        else pageNum = page - 2 + i
                      }

                      return (
                        <NeoButton
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </NeoButton>
                      )
                    })}
                  </div>
                  <NeoButton
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages || messagesLoading}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </NeoButton>
                </div>
              </div>
            )}
          </NeoCardContent>
        </NeoCard>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversation with {selectedMessage?.users?.name || 'Unknown'}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.users?.phone || 'No phone number'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMessage && getConversation(selectedMessage).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'user'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground'
                    }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {msg.sender === 'user' ? 'User' : 'Bot'} • {formatTimestamp(msg.created_at)}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.intent && (
                    <div className="text-xs opacity-70 mt-2">
                      Intent: {msg.intent}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <NeoButton variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </NeoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
