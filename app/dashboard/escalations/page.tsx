"use client"

import * as React from "react"
import useSWR, { mutate } from "swr"
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle } from "@/components/ui/neo-card"
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
    AlertTriangle,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    MessageSquare,
    Send,
    Loader2,
    Eye,
    UserCheck,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    getEscalations,
    getEscalationById,
    getEscalationMessages,
    assignEscalation,
    addEscalationNote,
    resolveEscalation,
    getEscalationStats,
    sendEscalationResponse,
} from "@/lib/actions/escalations"
import { botApi } from "@/lib/api/bot-client"

const priorityConfig = {
    low: { variant: "secondary" as const, icon: Clock },
    normal: { variant: "default" as const, icon: AlertCircle },
    high: { variant: "warning" as const, icon: AlertTriangle },
    urgent: { variant: "destructive" as const, icon: AlertTriangle },
}

const statusConfig = {
    pending: { variant: "warning" as const, label: "Pending" },
    assigned: { variant: "default" as const, label: "Assigned" },
    in_progress: { variant: "default" as const, label: "In Progress" },
    resolved: { variant: "success" as const, label: "Resolved" },
    closed: { variant: "secondary" as const, label: "Closed" },
}

export default function EscalationsPage() {
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [priorityFilter, setPriorityFilter] = React.useState("all")
    const [selectedEscalation, setSelectedEscalation] = React.useState<any>(null)
    const [showDetailsDialog, setShowDetailsDialog] = React.useState(false)
    const [conversation, setConversation] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [adminResponse, setAdminResponse] = React.useState("")
    const [adminNotes, setAdminNotes] = React.useState("")

    const { data: escalations = [], isLoading: escalationsLoading, error: escalationsError } = useSWR(
        ["escalations", statusFilter, priorityFilter],
        () => getEscalations({ status: statusFilter, priority: priorityFilter !== "all" ? priorityFilter : undefined }),
        {
            refreshInterval: 10000,
            revalidateOnFocus: true,
        }
    )

    const { data: stats } = useSWR("escalationStats", getEscalationStats, {
        refreshInterval: 15000,
    })

    const handleViewDetails = async (escalation: any) => {
        setSelectedEscalation(escalation)
        setShowDetailsDialog(true)
        setAdminNotes(escalation.admin_notes || "")

        // Load conversation history
        try {
            const messages = await getEscalationMessages(escalation.user_id)
            setConversation(messages)
        } catch (error) {
            console.error("Failed to load conversation:", error)
        }
    }

    const handleSendResponse = async () => {
        if (!selectedEscalation || !adminResponse.trim()) return
        setIsLoading(true)
        try {
            // Send response via WhatsApp
            const userPhone = selectedEscalation.users?.phone
            if (userPhone) {
                await sendEscalationResponse(selectedEscalation.id, userPhone, adminResponse)
            } else {
                // Fallback: just mark as resolved if no phone
                await resolveEscalation(selectedEscalation.id, adminResponse)
            }

            mutate(["escalations", statusFilter, priorityFilter])
            mutate("escalationStats")
            setAdminResponse("")
            setShowDetailsDialog(false)
            alert("Response sent successfully!")
        } catch (error) {
            console.error("Failed to send response:", error)
            alert("Failed to send response. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-bold">Escalations</h1>
                <p className="text-muted-foreground mt-1">Review and respond to flagged conversations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-primary">
                            <AlertCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.total || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">Total</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-warning">
                            <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">Pending</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-destructive">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.urgent || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">Urgent</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-info">
                            <CheckCircle className="h-5 w-5 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.today || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">Today</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <NeoSelect value={statusFilter} onValueChange={setStatusFilter}>
                    <NeoSelectTrigger className="w-full sm:w-[200px]">
                        <NeoSelectValue />
                    </NeoSelectTrigger>
                    <NeoSelectContent>
                        <NeoSelectItem value="all">All Status</NeoSelectItem>
                        <NeoSelectItem value="pending">Pending</NeoSelectItem>
                        <NeoSelectItem value="assigned">Assigned</NeoSelectItem>
                        <NeoSelectItem value="in_progress">In Progress</NeoSelectItem>
                        <NeoSelectItem value="resolved">Resolved</NeoSelectItem>
                    </NeoSelectContent>
                </NeoSelect>

                <NeoSelect value={priorityFilter} onValueChange={setPriorityFilter}>
                    <NeoSelectTrigger className="w-full sm:w-[200px]">
                        <NeoSelectValue />
                    </NeoSelectTrigger>
                    <NeoSelectContent>
                        <NeoSelectItem value="all">All Priorities</NeoSelectItem>
                        <NeoSelectItem value="low">Low</NeoSelectItem>
                        <NeoSelectItem value="normal">Normal</NeoSelectItem>
                        <NeoSelectItem value="high">High</NeoSelectItem>
                        <NeoSelectItem value="urgent">Urgent</NeoSelectItem>
                    </NeoSelectContent>
                </NeoSelect>
            </div>

            {/* Escalations List */}
            <NeoCard>
                <NeoCardContent className="p-6">
                    {escalationsLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground mt-2">Loading escalations...</p>
                        </div>
                    ) : escalationsError ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Error loading escalations</h3>
                            <p className="text-muted-foreground">{escalationsError.message || "Please check your connection and try again."}</p>
                            <NeoButton variant="outline" className="mt-4" onClick={() => mutate(["escalations", statusFilter, priorityFilter])}>
                                Retry
                            </NeoButton>
                        </div>
                    ) : escalations.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No escalations found</h3>
                            <p className="text-muted-foreground">All conversations are being handled smoothly!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {escalations.map((escalation: any) => {
                                const priority = (escalation.priority || 'normal') as keyof typeof priorityConfig
                                const status = (escalation.status || 'pending') as keyof typeof statusConfig
                                const PriorityIcon = priorityConfig[priority]?.icon || AlertCircle
                                const priorityVariant = priorityConfig[priority]?.variant || "default"
                                const statusVariant = statusConfig[status]?.variant || "default"
                                const statusLabel = statusConfig[status]?.label || escalation.status

                                return (
                                    <div
                                        key={escalation.id}
                                        className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <NeoBadge variant={priorityVariant}>
                                                        <PriorityIcon className="h-3 w-3 mr-1" />
                                                        {escalation.priority}
                                                    </NeoBadge>
                                                    <NeoBadge variant={statusVariant}>
                                                        {statusLabel}
                                                    </NeoBadge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {escalation.trigger_type}
                                                    </span>
                                                </div>
                                                <p className="font-semibold mb-1">
                                                    <User className="h-4 w-4 inline mr-1" />
                                                    {escalation.users?.name || escalation.users?.phone}
                                                </p>
                                                <p className="text-sm text-muted-foreground mb-2">{escalation.reason}</p>
                                                <p className="text-sm italic">"{escalation.messages?.content}"</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                    {formatDate(escalation.created_at)}
                                                </p>
                                            </div>
                                            <NeoButton size="sm" onClick={() => handleViewDetails(escalation)}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </NeoButton>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </NeoCardContent>
            </NeoCard>

            {/* Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Escalation Details</DialogTitle>
                        <DialogDescription>
                            {selectedEscalation?.users?.name || selectedEscalation?.users?.phone}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEscalation && (
                        <div className="space-y-6 py-4">
                            {/* Health Worker Notification */}
                            <div className="p-4 bg-primary/5 rounded-xl border-2 border-primary/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Send className="h-4 w-4 text-primary" />
                                    </div>
                                    <Label className="text-base font-bold">Health Worker Notification</Label>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <span className="font-bold text-muted-foreground">Status: </span>
                                        <NeoBadge variant="success" className="ml-1">Forwarded</NeoBadge>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-muted-foreground">Sent To: </span>
                                        {selectedEscalation.admin_notes?.replace('Forwarded to health workers: ', '') || 'System Distribution List'}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-primary/10">
                                        <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider text-muted-foreground">Report Preview</p>
                                        <div className="bg-background/80 p-3 rounded-lg border border-primary/5 font-mono text-xs whitespace-pre-wrap">
                                            {`🚨 EMERGENCY REPORT\n\n👤 User: ${selectedEscalation.users?.name || 'Unknown User'}\n📱 Phone: ${selectedEscalation.users?.phone || 'Unknown'}\n🕐 Time: ${formatDate(selectedEscalation.created_at)}\n\n📝 REASON:\n${selectedEscalation.reason}\n\n💬 CONVERSATION SUMMARY:\n${selectedEscalation.conversation_summary || 'No summary available.'}\n\n⚠️ LATEST MESSAGE:\n"${selectedEscalation.trigger_message || selectedEscalation.messages?.content || 'No message context'}"`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User details & Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/40 rounded-xl border border-border">
                                        <Label className="text-muted-foreground font-bold mb-2 block">User Contact</Label>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-background rounded-lg border border-border">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary">{selectedEscalation.users?.name || 'Anonymous User'}</p>
                                                <p className="text-sm font-mono text-muted-foreground">{selectedEscalation.users?.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/40 rounded-xl border border-border">
                                        <Label className="text-muted-foreground font-bold mb-2 block">Trigger Message</Label>
                                        <div className="p-3 bg-background rounded-lg border border-border italic text-sm text-primary">
                                            "{selectedEscalation.trigger_message || selectedEscalation.messages?.content || 'No trigger message stored'}"
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/40 rounded-xl border border-border">
                                        <Label className="text-muted-foreground font-bold mb-2 block">AI Summary (Reason)</Label>
                                        <p className="text-sm leading-relaxed text-primary">
                                            {selectedEscalation.reason}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-muted/40 rounded-xl border border-border">
                                        <Label className="text-muted-foreground font-bold mb-2 block">Conversation Summary</Label>
                                        <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                                            {selectedEscalation.conversation_summary || "Full context not available for this legacy record."}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Priority</span>
                                                <NeoBadge variant={priorityConfig[(selectedEscalation.priority || 'normal') as keyof typeof priorityConfig]?.variant || "default"}>
                                                    {selectedEscalation.priority}
                                                </NeoBadge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <NeoButton variant="default" className="w-full sm:w-auto" onClick={() => setShowDetailsDialog(false)}>
                            Done
                        </NeoButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
