'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Users,
    Building2,
    Mail,
    Phone,
    Search,
    SlidersHorizontal,
    RefreshCw,
    AlertCircle,
    ArrowUpDown,
    X,
    UserCheck,
    Briefcase,
    Globe,
    ExternalLink,
    Linkedin,
    GripVertical,
    MapPin,
    Calendar,
    User
} from 'lucide-react'

// Default initial visible columns
const DEFAULT_VISIBLE_COLUMNS = ['name', 'email', 'phone', 'company', 'jobTitle', 'city', 'createdAt']

// localStorage key for persisting column preferences
const LS_VISIBLE_COLUMNS_KEY = 'crm_visible_columns'
const LS_COLUMN_ORDER_KEY = 'crm_column_order'

function loadSavedColumns(): string[] | null {
    try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(LS_VISIBLE_COLUMNS_KEY) : null
        if (!saved) return null
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[]
    } catch { /* ignore */ }
    return null
}

function saveColumns(columns: string[]) {
    try {
        localStorage.setItem(LS_VISIBLE_COLUMNS_KEY, JSON.stringify(columns))
    } catch { /* ignore */ }
}

// Column title formatter
const formatColumnTitle = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
}

// Utility to parse links if stringified or object
function parseLinkCell(val: any): { url: string; label: string } | null {
    if (!val) return null
    if (typeof val === 'object' && val.__isLink) {
        const url = (val.url || '').trim()
        const label = (val.label || url).trim()
        return { url, label }
    }
    if (typeof val === 'string') {
        const trimmed = val.trim()
        if (trimmed.startsWith('{')) {
            try {
                const parsed = JSON.parse(trimmed)
                const url = (parsed.primaryLinkUrl || parsed.url || '').trim()
                const label = (parsed.primaryLinkLabel || parsed.label || url).trim()
                return { url, label }
            } catch {
                return null
            }
        } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || (trimmed.includes('.') && !trimmed.includes(' '))) {
            const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
            const label = trimmed.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
            return { url, label }
        }
    }
    return null
}

// Parse pipeline status from raw array string like ["NEW"] or ["FIRST_EMAIL_SENT"]
function parsePipelineStatus(val: any): string[] | null {
    if (!val) return null
    const str = typeof val === 'string' ? val.trim() : String(val).trim()
    if (str.startsWith('[')) {
        try {
            const parsed = JSON.parse(str)
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((s: any) => String(s).trim()).filter(Boolean)
            }
        } catch { /* not JSON array */ }
    }
    if (str && !str.startsWith('{') && str !== '—' && str !== '') return [str]
    return null
}

const STATUS_COLORS: Record<string, string> = {
    NEW:                'bg-slate-100 text-slate-700 border-slate-300',
    FIRST_EMAIL_SENT:   'bg-amber-50 text-amber-700 border-amber-300',
    FOLLOW_UP_SENT:     'bg-orange-50 text-orange-700 border-orange-300',
    MEETING_BOOKED:     'bg-emerald-50 text-emerald-700 border-emerald-300',
    MEETING_DONE:       'bg-teal-50 text-teal-700 border-teal-300',
    PROPOSAL_SENT:      'bg-violet-50 text-violet-700 border-violet-300',
    NEGOTIATION:        'bg-rose-50 text-rose-700 border-rose-300',
    WON:                'bg-green-100 text-green-800 border-green-400',
    LOST:               'bg-red-100 text-red-700 border-red-300',
    QUALIFIED:          'bg-sky-50 text-sky-700 border-sky-300',
    UNQUALIFIED:        'bg-zinc-100 text-zinc-600 border-zinc-300',
    CONTACTED:          'bg-yellow-50 text-yellow-700 border-yellow-300',
    IN_PROGRESS:        'bg-purple-50 text-purple-700 border-purple-300',
    CLOSED:             'bg-gray-100 text-gray-600 border-gray-300',
    OPEN:               'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING:            'bg-amber-50 text-amber-700 border-amber-200',
}

function getStatusColor(status: string): string {
    const key = status.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
    return STATUS_COLORS[key] || 'bg-slate-100 text-slate-600 border-slate-200'
}

function formatStatusLabel(status: string): string {
    return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase())
}

// Parse verification value like ["YES"], ["NOT_VERIFIED"], "true", etc.
function parseVerificationStatus(val: any): 'verified' | 'not_verified' | null {
    if (!val) return null
    const raw = typeof val === 'string' ? val.trim() : String(val).trim()
    // Strip array brackets and quotes: ["YES"] → YES
    const inner = raw.replace(/^\["?|"?\]$/g, '').toUpperCase().trim()
    if (['YES', 'TRUE', 'VERIFIED', '1'].includes(inner)) return 'verified'
    if (['NO', 'FALSE', 'NOT_VERIFIED', 'UNVERIFIED', '0', 'NOT VERIFIED'].includes(inner)) return 'not_verified'
    return null
}

