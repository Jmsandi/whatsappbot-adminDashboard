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
  Brain,
  MessageSquare,
  FileText,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  AlertTriangle,
  User,
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
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  getTrainingData,
  createTrainingData,
  deleteTrainingData,
  getIntents,
  getCorrections,
  applyCorrection,
  dismissCorrection,
} from "@/lib/actions/training"
import { createLog } from "@/lib/actions/logs"
import type { TrainingData, Intent, Correction } from "@/lib/supabase/types"
import useSWR, { mutate } from "swr"
import { botApi } from "@/lib/api/bot-client"

export default function TrainingPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [intentFilter, setIntentFilter] = React.useState("all")
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<string>("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const [newTraining, setNewTraining] = React.useState({
    intent: "",
    question: "",
    answer: "",
  })

  const {
    data: trainingData = [],
    error: trainingError,
    isLoading: trainingLoading,
  } = useSWR("trainingData", () => getTrainingData())
  const { data: intents = [], error: intentsError } = useSWR("intents", getIntents)
  const { data: corrections = [], error: correctionsError } = useSWR("corrections", getCorrections)

  const filteredData = React.useMemo(() => {
    return trainingData.filter((data: TrainingData) => {
      const matchesSearch =
        data.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.answer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesIntent = intentFilter === "all" || data.intent === intentFilter
      return matchesSearch && matchesIntent
    })
  }, [trainingData, searchQuery, intentFilter])

  const handleCreateTraining = async () => {
    if (!newTraining.intent || !newTraining.question || !newTraining.answer) return
    setIsLoading(true)
    try {
      await createTrainingData({
        intent: newTraining.intent,
        question: newTraining.question,
        answer: newTraining.answer,
        added_by: "Current Admin",
      })
      await createLog({
        action: `Training data added: ${newTraining.intent}`,
        action_type: "create",
        admin_name: "Current Admin",
        details: { intent: newTraining.intent, question: newTraining.question },
      })
      mutate("trainingData")
      mutate("intents")
      setIsAddDialogOpen(false)
      setNewTraining({ intent: "", question: "", answer: "" })
    } catch (error) {
      console.error("Failed to create training data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTraining = async (data: TrainingData) => {
    if (!confirm("Are you sure you want to delete this training data?")) return
    setIsLoading(true)
    try {
      await deleteTrainingData(data.id)
      await createLog({
        action: `Training data deleted: ${data.intent}`,
        action_type: "delete",
        admin_name: "Current Admin",
        details: { training_id: data.id },
      })
      mutate("trainingData")
      mutate("intents")
    } catch (error) {
      console.error("Failed to delete training data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyCorrection = async (correction: Correction) => {
    if (!correction.correct_answer) return
    setIsLoading(true)
    try {
      await applyCorrection(correction.id, correction.correct_answer)
      await createLog({
        action: `Correction applied: ${correction.question}`,
        action_type: "update",
        admin_name: "Current Admin",
        details: { correction_id: correction.id },
      })
      mutate("corrections")
    } catch (error) {
      console.error("Failed to apply correction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismissCorrection = async (correction: Correction) => {
    setIsLoading(true)
    try {
      await dismissCorrection(correction.id)
      mutate("corrections")
    } catch (error) {
      console.error("Failed to dismiss correction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadProgress("Please select a file first")
      return
    }

    setIsLoading(true)
    setUploadProgress("Uploading file to bot...")

    try {
      // Upload file to bot's ingest API
      const response = await botApi.ingestFile(selectedFile, {
        description: `Training data uploaded from dashboard: ${selectedFile.name}`,
      })

      if (response.success) {
        setUploadProgress(`✅ File uploaded successfully! Job ID: ${response.jobId}`)

        // Log the upload
        await createLog({
          action: `Training file uploaded: ${selectedFile.name}`,
          action_type: "create",
          admin_name: "Current Admin",
          details: {
            filename: selectedFile.name,
            jobId: response.jobId,
            size: selectedFile.size,
          },
        })

        // Wait a moment then close dialog
        setTimeout(() => {
          setIsUploadDialogOpen(false)
          setSelectedFile(null)
          setUploadProgress("")
          mutate("trainingData")
        }, 2000)
      } else {
        setUploadProgress(`❌ Upload failed: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("File upload failed:", error)
      setUploadProgress(`❌ Upload failed: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadProgress(`Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
    }
  }

  if (trainingError || intentsError || correctionsError) {
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
          <h1 className="text-3xl lg:text-4xl font-bold">Bot Training Data</h1>
          <p className="text-muted-foreground mt-1">Manage Q/A pairs, intents, and training samples</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <NeoButton variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </NeoButton>
            </DialogTrigger>
            <DialogContent className="border-4 border-foreground rounded-[1rem] neo-shadow">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Upload Training Data</DialogTitle>
                <DialogDescription>
                  Upload a PDF, TXT, CSV, or JSON file to train the bot
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="border-4 border-dashed border-foreground rounded-[1rem] p-8 text-center hover:bg-accent transition-colors">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.txt,.csv,.json"
                    onChange={handleFileSelect}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  >
                    {selectedFile ? selectedFile.name : "Click to select file"}
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: PDF, TXT, CSV, JSON (Max 10MB)
                  </p>
                </div>

                {uploadProgress && (
                  <div className="p-4 rounded-lg bg-muted border-2 border-foreground">
                    <p className="text-sm font-medium">{uploadProgress}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <NeoButton
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false)
                    setSelectedFile(null)
                    setUploadProgress("")
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </NeoButton>
                <NeoButton onClick={handleFileUpload} disabled={isLoading || !selectedFile}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload and Train
                    </>
                  )}
                </NeoButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <NeoButton>
                <Plus className="h-4 w-4 mr-2" />
                Add Q/A Pair
              </NeoButton>
            </DialogTrigger>
            <DialogContent className="border-4 border-foreground rounded-[1rem] neo-shadow">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add Training Data</DialogTitle>
                <DialogDescription>Add a new question and answer pair</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-bold">Intent</Label>
                  <NeoSelect
                    value={newTraining.intent}
                    onValueChange={(v) => setNewTraining((prev) => ({ ...prev, intent: v }))}
                  >
                    <NeoSelectTrigger>
                      <NeoSelectValue placeholder="Select intent" />
                    </NeoSelectTrigger>
                    <NeoSelectContent>
                      {intents.map((intent: Intent) => (
                        <NeoSelectItem key={intent.name} value={intent.name}>
                          {intent.name}
                        </NeoSelectItem>
                      ))}
                    </NeoSelectContent>
                  </NeoSelect>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Question / User Input</Label>
                  <Textarea
                    placeholder="Enter the user's question or message..."
                    className="min-h-[80px] border-4 border-foreground rounded-[1rem] neo-shadow-sm"
                    value={newTraining.question}
                    onChange={(e) => setNewTraining((prev) => ({ ...prev, question: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Bot Response</Label>
                  <Textarea
                    placeholder="Enter the bot's response..."
                    className="min-h-[100px] border-4 border-foreground rounded-[1rem] neo-shadow-sm"
                    value={newTraining.answer}
                    onChange={(e) => setNewTraining((prev) => ({ ...prev, answer: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <NeoButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </NeoButton>
                <NeoButton onClick={handleCreateTraining} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Training Data
                </NeoButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats - Using real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-secondary flex items-center justify-center">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trainingData.length}</p>
              <p className="text-xs text-muted-foreground font-bold">Total Q/A Pairs</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-success/20 flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{intents.length}</p>
              <p className="text-xs text-muted-foreground font-bold">Intents</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{corrections.length}</p>
              <p className="text-xs text-muted-foreground font-bold">Corrections Needed</p>
            </div>
          </NeoCardContent>
        </NeoCard>
        <NeoCard hover>
          <NeoCardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-secondary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{intents.reduce((acc: number, i: Intent) => acc + i.qa_count, 0)}</p>
              <p className="text-xs text-muted-foreground font-bold">Total Entries</p>
            </div>
          </NeoCardContent>
        </NeoCard>
      </div>

      <Tabs defaultValue="qa" className="space-y-6">
        <TabsList className="border-4 border-foreground rounded-[1rem] p-1 bg-secondary">
          <TabsTrigger
            value="qa"
            className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Q/A Pairs
          </TabsTrigger>
          <TabsTrigger
            value="intents"
            className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Intents
          </TabsTrigger>
          <TabsTrigger
            value="corrections"
            className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Corrections
          </TabsTrigger>
        </TabsList>

        {/* Q/A Pairs Tab */}
        <TabsContent value="qa" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <NeoInput
                placeholder="Search Q/A pairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <NeoSelect value={intentFilter} onValueChange={setIntentFilter}>
              <NeoSelectTrigger className="w-full sm:w-48">
                <NeoSelectValue placeholder="Filter by intent" />
              </NeoSelectTrigger>
              <NeoSelectContent>
                <NeoSelectItem value="all">All Intents</NeoSelectItem>
                {intents.map((intent: Intent) => (
                  <NeoSelectItem key={intent.name} value={intent.name}>
                    {intent.name}
                  </NeoSelectItem>
                ))}
              </NeoSelectContent>
            </NeoSelect>
          </div>

          {trainingLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((data: TrainingData) => (
                <NeoCard key={data.id} hover className="cursor-pointer">
                  <NeoCardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <NeoBadge variant="outline">{data.intent}</NeoBadge>
                          {data.status === "needs_review" && <NeoBadge variant="warning">Needs Review</NeoBadge>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-muted-foreground mb-1">Question:</p>
                          <p className="font-medium">{data.question}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-muted-foreground mb-1">Answer:</p>
                          <p className="text-muted-foreground">{data.answer}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {data.added_by}
                          </span>
                          <span>{new Date(data.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <NeoButton variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </NeoButton>
                        <NeoButton
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteTraining(data)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </NeoButton>
                      </div>
                    </div>
                  </NeoCardContent>
                </NeoCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Intents Tab */}
        <TabsContent value="intents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intents.map((intent: Intent) => (
              <NeoCard key={intent.name} hover>
                <NeoCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-4 h-4 rounded-full ${intent.color}`} />
                    <NeoButton variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </NeoButton>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{intent.name}</h3>
                  <p className="text-3xl font-bold text-muted-foreground">{intent.qa_count}</p>
                  <p className="text-sm text-muted-foreground">Q/A pairs</p>
                </NeoCardContent>
              </NeoCard>
            ))}
            <NeoCard hover className="border-dashed cursor-pointer">
              <NeoCardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
                <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="font-bold text-muted-foreground">Add New Intent</p>
              </NeoCardContent>
            </NeoCard>
          </div>
        </TabsContent>

        {/* Corrections Tab */}
        <TabsContent value="corrections" className="space-y-6">
          <div className="space-y-4">
            {corrections.length === 0 ? (
              <NeoCard>
                <NeoCardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <h2 className="text-xl font-bold mb-2">No corrections needed</h2>
                  <p className="text-muted-foreground">All training data is up to date.</p>
                </NeoCardContent>
              </NeoCard>
            ) : (
              corrections.map((item: Correction) => (
                <NeoCard key={item.id}>
                  <NeoCardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full border-4 border-destructive bg-destructive/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="text-sm font-bold text-muted-foreground mb-1">Question:</p>
                          <p className="font-medium">{item.question}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-[1rem] border-2 border-destructive bg-destructive/10">
                            <p className="text-xs font-bold text-destructive mb-2">Wrong Answer:</p>
                            <p className="text-sm">{item.wrong_answer}</p>
                          </div>
                          <div className="p-4 rounded-[1rem] border-2 border-success bg-success/10">
                            <p className="text-xs font-bold text-success mb-2">Correct Answer:</p>
                            <p className="text-sm">{item.correct_answer || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-muted-foreground">
                            Reported by <span className="font-mono">{item.reported_by}</span> on{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <NeoButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissCorrection(item)}
                              disabled={isLoading}
                            >
                              Dismiss
                            </NeoButton>
                            <NeoButton
                              size="sm"
                              onClick={() => handleApplyCorrection(item)}
                              disabled={isLoading || !item.correct_answer}
                            >
                              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Apply Correction
                            </NeoButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NeoCardContent>
                </NeoCard>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div >
  )
}
