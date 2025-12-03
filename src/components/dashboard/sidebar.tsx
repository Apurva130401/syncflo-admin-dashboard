'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getUserSubscriptionDetails } from '@/lib/supabase/queries'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Users,
  Activity,
  Settings,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare
} from 'lucide-react'

interface NavItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>; // Lucide icon component
  type: 'group' | 'single';
  children?: NavItem[];
}


const navigation: NavItem[] = [
  // Admin Dashboard
  { name: 'Admin Dashboard', type: 'group' },
  { name: 'Dashboard', href: '/dashboard', icon: Home, type: 'single' },

  // User Management
  { name: 'User Management', type: 'group' },
  { name: 'All Users', href: '/dashboard/users', icon: Users, type: 'single' },
  { name: 'User Activity', href: '/dashboard/activity', icon: Activity, type: 'single' },

  // Support
  { name: 'Support', type: 'group' },
  { name: 'Support Tickets', href: '/dashboard/support-tickets', icon: HelpCircle, type: 'single' },
  { name: 'Inquiries', href: '/dashboard/inquiries', icon: MessageSquare, type: 'single' },

  // System
  { name: 'System', type: 'group' },
  { name: 'System Monitoring', href: '/dashboard/monitoring', icon: BarChart3, type: 'single' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, type: 'single' }
]

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ className, isOpen, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [isDesktop, setIsDesktop] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [filteredNavigation, setFilteredNavigation] = useState(navigation)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }

  useEffect(() => {
    const fetchSubscriptionAndFilter = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const subscriptionResult = await getUserSubscriptionDetails(user.id)
          if (subscriptionResult.error) {
            console.error('Error fetching subscription details:', subscriptionResult.error)
            setFilteredNavigation(navigation.filter(item => item.name !== 'Voice' && item.name !== 'WhatsApp'))
            return
          }
          const subscriptionData = subscriptionResult.data
          if (subscriptionData && subscriptionData.subscription_status === 'active' && subscriptionData.current_plan) {
            const currentPlan = subscriptionData.current_plan.toLowerCase()
            const whatsappPlans = ['whatsapp-starter', 'whatsapp-growth']
            const voicePlans = ['voice-growth', 'voice-performance']
            const suitePlans = ['suite-starter', 'suite-growth']

            let filtered = navigation

            if (suitePlans.includes(currentPlan)) {
              // Show both Voice and WhatsApp
            } else if (whatsappPlans.includes(currentPlan)) {
              // Show only WhatsApp
              filtered = filtered.filter(item => item.name !== 'Voice')
            } else if (voicePlans.includes(currentPlan)) {
              // Show only Voice
              filtered = filtered.filter(item => item.name !== 'WhatsApp')
            } else {
              // Hide both
              filtered = filtered.filter(item => item.name !== 'Voice' && item.name !== 'WhatsApp')
            }
            setFilteredNavigation(filtered)
          } else {
            const filtered = navigation.filter(item => item.name !== 'Voice' && item.name !== 'WhatsApp')
            setFilteredNavigation(filtered)
          }
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error)
        setFilteredNavigation(navigation.filter(item => item.name !== 'Voice' && item.name !== 'WhatsApp'))
      }
    }

    fetchSubscriptionAndFilter()
  }, [])

  // Collapse Voice and WhatsApp sections by default
  useEffect(() => {
    setExpandedSections(new Set())
  }, [])


  const isItemActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true
    if (item.children) {
      return item.children.some((child: NavItem) => isItemActive(child))
    }
    return false
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.has(item.name)
    const isActive = isItemActive(item)
    const paddingLeft = level * 16 // 1rem per level

    // Render group header
    if (item.type === 'group' && !hasChildren) {
      const tourData = item.name === 'AI Products' ? 'ai-products' :
        item.name === 'Account & Support' ? 'settings' : undefined

      return (
        <motion.li
          key={item.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: level * 0.05 }}
          className="mb-2 mt-4 first:mt-0"
        >
          <div className={cn(
            "px-3 py-1 text-xs font-semibold text-white/60 uppercase tracking-wider",
            collapsed && "text-center"
          )}>
            {!collapsed && item.name}
          </div>
        </motion.li>
      )
    }

    if (item.type === 'single' || !hasChildren) {
      const itemTourData = item.name === 'Dashboard' ? 'dashboard' :
        item.name === 'Analytics' ? 'analytics' :
          item.name === 'Overview' && item.href === '/dashboard/voice' ? 'voice-overview' :
            item.name === 'Inbox' && item.href === '/dashboard/whatsapp/inbox' ? 'whatsapp-inbox' :
              item.name === 'Campaigns' && item.href?.includes('whatsapp') ? 'whatsapp-campaigns' :
                item.name === 'Campaigns' && item.href?.includes('voice') ? 'voice-campaigns' : undefined

      return (
        <motion.li
          key={item.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: level * 0.05 }}
          className="mb-1"
        >
          {item.href && item.href.startsWith('http') ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                "text-white/80 hover:text-white hover:bg-white/10",
                isActive && "bg-purple-500/20 text-purple-300 border-l-2 border-purple-400",
                collapsed && "justify-center px-2",
                level > 0 && `pl-${3 + level}`
              )}
              style={level > 0 ? { paddingLeft: `${12 + paddingLeft}px` } : undefined}
            >
              {item.icon && <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />}
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </a>
          ) : (
            <Link
              href={item.href || '#'}
              onClick={onClose}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                "text-white/80 hover:text-white hover:bg-white/10",
                isActive && "bg-purple-500/20 text-purple-300 border-l-2 border-purple-400",
                collapsed && "justify-center px-2",
                level > 0 && `pl-${3 + level}`
              )}
              style={level > 0 ? { paddingLeft: `${12 + paddingLeft}px` } : undefined}
            >
              {item.icon && <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />}
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          )}
        </motion.li>
      )
    }

    const sectionTourData = item.name === 'Voice' ? 'voice-section' :
      item.name === 'WhatsApp' ? 'whatsapp-section' : undefined

    return (
      <motion.li
        key={item.name}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: level * 0.05 }}
        className="mb-1"
      >
        <button
          onClick={() => toggleSection(item.name)}
          className={cn(
            "flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
            "text-white/80 hover:text-white hover:bg-white/10",
            isActive && "bg-purple-500/20 text-purple-300 border-l-2 border-purple-400",
            collapsed && "justify-center px-2"
          )}
          style={level > 0 ? { paddingLeft: `${12 + paddingLeft}px` } : undefined}
          aria-expanded={isExpanded}
          aria-controls={`submenu-${item.name}`}
        >
          {item.icon && <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />}
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{item.name}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 flex-shrink-0"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </>
          )}
        </button>
        <AnimatePresence>
          {isExpanded && !collapsed && (
            <motion.ul
              id={`submenu-${item.name}`}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="ml-4 space-y-1 overflow-hidden"
              role="menu"
            >
              {item.children?.map((child: NavItem) => renderNavItem(child, level + 1))}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.li>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "h-full flex flex-col bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-white/10",
          "fixed inset-y-0 left-0 z-50",
          isOpen ? "flex" : "hidden md:flex",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
        initial={{ width: collapsed ? 60 : 250, x: -250 }}
        animate={{
          width: collapsed ? 60 : 250,
          x: isOpen || isDesktop ? 0 : -250
        }}
        transition={{
          width: { duration: 0.4, ease: 'easeInOut' },
          x: { duration: 0.4, ease: 'easeInOut' }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image src="/logo.png" alt="SyncFlo AI Logo" width={24} height={24} className="w-6 h-6" />
              </div>
              <span className="text-white font-semibold text-lg">SyncFlo AI</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto">
              <Image src="/logo.png" alt="SyncFlo AI Logo" width={32} height={32} className="w-8 h-8" />
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 md:hidden"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => onToggleCollapse?.(!collapsed)}
            className="hidden md:block p-1 rounded-md hover:bg-white/10"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-white" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav>
            <ul className="space-y-1">
              {filteredNavigation.map((item) => renderNavItem(item))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/60 text-center">
            {!collapsed && "© 2024 SyncFlo AI"}
          </div>
        </div>
      </motion.aside>
    </>
  )
}