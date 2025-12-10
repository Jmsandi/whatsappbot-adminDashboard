"use client"

import * as React from "react"
import { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardContent, NeoCardDescription } from "@/components/ui/neo-card"
import { NeoButton } from "@/components/ui/neo-button"
import { NeoBadge } from "@/components/ui/neo-badge"
import { NeoInput } from "@/components/ui/neo-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Save,
  RefreshCw,
  MessageCircle,
  Bot,
  Bell,
  Shield,
  Globe,
  Zap,
  Brain,
  Sparkles,
  Cpu,
  Settings2,
  AlertTriangle,
  ThermometerSun,
  Hash,
  Clock,
  Target,
  FileText,
  Wand2,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import useSWR, { mutate } from "swr"
import {
  getBotSettings,
  updateBotSettings,
  resetBotSettings,
} from "@/lib/actions/bot-settings"

export default function SettingsPage() {
  const [welcomeMessage, setWelcomeMessage] = React.useState(
    "Hello! I'm your AI assistant powered by advanced language models. How can I help you today?",
  )
  const [fallbackResponse, setFallbackResponse] = React.useState(
    "I'm not quite sure I understand. Let me connect you with a human agent who can better assist you.",
  )
  const [systemPrompt, setSystemPrompt] = React.useState(
    `You are a helpful WhatsApp assistant for [Company Name]. Your role is to:
- Answer customer questions accurately and helpfully
- Guide users through common processes
- Escalate complex issues to human agents when needed
- Always be polite, professional, and concise
- Never make up information - say "I don't know" if uncertain

Important rules:
- Keep responses under 300 words
- Use simple, clear language
- Ask clarifying questions when needed
- Respect user privacy`,
  )

  const [aiSettings, setAiSettings] = React.useState({
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    confidenceThreshold: 0.75,
    autoEscalateThreshold: 0.5,
    streamResponses: true,
    enableMemory: true,
    memoryWindow: 10,
  })

  const [features, setFeatures] = React.useState({
    autoReply: true,
    humanHandoff: true,
    multiLanguage: true,
    analytics: true,
    notifications: true,
    rateLimit: true,
    aiConfidenceCheck: true,
    sentimentAnalysis: true,
    intentDetection: true,
    contextAwareness: true,
  })

  const [showApiKey, setShowApiKey] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Fetch bot settings on mount
  const { data: botSettings, isLoading: settingsLoading } = useSWR(
    "bot-settings",
    getBotSettings,
    { refreshInterval: 30000 }
  )

  // Load settings into state when fetched
  React.useEffect(() => {
    if (botSettings) {
      // Load prompts from database
      setSystemPrompt(botSettings.system_prompt || "")
      setWelcomeMessage(botSettings.welcome_message || "")
      setFallbackResponse(botSettings.fallback_response || "")

      // Load AI settings from database
      setAiSettings(prev => ({
        ...prev,
        model: botSettings.ai_model || "gpt-4o",
        temperature: botSettings.temperature || 0.7,
        maxTokens: botSettings.max_tokens || 1024,
      }))
    }
  }, [botSettings])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await updateBotSettings({
        // Prompts
        system_prompt: systemPrompt,
        welcome_message: welcomeMessage,
        fallback_response: fallbackResponse,
        // AI Model
        ai_model: aiSettings.model,
        temperature: aiSettings.temperature,
        max_tokens: aiSettings.maxTokens,
        top_p: aiSettings.topP,
        frequency_penalty: aiSettings.frequencyPenalty,
        presence_penalty: aiSettings.presencePenalty,
        confidence_threshold: aiSettings.confidenceThreshold,
        auto_escalate_threshold: aiSettings.autoEscalateThreshold,
        stream_responses: aiSettings.streamResponses,
        enable_memory: aiSettings.enableMemory,
        memory_window: aiSettings.memoryWindow,
        // Features
        feature_auto_reply: features.autoReply,
        feature_human_handoff: features.humanHandoff,
        feature_multi_language: features.multiLanguage,
        feature_analytics: features.analytics,
        feature_notifications: features.notifications,
        feature_rate_limit: features.rateLimit,
        feature_ai_confidence_check: features.aiConfidenceCheck,
        feature_sentiment_analysis: features.sentimentAnalysis,
        feature_intent_detection: features.intentDetection,
        feature_context_awareness: features.contextAwareness,
      })
      mutate("bot-settings")
      alert("Settings saved successfully!")
    } catch (error) {
      alert("Failed to save settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSettings = async () => {
    if (!confirm("Are you sure you want to reset all settings to defaults?")) return

    setIsLoading(true)
    try {
      await resetBotSettings()
      mutate("bot-settings")
      alert("Settings reset to defaults successfully!")
    } catch (error) {
      alert("Failed to reset settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeatureToggle = (feature: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }))
  }

  const aiModels = [
    { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI", badge: "Recommended" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", badge: "Fast" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "OpenAI", badge: null },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic", badge: "Best Quality" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku", provider: "Anthropic", badge: "Fastest" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "Google", badge: null },
    { value: "llama-3.1-70b", label: "Llama 3.1 70B", provider: "Meta", badge: "Open Source" },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <Brain className="h-9 w-9 text-purple" />
            AI Bot Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure your AI-powered WhatsApp Bot</p>
        </div>
        <div className="flex items-center gap-4">
          <NeoButton variant="outline" onClick={handleResetSettings} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Reset to Default
          </NeoButton>
          <NeoButton
            className="bg-purple hover:bg-purple/90 text-white"
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </NeoButton>
        </div>
      </div>

      <Tabs defaultValue="ai-model" className="space-y-6">
        <TabsList className="border-4 border-foreground rounded-[1rem] p-1 bg-secondary">
          <TabsTrigger
            value="ai-model"
            className="rounded-[0.7rem] data-[state=active]:bg-purple data-[state=active]:text-white font-bold"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Model
          </TabsTrigger>
          <TabsTrigger
            value="prompts"
            className="rounded-[0.7rem] data-[state=active]:bg-purple data-[state=active]:text-white font-bold"
          >
            <FileText className="h-4 w-4 mr-2" />
            Prompts
          </TabsTrigger>
          <TabsTrigger
            value="behavior"
            className="rounded-[0.7rem] data-[state=active]:bg-purple data-[state=active]:text-white font-bold"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Behavior
          </TabsTrigger>
          <TabsTrigger
            value="features"
            className="rounded-[0.7rem] data-[state=active]:bg-purple data-[state=active]:text-white font-bold"
          >
            <Zap className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* AI Model Tab */}
        <TabsContent value="ai-model" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Model Selection */}
              <NeoCard className="border-purple">
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple" />
                    AI Model Selection
                  </NeoCardTitle>
                  <NeoCardDescription>Choose the language model powering your bot</NeoCardDescription>
                </NeoCardHeader>
                <NeoCardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiModels.map((model) => (
                      <button
                        key={model.value}
                        onClick={() => setAiSettings((prev) => ({ ...prev, model: model.value }))}
                        className={`p-4 rounded-[1rem] border-4 text-left transition-all ${aiSettings.model === model.value
                          ? "border-purple bg-purple/10 neo-shadow"
                          : "border-foreground/30 hover:border-foreground"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold">{model.label}</p>
                            <p className="text-xs text-muted-foreground">{model.provider}</p>
                          </div>
                          {model.badge && (
                            <NeoBadge
                              variant={model.badge === "Recommended" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {model.badge}
                            </NeoBadge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </NeoCardContent>
              </NeoCard>

              {/* Model Parameters */}
              <NeoCard>
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-orange" />
                    Model Parameters
                  </NeoCardTitle>
                  <NeoCardDescription>Fine-tune how your AI generates responses</NeoCardDescription>
                </NeoCardHeader>
                <NeoCardContent className="space-y-6">
                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="h-4 w-4 text-orange" />
                        <Label className="font-bold">Temperature</Label>
                      </div>
                      <span className="font-mono text-sm bg-secondary px-2 py-1 rounded-lg border-2 border-foreground">
                        {aiSettings.temperature.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[aiSettings.temperature]}
                      onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, temperature: value }))}
                      min={0}
                      max={2}
                      step={0.1}
                      className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground [&_[role=slider]]:bg-orange"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = more focused/deterministic, Higher = more creative/random
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-info" />
                        <Label className="font-bold">Max Tokens</Label>
                      </div>
                      <span className="font-mono text-sm bg-secondary px-2 py-1 rounded-lg border-2 border-foreground">
                        {aiSettings.maxTokens}
                      </span>
                    </div>
                    <Slider
                      value={[aiSettings.maxTokens]}
                      onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, maxTokens: value }))}
                      min={256}
                      max={4096}
                      step={128}
                      className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground [&_[role=slider]]:bg-info"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum length of generated responses (1 token ≈ 4 characters)
                    </p>
                  </div>

                  {/* Top P */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <Label className="font-bold">Top P (Nucleus Sampling)</Label>
                      </div>
                      <span className="font-mono text-sm bg-secondary px-2 py-1 rounded-lg border-2 border-foreground">
                        {aiSettings.topP.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[aiSettings.topP]}
                      onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, topP: value }))}
                      min={0}
                      max={1}
                      step={0.05}
                      className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground [&_[role=slider]]:bg-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls diversity via nucleus sampling (0.9 = top 90% probability mass)
                    </p>
                  </div>

                  {/* Frequency & Presence Penalty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold text-sm">Frequency Penalty</Label>
                        <span className="font-mono text-xs bg-secondary px-2 py-1 rounded-lg border-2 border-foreground">
                          {aiSettings.frequencyPenalty.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[aiSettings.frequencyPenalty]}
                        onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, frequencyPenalty: value }))}
                        min={0}
                        max={2}
                        step={0.1}
                        className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold text-sm">Presence Penalty</Label>
                        <span className="font-mono text-xs bg-secondary px-2 py-1 rounded-lg border-2 border-foreground">
                          {aiSettings.presencePenalty.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[aiSettings.presencePenalty]}
                        onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, presencePenalty: value }))}
                        min={0}
                        max={2}
                        step={0.1}
                        className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground"
                      />
                    </div>
                  </div>
                </NeoCardContent>
              </NeoCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Status */}
              <NeoCard className="border-primary">
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Status
                  </NeoCardTitle>
                </NeoCardHeader>
                <NeoCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Model</span>
                    <NeoBadge variant="default">{aiSettings.model}</NeoBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Status</span>
                    <NeoBadge variant="success">Active</NeoBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Avg Latency</span>
                    <span className="font-mono text-sm">~1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Today's Tokens</span>
                    <span className="font-mono text-sm">124.5k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Cost (Today)</span>
                    <span className="font-mono text-sm text-primary">$2.47</span>
                  </div>
                </NeoCardContent>
              </NeoCard>

              {/* Confidence Thresholds */}
              <NeoCard className="border-warning">
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Escalation Thresholds
                  </NeoCardTitle>
                </NeoCardHeader>
                <NeoCardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-sm">Confidence Threshold</Label>
                      <span className="font-mono text-xs bg-warning/20 text-warning px-2 py-1 rounded-lg border-2 border-warning">
                        {(aiSettings.confidenceThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[aiSettings.confidenceThreshold]}
                      onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, confidenceThreshold: value }))}
                      min={0.5}
                      max={0.95}
                      step={0.05}
                      className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground [&_[role=slider]]:bg-warning"
                    />
                    <p className="text-xs text-muted-foreground">Below this, bot asks for clarification</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-sm">Auto-Escalate Below</Label>
                      <span className="font-mono text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-lg border-2 border-destructive">
                        {(aiSettings.autoEscalateThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[aiSettings.autoEscalateThreshold]}
                      onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, autoEscalateThreshold: value }))}
                      min={0.2}
                      max={0.7}
                      step={0.05}
                      className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground [&_[role=slider]]:bg-destructive"
                    />
                    <p className="text-xs text-muted-foreground">Auto-escalate to human agent</p>
                  </div>
                </NeoCardContent>
              </NeoCard>

              {/* Memory Settings */}
              <NeoCard>
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Context Memory
                  </NeoCardTitle>
                </NeoCardHeader>
                <NeoCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Enable Memory</p>
                      <p className="text-xs text-muted-foreground">Remember conversation context</p>
                    </div>
                    <Switch
                      checked={aiSettings.enableMemory}
                      onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, enableMemory: checked }))}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  {aiSettings.enableMemory && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Memory Window</Label>
                        <span className="font-mono text-xs">{aiSettings.memoryWindow} messages</span>
                      </div>
                      <Slider
                        value={[aiSettings.memoryWindow]}
                        onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, memoryWindow: value }))}
                        min={5}
                        max={50}
                        step={5}
                        className="[&_[role=slider]]:border-4 [&_[role=slider]]:border-foreground"
                      />
                    </div>
                  )}
                </NeoCardContent>
              </NeoCard>
            </div>
          </div>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Prompt */}
            <NeoCard className="lg:col-span-2 border-purple">
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple" />
                  System Prompt
                </NeoCardTitle>
                <NeoCardDescription>Define your AI's personality, rules, and behavior</NeoCardDescription>
              </NeoCardHeader>
              <NeoCardContent>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[300px] font-mono text-sm border-4 border-foreground rounded-[1rem] neo-shadow-sm"
                  placeholder="Enter your system prompt..."
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    {systemPrompt.length} characters | ~{Math.ceil(systemPrompt.length / 4)} tokens
                  </p>
                  <div className="flex gap-2">
                    <NeoButton variant="outline" size="sm">
                      Load Template
                    </NeoButton>
                    <NeoButton variant="outline" size="sm">
                      Test Prompt
                    </NeoButton>
                  </div>
                </div>
              </NeoCardContent>
            </NeoCard>

            {/* Welcome Message */}
            <NeoCard>
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Welcome Message
                </NeoCardTitle>
                <NeoCardDescription>First message when user starts a chat</NeoCardDescription>
              </NeoCardHeader>
              <NeoCardContent>
                <Textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="min-h-[120px] border-4 border-foreground rounded-[1rem] neo-shadow-sm"
                />
              </NeoCardContent>
            </NeoCard>

            {/* Fallback Message */}
            <NeoCard>
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Low Confidence Response
                </NeoCardTitle>
                <NeoCardDescription>When AI is unsure about the answer</NeoCardDescription>
              </NeoCardHeader>
              <NeoCardContent>
                <Textarea
                  value={fallbackResponse}
                  onChange={(e) => setFallbackResponse(e.target.value)}
                  className="min-h-[120px] border-4 border-foreground rounded-[1rem] neo-shadow-sm"
                />
              </NeoCardContent>
            </NeoCard>

            {/* Escalation Message */}
            <NeoCard>
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-destructive" />
                  Escalation Message
                </NeoCardTitle>
                <NeoCardDescription>When conversation is escalated to human</NeoCardDescription>
              </NeoCardHeader>
              <NeoCardContent>
                <Textarea
                  defaultValue="I understand this needs special attention. I'm connecting you with a human agent who can better assist you. Please hold on for a moment."
                  className="min-h-[120px] border-4 border-foreground rounded-[1rem] neo-shadow-sm"
                />
              </NeoCardContent>
            </NeoCard>

            {/* Away Message */}
            <NeoCard>
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-info" />
                  Away Message
                </NeoCardTitle>
                <NeoCardDescription>Outside business hours response</NeoCardDescription>
              </NeoCardHeader>
              <NeoCardContent>
                <Textarea
                  defaultValue="Thank you for your message! Our team is currently offline. The AI assistant is still here to help with common questions, or a human agent will respond during business hours."
                  className="min-h-[120px] border-4 border-foreground rounded-[1rem] neo-shadow-sm"
                />
              </NeoCardContent>
            </NeoCard>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Response Style */}
              <NeoCard>
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Response Style
                  </NeoCardTitle>
                  <NeoCardDescription>Configure how your AI communicates</NeoCardDescription>
                </NeoCardHeader>
                <NeoCardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Tone</Label>
                      <Select defaultValue="friendly">
                        <SelectTrigger className="border-4 border-foreground rounded-[1rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="border-4 border-foreground rounded-[1rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Response Length</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="border-4 border-foreground rounded-[1rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Emoji Usage</Label>
                      <Select defaultValue="moderate">
                        <SelectTrigger className="border-4 border-foreground rounded-[1rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="frequent">Frequent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </NeoCardContent>
              </NeoCard>

              {/* Safety & Guardrails */}
              <NeoCard className="border-destructive">
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    Safety & Guardrails
                  </NeoCardTitle>
                  <NeoCardDescription>Protect users and your business</NeoCardDescription>
                </NeoCardHeader>
                <NeoCardContent className="space-y-4">
                  {[
                    {
                      key: "blockHarmful",
                      label: "Block Harmful Content",
                      desc: "Prevent responses with harmful or dangerous content",
                    },
                    {
                      key: "blockPII",
                      label: "Block PII Sharing",
                      desc: "Prevent bot from sharing personal identifiable information",
                    },
                    {
                      key: "blockFinancialAdvice",
                      label: "Block Financial Advice",
                      desc: "Escalate financial questions to humans",
                    },
                    {
                      key: "blockMedicalAdvice",
                      label: "Block Medical Advice",
                      desc: "Escalate health/medical questions to humans",
                    },
                    {
                      key: "blockLegalAdvice",
                      label: "Block Legal Advice",
                      desc: "Escalate legal questions to humans",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-[0.75rem] border-2 border-foreground bg-secondary"
                    >
                      <div>
                        <p className="font-bold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-destructive" />
                    </div>
                  ))}
                </NeoCardContent>
              </NeoCard>
            </div>

            {/* Bot Profile Sidebar */}
            <div className="space-y-6">
              <NeoCard>
                <NeoCardHeader>
                  <NeoCardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Bot Profile
                  </NeoCardTitle>
                </NeoCardHeader>
                <NeoCardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-foreground bg-gradient-to-br from-primary to-purple flex items-center justify-center neo-shadow">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <NeoButton variant="outline" size="sm">
                      Change
                    </NeoButton>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Bot Name</Label>
                    <NeoInput defaultValue="AI Assistant" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Status Text</Label>
                    <NeoInput defaultValue="Powered by AI • Always Online" />
                  </div>
                </NeoCardContent>
              </NeoCard>

              {/* Rate Limits */}
              <NeoCard>
                <NeoCardHeader>
                  <NeoCardTitle>Rate Limits</NeoCardTitle>
                </NeoCardHeader>
                <NeoCardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Messages per minute</Label>
                    <NeoInput type="number" defaultValue="20" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Messages per day (per user)</Label>
                    <NeoInput type="number" defaultValue="500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Cooldown after limit (seconds)</Label>
                    <NeoInput type="number" defaultValue="60" />
                  </div>
                </NeoCardContent>
              </NeoCard>
            </div>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: "autoReply" as const,
                label: "Auto Reply",
                description: "Automatically respond to messages",
                icon: MessageCircle,
                color: "bg-primary",
              },
              {
                key: "humanHandoff" as const,
                label: "Human Handoff",
                description: "Allow escalation to human agents",
                icon: Bot,
                color: "bg-orange",
              },
              {
                key: "multiLanguage" as const,
                label: "Multi-Language",
                description: "Auto-detect and respond in user's language",
                icon: Globe,
                color: "bg-info",
              },
              {
                key: "analytics" as const,
                label: "Analytics Tracking",
                description: "Track conversations and performance",
                icon: Zap,
                color: "bg-purple",
              },
              {
                key: "notifications" as const,
                label: "Admin Notifications",
                description: "Alert admins of important events",
                icon: Bell,
                color: "bg-warning",
              },
              {
                key: "rateLimit" as const,
                label: "Rate Limiting",
                description: "Prevent spam and abuse",
                icon: Shield,
                color: "bg-destructive",
              },
              {
                key: "aiConfidenceCheck" as const,
                label: "Confidence Checking",
                description: "Monitor AI response confidence",
                icon: Target,
                color: "bg-primary",
              },
              {
                key: "sentimentAnalysis" as const,
                label: "Sentiment Analysis",
                description: "Detect user emotions and mood",
                icon: Sparkles,
                color: "bg-pink-500",
              },
              {
                key: "intentDetection" as const,
                label: "Intent Detection",
                description: "Classify user message intents",
                icon: Brain,
                color: "bg-purple",
              },
              {
                key: "contextAwareness" as const,
                label: "Context Awareness",
                description: "Remember conversation history",
                icon: Clock,
                color: "bg-info",
              },
            ].map((feature) => (
              <NeoCard key={feature.key} className={features[feature.key] ? "border-primary" : ""}>
                <NeoCardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${feature.color} flex items-center justify-center border-2 border-foreground`}
                      >
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">{feature.label}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={features[feature.key]}
                      onCheckedChange={() => handleFeatureToggle(feature.key)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </NeoCardContent>
              </NeoCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