export default function CRMPage() {
    const [people, setPeople] = useState<any[]>([])
    const [allColumns, setAllColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS)
    // Initialize from localStorage if available, otherwise use defaults
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        return loadSavedColumns() ?? DEFAULT_VISIBLE_COLUMNS
    })
    const [loading, setLoading] = useState(true)
    const [warningMessage, setWarningMessage] = useState<string | null>(null)
    const [globalSearch, setGlobalSearch] = useState('')
    const [selectedPerson, setSelectedPerson] = useState<any | null>(null)
    
    // Refs for synced sticky horizontal scrollbar
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const stickyScrollbarRef = useRef<HTMLDivElement>(null)
    const [scrollContentWidth, setScrollContentWidth] = useState(0)

    // Drag and Drop column state
    const [draggedColKey, setDraggedColKey] = useState<string | null>(null)
    const [dragOverColKey, setDragOverColKey] = useState<string | null>(null)
    
    // Column dropdown Popover open state
    const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)
    
    // Individual column dropdown filter values: { [colKey]: selectedValue }
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
    
    // Sorting state
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
        key: 'name',
        direction: 'asc'
    })

    const fetchPeople = async () => {
        setLoading(true)
        setWarningMessage(null)
        try {
            const res = await fetch('/api/admin/people')
            if (res.ok) {
                const data = await res.json()
                const fetchedPeople = data.people || []
                const fetchedCols = data.columns || DEFAULT_VISIBLE_COLUMNS

                setPeople(fetchedPeople)
                
                const mergedCols = Array.from(new Set([...DEFAULT_VISIBLE_COLUMNS, ...fetchedCols]))
                setAllColumns(mergedCols)

                if (data.warning) {
                    setWarningMessage(data.warning)
                }
            } else {
                setWarningMessage('Could not load data from Twenty CRM API.')
            }
        } catch (e: any) {
            console.error(e)
            setWarningMessage('Network error when fetching Twenty CRM people.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPeople()
    }, [])

    // Persist visibleColumns to localStorage whenever it changes
    useEffect(() => {
        saveColumns(visibleColumns)
    }, [visibleColumns])

    // Sync sticky horizontal scrollbar with main table container
    useEffect(() => {
        if (loading) return

        // Give React time to mount the stickyScrollbarRef (it's conditionally rendered)
        const setup = () => {
            const tableEl = tableContainerRef.current
            const scrollEl = stickyScrollbarRef.current
            if (!tableEl || !scrollEl) return

            // The shadcn <Table> component renders its own inner wrapper
            // (data-slot="table-container") with overflow-x-auto — that's the
            // element that actually scrolls horizontally. tableContainerRef
            // only handles vertical scrolling, so we need to reach inside it.
            const innerScrollEl = tableEl.querySelector<HTMLDivElement>('[data-slot="table-container"]')
            if (!innerScrollEl) return

            // Hide the inner element's native horizontal scrollbar — our
            // pinned bottom bar replaces it visually.
            innerScrollEl.classList.add('scrollbar-hide')

            const updateWidth = () => {
                const w = innerScrollEl.scrollWidth
                if (w > 0) setScrollContentWidth(w)
            }

            updateWidth()
            // Retry once more after a short delay to catch any late layout shifts
            const retryTimer = setTimeout(updateWidth, 300)
            window.addEventListener('resize', updateWidth)

            let isSyncingTable = false
            let isSyncingScroll = false

            const handleTableScroll = () => {
                if (isSyncingTable) { isSyncingTable = false; return }
                isSyncingScroll = true
                scrollEl.scrollLeft = innerScrollEl.scrollLeft
            }

            const handleStickyScroll = () => {
                if (isSyncingScroll) { isSyncingScroll = false; return }
                isSyncingTable = true
                innerScrollEl.scrollLeft = scrollEl.scrollLeft
            }

            innerScrollEl.addEventListener('scroll', handleTableScroll)
            scrollEl.addEventListener('scroll', handleStickyScroll)

            return () => {
                clearTimeout(retryTimer)
                window.removeEventListener('resize', updateWidth)
                innerScrollEl.removeEventListener('scroll', handleTableScroll)
                scrollEl.removeEventListener('scroll', handleStickyScroll)
            }
        }

        const initTimer = setTimeout(setup, 50)
        return () => clearTimeout(initTimer)
    }, [visibleColumns, people, loading])

    // Column Filter Handlers
    const handleColumnFilterChange = (colKey: string, value: string) => {
        setColumnFilters(prev => {
            if (!value || value === '__ALL__') {
                const next = { ...prev }
                delete next[colKey]
                return next
            }
            return { ...prev, [colKey]: value }
        })
    }

    const clearAllFilters = () => {
        setColumnFilters({})
        setGlobalSearch('')
    }

    // Toggle single column visibility
    const toggleColumnVisibility = (colKey: string) => {
        setVisibleColumns(prev => {
            if (prev.includes(colKey)) {
                if (prev.length <= 1) return prev // Keep at least 1 column
                return prev.filter(c => c !== colKey)
            } else {
                return [...prev, colKey]
            }
        })
    }

    const selectAllColumns = () => setVisibleColumns([...allColumns])
    const resetColumnsToDefault = () => setVisibleColumns([...DEFAULT_VISIBLE_COLUMNS])

    // Drag and Drop Column Handlers
    const handleDragStart = (e: React.DragEvent, colKey: string) => {
        if (colKey === 'name') {
            e.preventDefault()
            return
        }
        setDraggedColKey(colKey)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', colKey)
    }

    const handleDragOver = (e: React.DragEvent, colKey: string) => {
        if (colKey === 'name' || !draggedColKey || draggedColKey === colKey) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverColKey(colKey)
    }

    const handleDragLeave = () => {
        setDragOverColKey(null)
    }

    const handleDrop = (e: React.DragEvent, targetColKey: string) => {
        e.preventDefault()
        if (targetColKey === 'name' || !draggedColKey || draggedColKey === targetColKey) {
            setDraggedColKey(null)
            setDragOverColKey(null)
            return
        }

        setVisibleColumns(prev => {
            const next = [...prev]
            const sourceIdx = next.indexOf(draggedColKey)
            const targetIdx = next.indexOf(targetColKey)
            if (sourceIdx !== -1 && targetIdx !== -1) {
                next.splice(sourceIdx, 1)
                next.splice(targetIdx, 0, draggedColKey)
            }
            return next
        })

        setDraggedColKey(null)
        setDragOverColKey(null)
    }

    // Sorting Handler
    const handleSort = (colKey: string) => {
        setSortConfig(current => {
            if (!current || current.key !== colKey) {
                return { key: colKey, direction: 'asc' }
            }
            if (current.direction === 'asc') {
                return { key: colKey, direction: 'desc' }
            }
            return null
        })
    }

    // Extract unique values for each column's dropdown filter
    const getUniqueColumnValues = (colKey: string): string[] => {
        const valuesSet = new Set<string>()
        people.forEach(p => {
            const rawVal = p[colKey]
            if (!rawVal) return
            
            const parsedLink = parseLinkCell(rawVal)
            if (parsedLink) {
                if (parsedLink.label) valuesSet.add(parsedLink.label)
            } else if (typeof rawVal === 'string' && rawVal.trim() !== '' && rawVal !== '—') {
                valuesSet.add(rawVal.trim())
            }
        })
        return Array.from(valuesSet).sort()
    }

    // Filtered & Sorted People computation
    const filteredPeople = useMemo(() => {
        return people.filter(person => {
            // 1. Global Search Filter
            if (globalSearch.trim() !== '') {
                const query = globalSearch.toLowerCase()
                const matchesGlobal = Object.values(person).some(val => {
                    if (!val) return false
                    const link = parseLinkCell(val)
                    if (link) {
                        return link.label.toLowerCase().includes(query) || link.url.toLowerCase().includes(query)
                    }
                    return String(val).toLowerCase().includes(query)
                })
                if (!matchesGlobal) return false
            }

            // 2. Individual Dropdown Column Filters
            for (const [colKey, filterVal] of Object.entries(columnFilters)) {
                if (!filterVal || filterVal === '__ALL__') continue
                const cellVal = person[colKey]
                if (!cellVal) return false

                const link = parseLinkCell(cellVal)
                const strVal = link ? (link.label || link.url) : String(cellVal)
                if (strVal.toLowerCase() !== filterVal.toLowerCase()) {
                    return false
                }
            }

            return true
        }).sort((a, b) => {
            if (!sortConfig) return 0
            const { key, direction } = sortConfig
            const linkA = parseLinkCell(a[key])
            const linkB = parseLinkCell(b[key])
            const valA = linkA ? linkA.label.toLowerCase() : (a[key] !== null && a[key] !== undefined ? String(a[key]).toLowerCase() : '')
            const valB = linkB ? linkB.label.toLowerCase() : (b[key] !== null && b[key] !== undefined ? String(b[key]).toLowerCase() : '')

            if (valA < valB) return direction === 'asc' ? -1 : 1
            if (valA > valB) return direction === 'asc' ? 1 : -1
            return 0
        })
    }, [people, globalSearch, columnFilters, sortConfig])

    // Calculated Metric Stats
    const totalPeople = people.length
    const uniqueCompanies = useMemo(() => new Set(people.map(p => p.company).filter(Boolean)).size, [people])
    const validEmails = useMemo(() => people.filter(p => p.email && p.email.includes('@')).length, [people])
    const activeContacts = useMemo(() => people.filter(p => p.phone || p.email).length, [people])

    const hasActiveFilters = globalSearch.trim() !== '' || Object.keys(columnFilters).length > 0

    return (
        <>
        <div className="flex flex-col h-[calc(100vh-115px)] min-h-[500px] overflow-hidden space-y-2.5">
            {/* Header & Metric Cards */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">People</h1>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-0.5 font-semibold">
                            Twenty CRM
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Manage contacts and view people records synced from Twenty CRM.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Card className="p-2 flex items-center gap-2 shadow-sm border border-slate-200/80 bg-white">
                        <div className="p-1.5 bg-emerald-100/70 text-emerald-700 rounded-lg">
                            <Users className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-medium">Total People</p>
                            <p className="text-xs font-bold text-slate-900">{totalPeople}</p>
                        </div>
                    </Card>

                    <Card className="p-2 flex items-center gap-2 shadow-sm border border-slate-200/80 bg-white">
                        <div className="p-1.5 bg-amber-100/70 text-amber-700 rounded-lg">
                            <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-medium">Companies</p>
                            <p className="text-xs font-bold text-slate-900">{uniqueCompanies}</p>
                        </div>
                    </Card>

                    <Card className="p-2 flex items-center gap-2 shadow-sm border border-slate-200/80 bg-white">
                        <div className="p-1.5 bg-violet-100/70 text-violet-700 rounded-lg">
                            <Mail className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-medium">Valid Emails</p>
                            <p className="text-xs font-bold text-slate-900">{validEmails}</p>
                        </div>
                    </Card>

                    <Card className="p-2 flex items-center gap-2 shadow-sm border border-slate-200/80 bg-white">
                        <div className="p-1.5 bg-rose-100/70 text-rose-700 rounded-lg">
                            <UserCheck className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-medium">Active Contacts</p>
                            <p className="text-xs font-bold text-slate-900">{activeContacts}</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Connection Warning Banner if any */}
            {warningMessage && (
                <div className="flex items-center gap-3 p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs shrink-0 shadow-sm">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <div className="flex-1 font-medium">{warningMessage}</div>
                    <Button variant="outline" size="sm" onClick={fetchPeople} className="h-6 text-xs border-amber-300 hover:bg-amber-100 text-amber-900">
                        <RefreshCw className="h-3 w-3 mr-1" /> Retry
                    </Button>
                </div>
            )}

            {/* Action Bar & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                {/* Global Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        placeholder="Global search across all columns..."
                        className="pl-8 bg-white border-slate-200 h-8 text-xs"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                    {globalSearch && (
                        <button
                            onClick={() => setGlobalSearch('')}
                            className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Right Side Buttons: Hide/View Columns Popover & Clear Filters & Refresh */}
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                            <X className="h-3 w-3 mr-1" /> Clear Filters
                        </Button>
                    )}

                    {/* Column Visibility Popover - 100% Solid Opaque Background */}
                    <Popover open={columnPopoverOpen} onOpenChange={setColumnPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs">
                                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                Columns ({visibleColumns.length}/{allColumns.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-64 p-3 shadow-2xl border border-slate-200 bg-white opacity-100 z-50">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Toggle Visible Columns</span>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600" onClick={() => setColumnPopoverOpen(false)}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="py-2 flex gap-2 border-b border-slate-100">
                                <Button variant="outline" size="sm" className="h-7 text-[11px] flex-1 px-2 border-slate-200 bg-white" onClick={selectAllColumns}>
                                    Show All
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] flex-1 px-2 border-slate-200 bg-white text-slate-600" onClick={resetColumnsToDefault}>
                                    Reset
                                </Button>
                            </div>

                            <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5 pr-1 bg-white">
                                {allColumns.map(colKey => {
                                    const isChecked = visibleColumns.includes(colKey)
                                    return (
                                        <div
                                            key={colKey}
                                            onClick={() => toggleColumnVisibility(colKey)}
                                            className="flex items-center space-x-2.5 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox
                                                id={`col-${colKey}`}
                                                checked={isChecked}
                                                onCheckedChange={() => toggleColumnVisibility(colKey)}
                                            />
                                            <label
                                                htmlFor={`col-${colKey}`}
                                                className="text-xs font-semibold text-slate-700 capitalize cursor-pointer flex-1 select-none"
                                            >
                                                {formatColumnTitle(colKey)}
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="pt-2.5 mt-2 border-t border-slate-100">
                                <Button size="sm" className="w-full h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setColumnPopoverOpen(false)}>
                                    Done
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Refresh Button */}
                    <Button variant="outline" size="sm" onClick={fetchPeople} disabled={loading} className="h-7 border-slate-200 bg-white">
                        <RefreshCw className={`h-3.5 w-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* People Data Table Container */}
            <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-12 text-slate-400">
                        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
                        <p className="text-sm font-medium text-slate-600">Fetching people from Twenty CRM...</p>
                    </div>
                ) : (
                    <>
                        <div
                            ref={tableContainerRef}
                            className="flex-1 overflow-x-hidden overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent"
                        >
                            <Table className="relative border-collapse min-w-full">
                                {/* Sticky Header - Pinned at top of table scroll container */}
                                <TableHeader className="sticky top-0 z-30 bg-slate-100 opacity-100 shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
                                    {/* Main Column Titles (Row 1 - Draggable Headers) */}
                                    <TableRow className="border-b border-slate-200 bg-slate-100 sticky top-0 z-30">
                                        {visibleColumns.map((colKey) => {
                                            const isName = colKey === 'name'
                                            const isDragging = draggedColKey === colKey
                                            const isDragOver = dragOverColKey === colKey

                                            return (
                                                <TableHead
                                                    key={colKey}
                                                    draggable={!isName}
                                                    onDragStart={(e) => handleDragStart(e, colKey)}
                                                    onDragOver={(e) => handleDragOver(e, colKey)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, colKey)}
                                                    className={`py-2.5 px-4 text-slate-700 font-bold text-xs tracking-wider whitespace-nowrap bg-slate-100 opacity-100 transition-all select-none ${
                                                        isName
                                                            ? 'sticky left-0 z-40 bg-slate-100 border-r border-slate-200/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                                            : 'cursor-grab active:cursor-grabbing hover:bg-slate-200/70'
                                                    } ${isDragging ? 'opacity-40 bg-slate-300' : ''} ${
                                                        isDragOver ? 'border-l-4 border-l-emerald-600 bg-emerald-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2 group min-w-[130px]">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            {!isName && (
                                                                <GripVertical className="h-3.5 w-3.5 text-slate-400 opacity-50 group-hover:opacity-100 shrink-0" />
                                                            )}
                                                            <span
                                                                className="truncate cursor-pointer"
                                                                onClick={() => handleSort(colKey)}
                                                            >
                                                                {formatColumnTitle(colKey)}
                                                            </span>
                                                        </div>
                                                        <ArrowUpDown
                                                            className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 cursor-pointer shrink-0"
                                                            onClick={() => handleSort(colKey)}
                                                        />
                                                    </div>
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>

                                    {/* Dropdown Filters Row (Row 2 - Top 37px) */}
                                    <TableRow className="border-b border-slate-200 bg-slate-100 sticky top-[37px] z-30">
                                        {visibleColumns.map((colKey) => {
                                            const isName = colKey === 'name'
                                            const uniqueVals = getUniqueColumnValues(colKey)
                                            const selectedVal = columnFilters[colKey] || '__ALL__'

                                            return (
                                                <TableHead
                                                    key={`filter-${colKey}`}
                                                    className={`py-1 px-2 bg-slate-100 opacity-100 ${
                                                        isName
                                                            ? 'sticky left-0 z-40 bg-slate-100 border-r border-slate-200/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                                            : ''
                                                    }`}
                                                >
                                                    <Select
                                                        value={selectedVal}
                                                        onValueChange={(val) => handleColumnFilterChange(colKey, val)}
                                                    >
                                                        <SelectTrigger size="sm" className="h-6 text-[11px] bg-white border-slate-200 font-normal w-full min-w-[130px] max-w-[200px]">
                                                            <SelectValue placeholder={`All (${formatColumnTitle(colKey)})`} />
                                                        </SelectTrigger>
                                                        <SelectContent align="start" className="max-h-60 min-w-[150px] bg-white opacity-100 shadow-2xl z-50">
                                                            <SelectItem value="__ALL__" className="text-xs font-semibold text-slate-500">
                                                                All ({formatColumnTitle(colKey)})
                                                            </SelectItem>
                                                            {uniqueVals.map((val) => (
                                                                <SelectItem key={val} value={val} className="text-xs font-medium">
                                                                    {val}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="bg-white">
                                    {filteredPeople.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={visibleColumns.length} className="h-48 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Users className="h-8 w-8 text-slate-300" />
                                                    <p className="text-sm font-medium text-slate-600">No people records match your filter</p>
                                                    <p className="text-xs text-slate-400">Try adjusting your dropdown filters or global search.</p>
                                                    {hasActiveFilters && (
                                                        <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-2 text-xs">
                                                            Reset All Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPeople.map((person, idx) => (
                                            <TableRow key={person.id || idx} className="hover:bg-slate-50/90 transition-colors group">
                                                {visibleColumns.map((colKey) => {
                                                    const rawVal = person[colKey]
                                                    const isName = colKey === 'name'
                                                    const isLinkedinCol = colKey.toLowerCase().includes('linkedin')
                                                    const parsedLink = parseLinkCell(rawVal)

                                                    const cellClass = `px-4 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap min-w-[130px] ${
                                                        isName
                                                            ? 'sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[170px]'
                                                            : ''
                                                    }`

                                                    // 1. Name Column (Sticky Left) — clickable to open lead detail dialog
                                                    if (isName) {
                                                        return (
                                                            <TableCell key={colKey} className={cellClass}>
                                                                <button
                                                                    onClick={() => setSelectedPerson(person)}
                                                                    className="flex items-center gap-2 font-semibold text-slate-900 hover:text-emerald-700 transition-colors group/name w-full text-left"
                                                                >
                                                                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 group-hover/name:bg-emerald-200 transition-colors">
                                                                        {(rawVal || 'P').charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="truncate max-w-[150px] underline-offset-2 group-hover/name:underline">{rawVal || 'Unnamed'}</span>
                                                                </button>
                                                            </TableCell>
                                                        )
                                                    }

                                                    // 2. Email Column
                                                    if (colKey === 'email') {
                                                        return (
                                                            <TableCell key={colKey} className={cellClass}>
                                                                {rawVal ? (
                                                                    <a href={`mailto:${rawVal}`} className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors">
                                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                                        <span>{rawVal}</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-slate-400">—</span>
                                                                )}
                                                            </TableCell>
                                                        )
                                                    }

                                                    // 3. Phone Column
                                                    if (colKey === 'phone') {
                                                        return (
                                                            <TableCell key={colKey} className={cellClass}>
                                                                {rawVal ? (
                                                                    <a href={`tel:${rawVal}`} className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors">
                                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                                        <span>{rawVal}</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-slate-400">—</span>
                                                                )}
                                                            </TableCell>
                                                        )
                                                    }

                                                    // 4. Company Column
                                                    if (colKey === 'company') {
                                                        return (
                                                            <TableCell key={colKey} className={cellClass}>
                                                                {rawVal ? (
                                                                    <Badge variant="outline" className="bg-slate-100/80 text-slate-800 font-semibold border-slate-200">
                                                                        <Building2 className="h-3 w-3 mr-1 text-slate-500" />
                                                                        {rawVal}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-slate-400">—</span>
                                                                )}
                                                            </TableCell>
                                                        )
                                                    }

                                                    // 5. Job Title Column
                                                    if (colKey === 'jobTitle') {
                                                        return (
                                                            <TableCell key={colKey} className={cellClass}>
                                                                {rawVal ? (
                                                                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                                                                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                                                        {rawVal}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400">—</span>
                                                                )}
                                                            </TableCell>
                                                        )
                                                    }

                                                    // 6. LinkedIn Link specific handling (Red Not Found block if missing)
                                                    if (isLinkedinCol) {
                                                        const linkData = parsedLink || parseLinkCell(rawVal)
                                                        if (linkData && linkData.url && linkData.url.trim() !== '') {
                                                            return (
                                                                <TableCell key={colKey} className={cellClass}>
                                                                    <a
                                                                        href={linkData.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200 transition-colors"
                                                                    >
                                                                        <Linkedin className="h-3.5 w-3.5 text-sky-600" />
                                                                        <span>LinkedIn</span>
                                                                        <ExternalLink className="h-3 w-3 opacity-60" />
                                                                    </a>
                                                                </TableCell>
                                                            )
                                                        } else {
                                                            return (
                                                                <TableCell key={colKey} className={cellClass}>
                                                                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-semibold text-[11px] px-2 py-0.5">
                                                                        Not Found
                                                                    </Badge>
                                                                </TableCell>
                                                            )
                                                        }
                                                    }

                                                    // 7. General Link Parsing
                                                    if (parsedLink || colKey.toLowerCase().includes('website') || colKey.toLowerCase().includes('link')) {
                                                        const linkData = parsedLink || parseLinkCell(rawVal)
                                                        if (linkData && linkData.url && linkData.url.trim() !== '') {
                                                            return (
                                                                <TableCell key={colKey} className={cellClass}>
                                                                    <a
                                                                        href={linkData.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 transition-colors"
                                                                    >
                                                                        <Globe className="h-3.5 w-3.5 text-emerald-600" />
                                                                        <span className="truncate max-w-[140px]">{linkData.label || 'Website'}</span>
                                                                        <ExternalLink className="h-3 w-3 opacity-60" />
                                                                    </a>
                                                                </TableCell>
                                                            )
                                                        }
                                                    }

                                                    // 8. Pipeline Status — colored badge
                                                    const isPipelineStatus = colKey.toLowerCase().includes('status') || colKey.toLowerCase().includes('pipeline') || colKey.toLowerCase().includes('stage')
                                                    if (isPipelineStatus && rawVal) {
                                                        const statuses = parsePipelineStatus(rawVal)
                                                        if (statuses && statuses.length > 0) {
                                                            return (
                                                                <TableCell key={colKey} className={cellClass}>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {statuses.map((s, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(s)}`}
                                                                            >
                                                                                {formatStatusLabel(s)}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </TableCell>
                                                            )
                                                        }
                                                    }

                                                    // 9. Verification columns (Email Verified, Website Verify)
                                                    const isVerificationCol = colKey.toLowerCase().includes('verify') || colKey.toLowerCase().includes('verified')
                                                    if (isVerificationCol && rawVal) {
                                                        const vs = parseVerificationStatus(rawVal)
                                                        if (vs === 'verified') {
                                                            return (
                                                                <TableCell key={colKey} className={cellClass}>
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-green-50 text-green-700 border-green-300">
                                                                        ✓ Verified
                                                                    </span>
                                                                </TableCell>
                                                            )
                                                        }
                                                        if (vs === 'not_verified') {
                                                            return (
                                                                <TableCell key={colKey} className={cellClass}>
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-red-50 text-red-700 border-red-300">
                                                                        ✕ Not Verified
                                                                    </span>
                                                                </TableCell>
                                                            )
                                                        }
                                                    }

                                                    // Default Column Value
                                                    return (
                                                        <TableCell key={colKey} className={cellClass}>
                                                            {rawVal !== null && rawVal !== undefined && String(rawVal) !== '' ? String(rawVal) : '—'}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}


                {/* Table Footer */}
                <div className="shrink-0 border-t border-slate-200 bg-slate-50">
                    {/* Horizontal scrollbar — always visible, above the summary row */}
                    {!loading && (
                        <div
                            ref={stickyScrollbarRef}
                            className="w-full bg-slate-100 border-b border-slate-200"
                            style={{ overflowX: 'scroll', height: '14px' }}
                        >
                            <div style={{ width: scrollContentWidth > 0 ? `${scrollContentWidth}px` : '200%', height: '1px' }} />
                        </div>
                    )}
                    {/* Summary row */}
                    <div className="py-2 px-4 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <div>
                            Showing <span className="font-semibold text-slate-700">{filteredPeople.length}</span> of <span className="font-semibold text-slate-700">{people.length}</span> people
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-400">💡 Drag headers to reorder columns</span>
                            <span>{visibleColumns.length} columns visible</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Lead Detail Dialog */}
        <Dialog open={!!selectedPerson} onOpenChange={(open) => { if (!open) setSelectedPerson(null) }}>
            <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white p-0">
                {selectedPerson && (() => {
                    const name = selectedPerson.name || 'Unnamed'
                    const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    const allFields = allColumns.filter(k => !['id', 'avatarUrl', 'name'].includes(k))

                    return (
                        <>
                            {/* Dialog Header with avatar */}
                            <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-emerald-50 via-slate-50 to-white border-b border-slate-200">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm border border-emerald-200">
                                    {initials || <User className="h-7 w-7" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold text-slate-900 leading-tight">{name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {selectedPerson.jobTitle && (
                                            <Badge variant="outline" className="text-[11px] px-2 py-0 bg-white border-slate-200 text-slate-600 font-medium">
                                                <Briefcase className="h-3 w-3 mr-1" />{selectedPerson.jobTitle}
                                            </Badge>
                                        )}
                                        {selectedPerson.company && (
                                            <Badge variant="outline" className="text-[11px] px-2 py-0 bg-white border-slate-200 text-slate-600 font-medium">
                                                <Building2 className="h-3 w-3 mr-1" />{selectedPerson.company}
                                            </Badge>
                                        )}
                                        {selectedPerson.city && (
                                            <Badge variant="outline" className="text-[11px] px-2 py-0 bg-white border-slate-200 text-slate-600 font-medium">
                                                <MapPin className="h-3 w-3 mr-1" />{selectedPerson.city}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Row */}
                            <div className="flex gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
                                {selectedPerson.email && (
                                    <a
                                        href={`mailto:${selectedPerson.email}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-sm"
                                    >
                                        <Mail className="h-3.5 w-3.5" /> Email
                                    </a>
                                )}
                                {selectedPerson.phone && (
                                    <a
                                        href={`tel:${selectedPerson.phone}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-sm"
                                    >
                                        <Phone className="h-3.5 w-3.5" /> Call
                                    </a>
                                )}
                                {(() => {
                                    const liField = allColumns.find(k => k.toLowerCase().includes('linkedin'))
                                    const liVal = liField ? selectedPerson[liField] : null
                                    const liLink = parseLinkCell(liVal)
                                    if (liLink?.url) return (
                                        <a
                                            href={liLink.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors shadow-sm"
                                        >
                                            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                                        </a>
                                    )
                                    return null
                                })()}
                            </div>

                            {/* All Fields Grid */}
                            <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {allFields.map(key => {
                                    const val = selectedPerson[key]
                                    const isEmpty = !val || String(val).trim() === ''
                                    const parsedLink = parseLinkCell(val)
                                    const isLinkedin = key.toLowerCase().includes('linkedin')
                                    const isWebsite = key.toLowerCase().includes('website') || key.toLowerCase().includes('link')

                                    return (
                                        <div key={key} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                {formatColumnTitle(key)}
                                            </span>
                                            <div className="text-xs font-medium text-slate-800 break-words">
                                                {isEmpty ? (
                                                    <span className="text-slate-300 italic">Not set</span>
                                                ) : key === 'email' ? (
                                                    <a href={`mailto:${val}`} className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                                                        <Mail className="h-3 w-3" />{val}
                                                    </a>
                                                ) : key === 'phone' ? (
                                                    <a href={`tel:${val}`} className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                                                        <Phone className="h-3 w-3" />{val}
                                                    </a>
                                                ) : key === 'createdAt' || key === 'updatedAt' ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-600">
                                                        <Calendar className="h-3 w-3 text-slate-400" />{val}
                                                    </span>
                                                ) : key === 'city' ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-700">
                                                        <MapPin className="h-3 w-3 text-slate-400" />{val}
                                                    </span>
                                                ) : key === 'company' ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-700">
                                                        <Building2 className="h-3 w-3 text-slate-400" />{val}
                                                    </span>
                                                ) : key === 'jobTitle' ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-700">
                                                        <Briefcase className="h-3 w-3 text-slate-400" />{val}
                                                    </span>
                                                ) : isLinkedin ? (
                                                    parsedLink?.url ? (
                                                        <a href={parsedLink.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors">
                                                            <Linkedin className="h-3 w-3" />LinkedIn Profile <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                                        </a>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-semibold text-[11px] px-1.5">Not Found</Badge>
                                                    )
                                                ) : parsedLink?.url ? (
                                                    <a href={parsedLink.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                                                        <Globe className="h-3 w-3" />{parsedLink.label || 'Open link'} <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                                    </a>
                                                ) : (key.toLowerCase().includes('status') || key.toLowerCase().includes('pipeline') || key.toLowerCase().includes('stage')) ? (
                                                    (() => {
                                                        const statuses = parsePipelineStatus(val)
                                                        if (statuses && statuses.length > 0) {
                                                            return (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {statuses.map((s, i) => (
                                                                        <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(s)}`}>
                                                                            {formatStatusLabel(s)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                        return <span>{String(val)}</span>
                                                    })()
                                                ) : (key.toLowerCase().includes('verify') || key.toLowerCase().includes('verified')) ? (
                                                    (() => {
                                                        const vs = parseVerificationStatus(val)
                                                        if (vs === 'verified') return (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-green-50 text-green-700 border-green-300">
                                                                ✓ Verified
                                                            </span>
                                                        )
                                                        if (vs === 'not_verified') return (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-red-50 text-red-700 border-red-300">
                                                                ✕ Not Verified
                                                            </span>
                                                        )
                                                        return <span>{String(val)}</span>
                                                    })()
                                                ) : (
                                                    <span>{String(val)}</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )
                })()}
            </DialogContent>
        </Dialog>
        </>
    )
}
