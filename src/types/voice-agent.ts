// Voice Agent Data Models and Types

export type VerticalType = 'agency' | 'bpo' | 'mortgage' | 'recruitment' | 'car-dealership';

export type CallOutcome = 'qualified' | 'booked' | 'info-sent' | 'hung-up' | 'callback' | 'transferred' | 'voicemail';

export type CallIntent = 'inquiry' | 'complaint' | 'support' | 'sales' | 'booking' | 'information' | 'follow-up';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';

export type IntegrationStatus = 'success' | 'failed' | 'pending' | 'retrying';

export type SourceType = 'csv' | 'api' | 'manual' | 'crm' | 'web-form';

// ============================================================================
// CALL ENTITY
// ============================================================================
export interface Call {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  campaignId: string;
  sourceId: string;
  did: string; // Direct Inward Dialing number
  agentVersion: string;
  durationSec: number;
  outcome: CallOutcome;
  intent: CallIntent;
  sentimentPath: SentimentType[];
  containment: boolean; // Whether the call was resolved without transfer
  transfer: boolean;
  latencyStats: {
    averageResponseTime: number;
    maxResponseTime: number;
    totalSilenceTime: number;
  };
  flags: string[]; // e.g., ['escalation', 'complaint', 'vip']
  transcriptUrl?: string;
  recordingUrl?: string;
  crmRecordId?: string;

  // Additional metadata
  callerNumber: string;
  callerName?: string;
  agentId: string;
  agentName: string;
  vertical: VerticalType;
  cost: number;
  qualityScore?: number;
}

// ============================================================================
// CAMPAIGN ENTITY
// ============================================================================
export interface Campaign {
  id: string;
  name: string;
  vertical: VerticalType;
  goals: {
    targetCalls: number;
    targetConversions: number;
    targetRevenue: number;
    kpis: string[];
  };
  scriptVariant: string;
  routing: {
    priority: number;
    agentPool: string[];
    overflowHandling: 'queue' | 'voicemail' | 'callback';
  };
  costs: {
    costPerMinute: number;
    costPerCall: number;
    monthlyBudget: number;
    currentSpend: number;
  };
  sources: string[]; // SourceList IDs
  status: CampaignStatus;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  description?: string;
  tags: string[];
}

// ============================================================================
// SOURCE LIST ENTITY
// ============================================================================
export interface SourceList {
  id: string;
  name: string;
  type: SourceType;
  vertical: VerticalType;
  cost: number;
  ageDays: number;
  importMeta: {
    importedAt: Date;
    importedBy: string;
    sourceFile?: string;
    totalRecords: number;
    validRecords: number;
  };
  dncFlags: {
    hasDnc: boolean;
    dncCount: number;
    lastDncCheck: Date;
  };

  // Contact data
  contacts: Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
    company?: string;
    lastCalled?: Date;
    callCount: number;
  }>;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'expired';
}

// ============================================================================
// BOOKING ENTITY
// ============================================================================
export interface Booking {
  id: string;
  attendee: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  rep: {
    id: string;
    name: string;
    email: string;
  };
  calendarId: string;
  status: BookingStatus;
  startAt: Date;
  endAt: Date;
  showNoShow: 'show' | 'no-show' | 'pending';
  reschedules: number;

  // Additional details
  title: string;
  description?: string;
  location?: string;
  meetingType: 'in-person' | 'virtual' | 'phone';
  vertical: VerticalType;
  campaignId?: string;
  callId?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  notes?: string;
}

// ============================================================================
// QA RECORD ENTITY
// ============================================================================
export interface QARecord {
  id: string;
  callId: string;
  reviewedBy: string;
  reviewedAt: Date;
  rubricScores: {
    accuracy: number; // 1-5 scale
    politeness: number; // 1-5 scale
    compliance: number; // 1-5 scale
    interruptionHandling: number; // 1-5 scale
    overallScore: number; // 1-5 scale
  };
  notes: string;
  complianceChecks: Array<{
    check: string;
    passed: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
  }>;
  actions: Array<{
    type: 'training' | 'coaching' | 'escalation' | 'reward';
    description: string;
    assignedTo?: string;
    dueDate?: Date;
    completed: boolean;
  }>;

  // Metadata
  vertical: VerticalType;
  agentId: string;
  campaignId?: string;
  duration: number; // seconds
  transcriptUrl?: string;
}

// ============================================================================
// INTEGRATION SYNC ENTITY
// ============================================================================
export interface IntegrationSync {
  id: string;
  system: string; // e.g., 'salesforce', 'hubspot', 'zapier'
  objectType: string; // e.g., 'contact', 'lead', 'call', 'booking'
  status: IntegrationStatus;
  errorMessage?: string;
  retries: number;
  lastAttemptAt: Date;

  // Sync details
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;

  // Related data
  callId?: string;
  bookingId?: string;
  campaignId?: string;
  sourceId?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  vertical: VerticalType;
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================
export interface DashboardMetrics {
  totalCalls: number;
  totalDuration: number;
  averageCallDuration: number;
  conversionRate: number;
  customerSatisfaction: number;
  costPerCall: number;
  totalRevenue: number;
  activeCampaigns: number;
}

export interface CallAnalytics {
  byHour: Array<{ hour: number; calls: number; conversions: number }>;
  byDay: Array<{ date: string; calls: number; conversions: number }>;
  byIntent: Array<{ intent: CallIntent; count: number; percentage: number }>;
  byOutcome: Array<{ outcome: CallOutcome; count: number; percentage: number }>;
  bySentiment: Array<{ sentiment: SentimentType; count: number; percentage: number }>;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  callsHandled: number;
  averageDuration: number;
  conversionRate: number;
  customerSatisfaction: number;
  qualityScore: number;
  utilizationRate: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  vertical?: VerticalType;
  campaignId?: string;
  agentId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string;
  intent?: CallIntent;
  outcome?: CallOutcome;
}