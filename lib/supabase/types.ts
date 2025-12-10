// Database types for WhatsApp Bot Admin Dashboard

export type UserStatus = "active" | "inactive" | "banned"
export type UserTag = "VIP" | "Staff" | "Blacklist"

export interface User {
  id: string
  phone: string
  name: string | null
  status: UserStatus
  tags: string[]
  messages_count: number
  last_active: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  sender: "user" | "bot"
  content: string
  intent: string | null
  is_handled: boolean
  created_at: string
}

export type ContactRole = "Admin" | "Health Worker" | "Supervisor" | "Support"

export interface SpecialContact {
  id: string
  name: string
  phone: string
  email: string | null
  role: ContactRole
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export type TrainingStatus = "active" | "needs_review" | "archived"

export interface TrainingData {
  id: string
  intent: string
  question: string
  answer: string
  added_by: string
  status: TrainingStatus
  created_at: string
  updated_at: string
}

export interface Intent {
  id: string
  name: string
  description: string | null
  color: string
  qa_count: number
  created_at: string
}

export interface Correction {
  id: string
  question: string
  wrong_answer: string
  correct_answer: string | null
  reported_by: string | null
  status: "pending" | "applied" | "dismissed"
  created_at: string
}

export type AdminRole = "Super Admin" | "Bot Trainer" | "Support Admin" | "Data Annotator"

export interface Admin {
  id: string
  auth_user_id: string | null
  name: string
  email: string
  role: AdminRole
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface BotSetting {
  id: string
  key: string
  value: string | null
  updated_by: string | null
  updated_at: string
}

export type LogActionType = "create" | "update" | "delete" | "login" | "export" | "broadcast" | "settings"

export interface SystemLog {
  id: string
  action: string
  action_type: LogActionType
  admin_name: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export type BroadcastTarget = "All Users" | "VIP Only" | "Active Users" | "Custom"
export type BroadcastStatus = "draft" | "scheduled" | "sent" | "failed"

export interface Broadcast {
  id: string
  title: string
  message: string
  target: BroadcastTarget
  target_count: number
  status: BroadcastStatus
  scheduled_at: string | null
  sent_at: string | null
  delivered_count: number
  read_count: number
  created_by: string | null
  created_at: string
}

// Stats types
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalMessages: number
  failedQueries: number
}
