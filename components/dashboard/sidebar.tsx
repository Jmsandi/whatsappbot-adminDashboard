"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NeoButton } from "@/components/ui/neo-button"
import {
  Users,
  MessageSquare,
  Star,
  Brain,
  BarChart3,
  Settings,
  Shield,
  FileText,
  Radio,
  Menu,
  X,
  Moon,
  Sun,
  MessageCircle,
  AlertTriangle,
  Heart,
} from "lucide-react"
import { useTheme } from "next-themes"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/escalations", label: "Escalations", icon: AlertTriangle },
  { href: "/dashboard/health-topics", label: "Health Topics", icon: Heart },
  { href: "/dashboard/contacts", label: "Special Contacts", icon: Star },
  { href: "/dashboard/training", label: "Bot Training", icon: Brain },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Bot Settings", icon: Settings },
  { href: "/dashboard/admins", label: "Admin Accounts", icon: Shield },
  { href: "/dashboard/logs", label: "System Logs", icon: FileText },
  { href: "/dashboard/broadcast", label: "Broadcast Center", icon: Radio },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-[1rem] border-4 border-foreground bg-card neo-shadow-sm"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 border-r-4 border-foreground bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b-4 border-foreground">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-foreground bg-primary flex items-center justify-center neo-shadow-sm">
                <MessageCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Kai</h1>
                <p className="text-xs text-muted-foreground font-medium">Admin Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-[1rem] border-4 font-bold text-sm transition-all duration-200",
                    isActive
                      ? "border-foreground bg-primary text-primary-foreground neo-shadow-sm"
                      : "border-transparent hover:border-foreground hover:bg-accent hover:neo-shadow-sm",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Theme toggle */}
          <div className="p-4 border-t-4 border-foreground">
            {mounted && (
              <NeoButton
                variant="outline"
                className="w-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </NeoButton>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
