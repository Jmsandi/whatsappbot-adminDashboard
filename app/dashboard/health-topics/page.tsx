"use client"

import * as React from "react"
import useSWR, { mutate } from "swr"
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle } from "@/components/ui/neo-card"
import { NeoButton } from "@/components/ui/neo-button"
import { NeoBadge } from "@/components/ui/neo-badge"
import { NeoInput } from "@/components/ui/neo-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Power,
    PowerOff,
    Loader2,
    BarChart3,
    MessageSquare,
    TrendingUp,
    Activity,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    getHealthTopics,
    createHealthTopic,
    updateHealthTopic,
    deleteHealthTopic,
    toggleTopicStatus,
    getHealthTopicStats,
    getAutomatedBroadcasts,
    getInteractionsByType,
    getBroadcastSettings
} from "@/lib/actions/health-topics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BroadcastSettingsCard } from "@/components/health-topics/BroadcastSettingsCard"

export default function HealthTopicsPage() {
    const [showCreateDialog, setShowCreateDialog] = React.useState(false)
    const [showEditDialog, setShowEditDialog] = React.useState(false)
    const [selectedTopic, setSelectedTopic] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    // Form state
    const [formData, setFormData] = React.useState({
        title: "",
        category: "",
        short_message: "",
        detailed_info: "",
        prevention_tips: ["", "", "", ""],
        icon_emoji: "🏥",
        priority: 3
    })

    const { data: topics = [], isLoading: topicsLoading, error: topicsError } = useSWR(
        "health-topics",
        async () => {
            console.log('Fetching health topics...')
            const data = await getHealthTopics()
            console.log('Health topics fetched:', data)
            return data
        },
        { refreshInterval: 30000 }
    )

    // Log any errors
    React.useEffect(() => {
        if (topicsError) {
            console.error('Error fetching health topics:', topicsError)
        }
    }, [topicsError])

    const { data: stats } = useSWR("health-topic-stats", getHealthTopicStats, {
        refreshInterval: 30000
    })

    const { data: broadcasts = [] } = useSWR("automated-broadcasts", () => getAutomatedBroadcasts(20), {
        refreshInterval: 30000
    })

    const { data: interactions } = useSWR("interaction-stats", getInteractionsByType, {
        refreshInterval: 30000
    })

    const { data: broadcastSettings } = useSWR("broadcast-settings", getBroadcastSettings, {
        refreshInterval: 10000
    })

    const handleCreate = async () => {
        setIsLoading(true)
        try {
            const tipsFiltered = formData.prevention_tips.filter(tip => tip.trim().length > 0)
            await createHealthTopic({
                ...formData,
                prevention_tips: tipsFiltered
            })
            mutate("health-topics")
            mutate("health-topic-stats")
            setShowCreateDialog(false)
            resetForm()
        } catch (error) {
            console.error("Failed to create topic:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedTopic) return
        setIsLoading(true)
        try {
            const tipsFiltered = formData.prevention_tips.filter(tip => tip.trim().length > 0)
            await updateHealthTopic(selectedTopic.id, {
                ...formData,
                prevention_tips: tipsFiltered
            })
            mutate("health-topics")
            setShowEditDialog(false)
            setSelectedTopic(null)
            resetForm()
        } catch (error) {
            console.error("Failed to update topic:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this topic?")) return
        setIsLoading(true)
        try {
            await deleteHealthTopic(id)
            mutate("health-topics")
            mutate("health-topic-stats")
        } catch (error) {
            console.error("Failed to delete topic:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleTopicStatus(id, !currentStatus)
            mutate("health-topics")
            mutate("health-topic-stats")
        } catch (error) {
            console.error("Failed to toggle status:", error)
        }
    }

    const openEditDialog = (topic: any) => {
        setSelectedTopic(topic)
        setFormData({
            title: topic.title,
            category: topic.category,
            short_message: topic.short_message,
            detailed_info: topic.detailed_info,
            prevention_tips: [...topic.prevention_tips, "", "", ""].slice(0, 6),
            icon_emoji: topic.icon_emoji,
            priority: topic.priority
        })
        setShowEditDialog(true)
    }

    const resetForm = () => {
        setFormData({
            title: "",
            category: "",
            short_message: "",
            detailed_info: "",
            prevention_tips: ["", "", "", ""],
            icon_emoji: "🏥",
            priority: 3
        })
    }

    const updateTip = (index: number, value: string) => {
        const newTips = [...formData.prevention_tips]
        newTips[index] = value
        setFormData({ ...formData, prevention_tips: newTips })
    }

    const addTip = () => {
        if (formData.prevention_tips.length < 10) {
            setFormData({ ...formData, prevention_tips: [...formData.prevention_tips, ""] })
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">Health Awareness Topics</h1>
                    <p className="text-muted-foreground mt-1">Manage automated broadcast content and view analytics</p>
                </div>
                <NeoButton onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Topic
                </NeoButton>
            </div>

            {/* Broadcast Settings Card */}
            {broadcastSettings && (
                <BroadcastSettingsCard settings={broadcastSettings} />
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-primary">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.totalTopics || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">Total Topics</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-success">
                            <Activity className="h-5 w-5 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.activeTopics || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">Active</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-info">
                            <BarChart3 className="h-5 w-5 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.totalBroadcasts || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">Broadcasts Sent</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
                <NeoCard hover>
                    <NeoCardContent className="p-4 flex items-center gap-4">
                        <div className="icon-bg-warning">
                            <TrendingUp className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.totalInteractions || 0}</p>
                            <p className="text-xs text-muted-foreground font-bold">User Interactions</p>
                        </div>
                    </NeoCardContent>
                </NeoCard>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="topics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
                    <TabsTrigger value="broadcasts">Broadcast History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Topics Tab */}
                <TabsContent value="topics" className="space-y-4">
                    <NeoCard>
                        <NeoCardContent className="p-6">
                            {topicsLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                </div>
                            ) : topics.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
                                    <p className="text-muted-foreground mb-4">Create your first health awareness topic</p>
                                    <NeoButton onClick={() => setShowCreateDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Topic
                                    </NeoButton>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topics.map((topic: any) => (
                                        <div
                                            key={topic.id}
                                            className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-2xl">{topic.icon_emoji}</span>
                                                        <h3 className="font-bold text-lg">{topic.title}</h3>
                                                        <NeoBadge variant={topic.is_active ? "success" : "secondary"}>
                                                            {topic.is_active ? "Active" : "Inactive"}
                                                        </NeoBadge>
                                                        <NeoBadge variant="default">Priority: {topic.priority}</NeoBadge>
                                                        <NeoBadge variant="outline">Sent: {topic.times_sent || 0}x</NeoBadge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">{topic.category}</p>
                                                    <p className="text-sm">{topic.short_message.substring(0, 150)}...</p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {topic.prevention_tips.length} prevention tips
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <NeoButton
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleToggleStatus(topic.id, topic.is_active)}
                                                    >
                                                        {topic.is_active ? (
                                                            <PowerOff className="h-4 w-4" />
                                                        ) : (
                                                            <Power className="h-4 w-4" />
                                                        )}
                                                    </NeoButton>
                                                    <NeoButton size="sm" variant="outline" onClick={() => openEditDialog(topic)}>
                                                        <Edit className="h-4 w-4" />
                                                    </NeoButton>
                                                    <NeoButton
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(topic.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </NeoButton>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </NeoCardContent>
                    </NeoCard>
                </TabsContent>

                {/* Broadcasts Tab */}
                <TabsContent value="broadcasts" className="space-y-4">
                    <NeoCard>
                        <NeoCardHeader>
                            <NeoCardTitle>Recent Automated Broadcasts</NeoCardTitle>
                        </NeoCardHeader>
                        <NeoCardContent className="p-6">
                            {broadcasts.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No broadcasts sent yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {broadcasts.map((broadcast: any) => (
                                        <div key={broadcast.id} className="border border-border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{broadcast.health_topics?.icon_emoji}</span>
                                                    <div>
                                                        <p className="font-semibold">{broadcast.health_topics?.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(broadcast.sent_at || broadcast.scheduled_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Delivered</p>
                                                        <p className="font-bold">{broadcast.delivered_count}/{broadcast.target_count}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Interactions</p>
                                                        <p className="font-bold">{broadcast.interaction_count}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </NeoCardContent>
                    </NeoCard>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <NeoCard>
                            <NeoCardHeader>
                                <NeoCardTitle>Interaction Types</NeoCardTitle>
                            </NeoCardHeader>
                            <NeoCardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">📘 Learn More</span>
                                        <span className="font-bold">{interactions?.learn_more || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">🛡️ Prevention Tips</span>
                                        <span className="font-bold">{interactions?.prevention_tips || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">❓ Ask Question</span>
                                        <span className="font-bold">{interactions?.ask_question || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">🔄 Share</span>
                                        <span className="font-bold">{interactions?.share || 0}</span>
                                    </div>
                                </div>
                            </NeoCardContent>
                        </NeoCard>

                        <NeoCard>
                            <NeoCardHeader>
                                <NeoCardTitle>Engagement Rate</NeoCardTitle>
                            </NeoCardHeader>
                            <NeoCardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-4xl font-bold">
                                        {stats?.totalBroadcasts && stats.totalBroadcasts > 0
                                            ? ((stats.totalInteractions / stats.totalBroadcasts) * 100).toFixed(1)
                                            : 0}%
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Average interactions per broadcast
                                    </p>
                                </div>
                            </NeoCardContent>
                        </NeoCard>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateDialog(false)
                    setShowEditDialog(false)
                    setSelectedTopic(null)
                    resetForm()
                }
            }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{showEditDialog ? "Edit" : "Create"} Health Topic</DialogTitle>
                        <DialogDescription>
                            {showEditDialog ? "Update" : "Add a new"} health awareness topic for automated broadcasts
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Title</Label>
                                <NeoInput
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Handwashing"
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <NeoInput
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., hygiene"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Icon Emoji</Label>
                                <NeoInput
                                    value={formData.icon_emoji}
                                    onChange={(e) => setFormData({ ...formData, icon_emoji: e.target.value })}
                                    placeholder="🏥"
                                />
                            </div>
                            <div>
                                <Label>Priority (1-10)</Label>
                                <NeoInput
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Short Message (2-3 sentences for broadcast)</Label>
                            <Textarea
                                value={formData.short_message}
                                onChange={(e) => setFormData({ ...formData, short_message: e.target.value })}
                                placeholder="Brief sensitization message..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>Detailed Information (for "Learn More")</Label>
                            <Textarea
                                value={formData.detailed_info}
                                onChange={(e) => setFormData({ ...formData, detailed_info: e.target.value })}
                                placeholder="Expanded information..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label>Prevention Tips (4-6 recommended)</Label>
                                <NeoButton size="sm" variant="outline" onClick={addTip}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Tip
                                </NeoButton>
                            </div>
                            <div className="space-y-2">
                                {formData.prevention_tips.map((tip, index) => (
                                    <NeoInput
                                        key={index}
                                        value={tip}
                                        onChange={(e) => updateTip(index, e.target.value)}
                                        placeholder={`Tip ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <NeoButton variant="outline" onClick={() => {
                            setShowCreateDialog(false)
                            setShowEditDialog(false)
                            resetForm()
                        }}>
                            Cancel
                        </NeoButton>
                        <NeoButton
                            onClick={showEditDialog ? handleUpdate : handleCreate}
                            disabled={isLoading || !formData.title || !formData.short_message}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                showEditDialog ? "Update Topic" : "Create Topic"
                            )}
                        </NeoButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
