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
import { DataTable } from "@/components/dashboard/data-table"
import {
  Users,
  Search,
  Filter,
  Download,
  Ban,
  Trash2,
  Tag,
  Eye,
  MoreVertical,
  UserPlus,
  Shield,
  Star,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getUsers, getUserStats, updateUserStatus, updateUserTags, deleteUser } from "@/lib/actions/users"
import { getMessagesByUser } from "@/lib/actions/messages"
import { createLog } from "@/lib/actions/logs"
import type { User } from "@/lib/supabase/types"
import useSWR, { mutate } from "swr"

const tagColors: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
  VIP: "success",
  Staff: "default",
  Blacklist: "destructive",
}

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [showTagDialog, setShowTagDialog] = React.useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [userMessages, setUserMessages] = React.useState<
    Array<{ sender: string; content: string; created_at: string }>
  >([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const { data: users = [], error: usersError, isLoading: usersLoading } = useSWR("users", getUsers)
  const { data: stats, error: statsError } = useSWR("userStats", getUserStats)

  const filteredUsers = React.useMemo(() => {
    return users.filter((u: User) => {
      const matchesStatus = statusFilter === "all" || u.status === statusFilter
      const matchesSearch =
        searchQuery === "" || u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery)
      return matchesStatus && matchesSearch
    })
  }, [users, statusFilter, searchQuery])

  const handleToggleBan = async (user: User) => {
    setIsLoading(true)
    try {
      const newStatus = user.status === "banned" ? "active" : "banned"
      await updateUserStatus(user.id, newStatus)
      await createLog({
        action: `User ${newStatus === "banned" ? "banned" : "unbanned"}: ${user.name || user.phone}`,
        action_type: "update",
        admin_name: "Current Admin",
        details: { user_id: user.id, new_status: newStatus },
      })
      mutate("users")
      mutate("userStats")
    } catch (error) {
      console.error("Failed to update user status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name || user.phone}?`)) return
    setIsLoading(true)
    try {
      await deleteUser(user.id)
      await createLog({
        action: `User deleted: ${user.name || user.phone}`,
        action_type: "delete",
        admin_name: "Current Admin",
        details: { user_id: user.id },
      })
      mutate("users")
      mutate("userStats")
    } catch (error) {
      console.error("Failed to delete user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTags = async () => {
    if (!selectedUser) return
    setIsLoading(true)
    try {
      await updateUserTags(selectedUser.id, selectedTags)
      await createLog({
        action: `Tags updated for: ${selectedUser.name || selectedUser.phone}`,
        action_type: "update",
        admin_name: "Current Admin",
        details: { user_id: selectedUser.id, tags: selectedTags },
      })
      mutate("users")
      setShowTagDialog(false)
    } catch (error) {
      console.error("Failed to update tags:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewHistory = async (user: User) => {
    setSelectedUser(user)
    setShowHistoryDialog(true)
    try {
      const messages = await getMessagesByUser(user.id)
      setUserMessages(messages)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      setUserMessages([])
    }
  }

  const columns = [
    {
      key: "phone",
      label: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-foreground bg-secondary flex items-center justify-center font-bold">
            {(user.name || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-bold">{user.name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground font-mono">{user.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user: User) => (
        <NeoBadge
          variant={user.status === "active" ? "success" : user.status === "banned" ? "destructive" : "secondary"}
        >
          {user.status}
        </NeoBadge>
      ),
    },
    {
      key: "tags",
      label: "Tags",
      render: (user: User) => (
        <div className="flex gap-1 flex-wrap">
          {user.tags && user.tags.length > 0 ? (
            user.tags.map((tag) => (
              <NeoBadge key={tag} variant={tagColors[tag] || "secondary"} className="text-[10px]">
                {tag}
              </NeoBadge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: "messages_count",
      label: "Messages",
      render: (user: User) => <span className="font-mono font-bold">{user.messages_count || 0}</span>,
    },
    {
      key: "last_active",
      label: "Last Active",
      render: (user: User) => (
        <span className="text-muted-foreground">
          {user.last_active ? new Date(user.last_active).toLocaleDateString() : "Never"}
        </span>
      ),
    },
  ]

  if (usersError || statsError) {
    return (
      <div className="p-6 lg:p-8">
        <NeoCard>
          <NeoCardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Failed to load data</h2>
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
          <h1 className="text-3xl lg:text-4xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all WhatsApp users and their permissions</p>
        </div>
        <NeoButton>
          <Download className="h-4 w-4 mr-2" />
          Export Users
        </NeoButton>
      </div>

      {/* Stats Cards - Using real data from database */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-secondary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total?.toLocaleString() ?? "..."}</p>
              <p className="text-xs text-muted-foreground font-bold">Total Users</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-success/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.active?.toLocaleString() ?? "..."}</p>
              <p className="text-xs text-muted-foreground font-bold">Active Users</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-warning/20 flex items-center justify-center">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.vip?.toLocaleString() ?? "..."}</p>
              <p className="text-xs text-muted-foreground font-bold">VIP Users</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-destructive/20 flex items-center justify-center">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.banned?.toLocaleString() ?? "..."}</p>
              <p className="text-xs text-muted-foreground font-bold">Banned Users</p>
            </div>
          </NeoCardContent>
        </NeoCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <NeoInput
            placeholder="Search users by name or phone..."
            className="pl-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <NeoSelect value={statusFilter} onValueChange={setStatusFilter}>
          <NeoSelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <NeoSelectValue placeholder="Status" />
          </NeoSelectTrigger>
          <NeoSelectContent>
            <NeoSelectItem value="all">All Status</NeoSelectItem>
            <NeoSelectItem value="active">Active</NeoSelectItem>
            <NeoSelectItem value="inactive">Inactive</NeoSelectItem>
            <NeoSelectItem value="banned">Banned</NeoSelectItem>
          </NeoSelectContent>
        </NeoSelect>
      </div>

      {/* Users Table */}
      {usersLoading ? (
        <NeoCard>
          <NeoCardContent className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </NeoCardContent>
        </NeoCard>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          searchPlaceholder="Search in results..."
          actions={(user: User) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <NeoButton variant="ghost" size="icon" disabled={isLoading}>
                  <MoreVertical className="h-4 w-4" />
                </NeoButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-4 border-foreground rounded-[1rem] neo-shadow">
                <DropdownMenuItem onClick={() => handleViewHistory(user)} className="font-bold">
                  <Eye className="h-4 w-4 mr-2" />
                  View History
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user)
                    setSelectedTags(user.tags || [])
                    setShowTagDialog(true)
                  }}
                  className="font-bold"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="font-bold text-warning" onClick={() => handleToggleBan(user)}>
                  <Ban className="h-4 w-4 mr-2" />
                  {user.status === "banned" ? "Unban User" : "Ban User"}
                </DropdownMenuItem>
                <DropdownMenuItem className="font-bold text-destructive" onClick={() => handleDeleteUser(user)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      {/* Tag Management Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="border-4 border-foreground rounded-[1rem] neo-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Manage Tags</DialogTitle>
            <DialogDescription>Apply or remove tags for {selectedUser?.name || selectedUser?.phone}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {["VIP", "Staff", "Blacklist"].map((tag) => (
              <NeoButton
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="justify-start"
                onClick={() => {
                  setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                }}
              >
                {tag === "VIP" && <Star className="h-4 w-4 mr-2" />}
                {tag === "Staff" && <Shield className="h-4 w-4 mr-2" />}
                {tag === "Blacklist" && <AlertTriangle className="h-4 w-4 mr-2" />}
                {tag}
              </NeoButton>
            ))}
          </div>
          <DialogFooter>
            <NeoButton variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </NeoButton>
            <NeoButton onClick={handleUpdateTags} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </NeoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversation History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="border-4 border-foreground rounded-[1rem] neo-shadow max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Conversation History</DialogTitle>
            <DialogDescription>
              Messages from {selectedUser?.name} ({selectedUser?.phone})
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {userMessages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No messages found</p>
            ) : (
              userMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-[1rem] border-2 border-foreground ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-2 opacity-70">{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <NeoButton variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Close
            </NeoButton>
            <NeoButton>
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </NeoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
