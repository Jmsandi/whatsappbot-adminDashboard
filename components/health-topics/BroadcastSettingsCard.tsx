"use client"

import * as React from "react"
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle } from "@/components/ui/neo-card"
import { NeoButton } from "@/components/ui/neo-button"
import { NeoBadge } from "@/components/ui/neo-badge"
import { NeoInput } from "@/components/ui/neo-input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Clock, Send, Loader2, Power, PowerOff } from "lucide-react"
import { getBroadcastSettings, updateBroadcastSettings, triggerManualBroadcast } from "@/lib/actions/health-topics"
import { mutate } from "swr"

interface BroadcastSettingsCardProps {
    settings: any
}

export function BroadcastSettingsCard({ settings: initialSettings }: BroadcastSettingsCardProps) {
    const [settings, setSettings] = React.useState(initialSettings)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSending, setIsSending] = React.useState(false)

    const handleToggleAutoSend = async (enabled: boolean) => {
        setIsLoading(true)
        try {
            const updated = await updateBroadcastSettings({ auto_send_enabled: enabled })
            setSettings(updated)
            mutate("broadcast-settings")
            mutate("health-topic-stats")
        } catch (error) {
            console.error("Failed to toggle auto-send:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateInterval = async () => {
        setIsLoading(true)
        try {
            const updated = await updateBroadcastSettings({
                interval_value: settings.interval_value,
                interval_unit: settings.interval_unit
            })
            setSettings(updated)
            mutate("broadcast-settings")
        } catch (error) {
            console.error("Failed to update interval:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleManualBroadcast = async () => {
        if (!confirm("Send a health awareness message to all subscribed users now?")) return

        setIsSending(true)
        try {
            await triggerManualBroadcast()
            mutate("health-topic-stats")
            mutate("automated-broadcasts")
            alert("Broadcast sent successfully!")
        } catch (error) {
            console.error("Failed to send broadcast:", error)
            alert("Failed to send broadcast. Please try again.")
        } finally {
            setIsSending(false)
        }
    }

    const formatTimeAgo = (timestamp: string | null) => {
        if (!timestamp) return "Never"
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        return "Just now"
    }

    const formatTimeUntil = (timestamp: string | null) => {
        if (!timestamp) return "Not scheduled"
        const date = new Date(timestamp)
        const now = new Date()
        const diff = date.getTime() - now.getTime()

        if (diff < 0) return "Overdue"

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`
        if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`
        if (minutes > 0) return `In ${minutes} minute${minutes > 1 ? 's' : ''}`
        return "Very soon"
    }

    return (
        <NeoCard>
            <NeoCardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <NeoCardTitle>Broadcast Settings</NeoCardTitle>
                    </div>
                    <NeoBadge variant={settings.auto_send_enabled ? "success" : "secondary"}>
                        {settings.auto_send_enabled ? (
                            <>
                                <Power className="h-3 w-3 mr-1" />
                                Auto-Send ON
                            </>
                        ) : (
                            <>
                                <PowerOff className="h-3 w-3 mr-1" />
                                Auto-Send OFF
                            </>
                        )}
                    </NeoBadge>
                </div>
            </NeoCardHeader>
            <NeoCardContent className="space-y-6">
                {/* Auto-Send Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base font-semibold">Enable Auto-Send</Label>
                        <p className="text-sm text-muted-foreground">
                            Automatically send health awareness messages to all subscribed users
                        </p>
                    </div>
                    <Switch
                        checked={settings.auto_send_enabled}
                        onCheckedChange={handleToggleAutoSend}
                        disabled={isLoading}
                    />
                </div>

                {/* Interval Controls */}
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Broadcast Frequency</Label>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Label className="text-sm text-muted-foreground">Every</Label>
                            <NeoInput
                                type="number"
                                min="1"
                                max="999"
                                value={settings.interval_value || ""}
                                onChange={(e) => setSettings({ ...settings, interval_value: parseInt(e.target.value) || 1 })}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex-1">
                            <Label className="text-sm text-muted-foreground">Unit</Label>
                            <Select
                                value={settings.interval_unit}
                                onValueChange={(value) => setSettings({ ...settings, interval_unit: value })}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                    <SelectItem value="months">Months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <NeoButton
                        size="sm"
                        variant="outline"
                        onClick={handleUpdateInterval}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Frequency"
                        )}
                    </NeoButton>
                </div>

                {/* Status Display */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <p className="text-sm text-muted-foreground">Last Broadcast</p>
                        <p className="text-base font-semibold">{formatTimeAgo(settings.last_broadcast_at)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Next Broadcast</p>
                        <p className="text-base font-semibold">{formatTimeUntil(settings.next_broadcast_at)}</p>
                    </div>
                </div>

                {/* Manual Trigger */}
                <NeoButton
                    onClick={handleManualBroadcast}
                    disabled={isSending}
                    className="w-full"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Broadcast Now
                        </>
                    )}
                </NeoButton>
            </NeoCardContent>
        </NeoCard>
    )
}
