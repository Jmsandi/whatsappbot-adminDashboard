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
  Plus,
  Search,
  Shield,
  Stethoscope,
  Users,
  Phone,
  Mail,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
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
import { Label } from "@/components/ui/label"
import { getContacts, createContact, deleteContact } from "@/lib/actions/contacts"
import { createLog } from "@/lib/actions/logs"
import type { SpecialContact, ContactRole } from "@/lib/supabase/types"
import useSWR, { mutate } from "swr"

const roleIcons: Record<string, React.ElementType> = {
  Admin: Shield,
  "Health Worker": Stethoscope,
  Supervisor: Users,
  Support: Users,
}

export default function ContactsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [isLoading, setIsLoading] = React.useState(false)

  const [newContact, setNewContact] = React.useState({
    name: "",
    phone: "",
    email: "",
    role: "" as ContactRole | "",
  })

  const { data: contacts = [], error, isLoading: contactsLoading } = useSWR("contacts", getContacts)

  const filteredContacts = React.useMemo(() => {
    return contacts.filter((contact: SpecialContact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery) ||
        (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesRole = roleFilter === "all" || contact.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [contacts, searchQuery, roleFilter])

  const stats = React.useMemo(
    () => [
      { label: "Admins", count: contacts.filter((c: SpecialContact) => c.role === "Admin").length, icon: Shield },
      {
        label: "Health Workers",
        count: contacts.filter((c: SpecialContact) => c.role === "Health Worker").length,
        icon: Stethoscope,
      },
      {
        label: "Supervisors",
        count: contacts.filter((c: SpecialContact) => c.role === "Supervisor").length,
        icon: Users,
      },
    ],
    [contacts],
  )

  const handleCreateContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.role) return
    setIsLoading(true)
    try {
      await createContact({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || undefined,
        role: newContact.role as ContactRole,
      })
      await createLog({
        action: `Special contact added: ${newContact.name}`,
        action_type: "create",
        admin_name: "Current Admin",
        details: { name: newContact.name, role: newContact.role },
      })
      mutate("contacts")
      setIsAddDialogOpen(false)
      setNewContact({ name: "", phone: "", email: "", role: "" })
    } catch (error) {
      console.error("Failed to create contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContact = async (contact: SpecialContact) => {
    if (!confirm(`Are you sure you want to delete ${contact.name}?`)) return
    setIsLoading(true)
    try {
      await deleteContact(contact.id)
      await createLog({
        action: `Special contact deleted: ${contact.name}`,
        action_type: "delete",
        admin_name: "Current Admin",
        details: { contact_id: contact.id },
      })
      mutate("contacts")
    } catch (error) {
      console.error("Failed to delete contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <NeoCard>
          <NeoCardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Failed to load contacts</h2>
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
          <h1 className="text-3xl lg:text-4xl font-bold">Special Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage priority contacts for escalation and support</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <NeoButton>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </NeoButton>
          </DialogTrigger>
          <DialogContent className="border-4 border-foreground rounded-[1rem] neo-shadow">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Contact</DialogTitle>
              <DialogDescription>Add a priority contact for escalation purposes</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold">Full Name</Label>
                <NeoInput
                  placeholder="Enter full name"
                  value={newContact.name}
                  onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Phone Number</Label>
                  <NeoInput
                    placeholder="+234 XXX XXX XXXX"
                    value={newContact.phone}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Email</Label>
                  <NeoInput
                    placeholder="email@example.com"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Role</Label>
                <NeoSelect
                  value={newContact.role}
                  onValueChange={(value) => setNewContact((prev) => ({ ...prev, role: value as ContactRole }))}
                >
                  <NeoSelectTrigger>
                    <NeoSelectValue placeholder="Select role" />
                  </NeoSelectTrigger>
                  <NeoSelectContent>
                    <NeoSelectItem value="Admin">Admin</NeoSelectItem>
                    <NeoSelectItem value="Health Worker">Health Worker</NeoSelectItem>
                    <NeoSelectItem value="Supervisor">Supervisor</NeoSelectItem>
                    <NeoSelectItem value="Support">Support</NeoSelectItem>
                  </NeoSelectContent>
                </NeoSelect>
              </div>
            </div>
            <DialogFooter>
              <NeoButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton onClick={handleCreateContact} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Contact
              </NeoButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats - Using real data */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <NeoCard key={stat.label} hover>
            <NeoCardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-foreground bg-secondary flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs text-muted-foreground font-bold">{stat.label}</p>
              </div>
            </NeoCardContent>
          </NeoCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <NeoInput
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
        <NeoSelect value={roleFilter} onValueChange={setRoleFilter}>
          <NeoSelectTrigger className="w-full sm:w-48">
            <NeoSelectValue placeholder="Filter by role" />
          </NeoSelectTrigger>
          <NeoSelectContent>
            <NeoSelectItem value="all">All Roles</NeoSelectItem>
            <NeoSelectItem value="Admin">Admins</NeoSelectItem>
            <NeoSelectItem value="Health Worker">Health Workers</NeoSelectItem>
            <NeoSelectItem value="Supervisor">Supervisors</NeoSelectItem>
            <NeoSelectItem value="Support">Support</NeoSelectItem>
          </NeoSelectContent>
        </NeoSelect>
      </div>

      {/* Contacts Grid */}
      {contactsLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact: SpecialContact) => {
            const RoleIcon = roleIcons[contact.role] || Users
            return (
              <NeoCard key={contact.id} hover>
                <NeoCardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full border-4 border-foreground bg-secondary flex items-center justify-center">
                        <RoleIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{contact.name}</h3>
                        <NeoBadge variant={contact.status === "active" ? "success" : "secondary"}>
                          {contact.status}
                        </NeoBadge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-muted">
                    <NeoBadge variant="outline">{contact.role}</NeoBadge>
                    <div className="flex gap-2">
                      <NeoButton variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </NeoButton>
                      <NeoButton
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteContact(contact)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </NeoButton>
                    </div>
                  </div>
                </NeoCardContent>
              </NeoCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
