"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ChartContainerProps {
  children: React.ReactNode
  height?: number
  className?: string
}

export function ChartContainer({ children, height = 300, className = "" }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Delay rendering to avoid ResizeObserver loop issues
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Suppress ResizeObserver loop errors - these are benign in chart contexts
    const resizeObserverError = (e: ErrorEvent) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
        e.stopImmediatePropagation()
      }
    }

    window.addEventListener("error", resizeObserverError)
    return () => window.removeEventListener("error", resizeObserverError)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    >
      {isReady && children}
    </div>
  )
}
