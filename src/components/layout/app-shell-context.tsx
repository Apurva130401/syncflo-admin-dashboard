'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type AppShellContextValue = {
  mobileOpen: boolean
  sidebarCollapsed: boolean
  openMobile: () => void
  closeMobile: () => void
  toggleMobile: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void
}

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined)

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const openMobile = useCallback(() => setMobileOpen(true), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), [])
  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), [])

  const value = useMemo(
    () => ({
      mobileOpen,
      sidebarCollapsed,
      openMobile,
      closeMobile,
      toggleMobile,
      toggleSidebar,
      setSidebarCollapsed
    }),
    [mobileOpen, sidebarCollapsed, openMobile, closeMobile, toggleMobile, toggleSidebar, setSidebarCollapsed]
  )

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

export function useAppShell() {
  const ctx = useContext(AppShellContext)
  if (!ctx) {
    throw new Error('useAppShell must be used within an AppShellProvider')
  }
  return ctx
}