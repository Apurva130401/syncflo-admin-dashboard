import { User } from '@supabase/supabase-js';

export interface SubscriptionDetails {
  subscription_status: string;
  current_plan: string;
  billing_cycle: string;
  subscription_start_date: string;
  subscription_end_date: string;
  trial_end_date: string;
  razorpay_subscription_id: string;
  last_payment_date: string;
  whatsapp_subscription_status?: string;
  whatsapp_plan_id?: string;
  voice_subscription_status?: string;
  voice_plan_id?: string;
}

export interface PaymentRecord {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  status: string;
  payment_method: string;
  created_at: string;
}

export interface SubscriptionEvent {
  id?: string;
  user_id: string;
  event_type: string;
  new_plan?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[] | undefined;
  limits: {
    messages?: number;
    voiceMinutes?: number;
    aiResponses?: number;
  };
}

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';
export type ProductCategory = 'WhatsApp Business AI' | 'AI Voice Agent' | 'Full AI Business Suite';

export interface BillingPageProps {
  user: User | null;
  subscriptionDetails: SubscriptionDetails | null;
  paymentHistory: PaymentRecord[];
  loading: boolean;
}