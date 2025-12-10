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
  Plus,
  Shield,
  Crown,
  Brain,
  HeadphonesIcon,
  FileEdit,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Key,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const admins = [
  {
    id: "1",
    name: "John Smith",
    email: "john@company.com",
    role: "Super Admin",
    status: "active",
    lastLogin: "Just now",
    createdAt: "Jan 1, 2024",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Bot Trainer",
    status: "active",
    lastLogin: "2 hours ago",
    createdAt: "Feb 15, 2024",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@company.com",
    role: "Support Admin",
    status: "active",
    lastLogin: "1 day ago",
    createdAt: "Mar 10, 2024",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@company.com",
    role: "Data Annotator",
    status: "inactive",
    lastLogin: "1 week ago",
    createdAt: "Apr 5, 2024",
  },
  {
    id: "5",
    name: "David Chen",
    email: "david@company.com",
    role: "Super Admin",
    status: "active",
    lastLogin: "30 min ago",
    createdAt: "May 20, 2024",
  },
  {
    id: "6",
    name: "Lisa Brown",
    email: "lisa@company.com",
    role: "Bot Trainer",
    status: "active",
    lastLogin: "3 hours ago",
    createdAt: "Jun 1, 2024",
  },
]

const roleConfig: Record<
  string,
  {
    icon: React.ElementType
    color: "default" | "secondary" | "destructive" | "success" | "warning"
    permissions: string[]
  }
> = {
  "Super Admin": {
    icon: Crown,
    color: "warning",
    permissions: ["Full access to all features", "Manage other admins", "Delete data", "System settings"],
  },
  "Bot Trainer": {
    icon: Brain,
    color: "success",
    permissions: ["Add/edit training data", "View analytics", "Correct bot responses"],
  },
  "Support Admin": {
    icon: HeadphonesIcon,
    color: "default",
    permissions: ["View user messages", "Ban/unban users", "Manage broadcasts"],
  },
  "Data Annotator": {
    icon: FileEdit,
    color: "secondary",
    permissions: ["Add training data", "Review corrections", "View logs"],
  },
}

export default function AdminsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null)

  const columns = [
    {
      key: "name",
      label: "Admin",
      render: (admin: (typeof admins)[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-foreground bg-secondary flex items-center justify-center font-bold">
            {admin.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="font-bold">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (admin: (typeof admins)[0]) => {
        const config = roleConfig[admin.role]
        const Icon = config?.icon || Shield
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <NeoBadge variant={config?.color || "default"}>{admin.role}</NeoBadge>
          </div>
        )
      },
    },
    {
      key: "status",
      label: "Status",
      render: (admin: (typeof admins)[0]) => (
        <NeoBadge variant={admin.status === "active" ? "success" : "secondary"}>{admin.status}</NeoBadge>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (admin: (typeof admins)[0]) => <span className="text-muted-foreground text-sm">{admin.lastLogin}</span>,
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">Admin Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage admin users and their permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <NeoButton>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </NeoButton>
          </DialogTrigger>
          <DialogContent className="border-4 border-foreground rounded-[1rem] neo-shadow">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Admin</DialogTitle>
              <DialogDescription>Create a new admin account with specific role and permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Full Name</Label>
                  <NeoInput placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Email</Label>
                  <NeoInput placeholder="admin@company.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Role</Label>
                <NeoSelect onValueChange={setSelectedRole}>
                  <NeoSelectTrigger>
                    <NeoSelectValue placeholder="Select role" />
                  </NeoSelectTrigger>
                  <NeoSelectContent>
                    <NeoSelectItem value="Super Admin">Super Admin</NeoSelectItem>
                    <NeoSelectItem value="Bot Trainer">Bot Trainer</NeoSelectItem>
                    <NeoSelectItem value="Support Admin">Support Admin</NeoSelectItem>
                    <NeoSelectItem value="Data Annotator">Data Annotator</NeoSelectItem>
                  </NeoSelectContent>
                </NeoSelect>
              </div>
              {selectedRole && (
                <div className="p-4 rounded-[1rem] border-2 border-foreground bg-secondary">
                  <p className="font-bold text-sm mb-2">Permissions for {selectedRole}:</p>
                  <ul className="space-y-1">
                    {roleConfig[selectedRole]?.permissions.map((perm, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-2">
                <Label className="font-bold">Temporary Password</Label>
                <NeoInput placeholder="Enter temporary password" type="password" />
                <p className="text-xs text-muted-foreground">Admin will be required to change this on first login</p>
              </div>
            </div>
            <DialogFooter>
              <NeoButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton onClick={() => setIsAddDialogOpen(false)}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </NeoButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon
          const count = admins.filter((a) => a.role === role).length
          return (
            <NeoCard key={role} hover>
              <NeoCardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-foreground bg-secondary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground font-bold">{role}s</p>
                  </div>
                </div>
              </NeoCardContent>
            </NeoCard>
          )
        })}
      </div>

      {/* Admins Table */}
      <DataTable
        columns={columns}
        data={admins}
        searchPlaceholder="Search admins..."
        actions={(admin) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NeoButton variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </NeoButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-4 border-foreground rounded-[1rem] neo-shadow">
              <DropdownMenuItem className="font-bold">
                <Edit className="h-4 w-4 mr-2" />
                Edit Admin
              </DropdownMenuItem>
              <DropdownMenuItem className="font-bold">
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-bold text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  )
}
