import { SubscriptionDetails, ProductCategory } from '@/types/billing';

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Calculate days until expiry from a date string
 */
export function getDaysUntilExpiry(endDateString: string): number {
  try {
    const endDate = new Date(endDateString);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
}

/**
 * Get the product category from subscription details
 */
export function getUserProductCategory(subscriptionDetails: SubscriptionDetails): ProductCategory {
  const plan = subscriptionDetails.current_plan?.toLowerCase() || '';

  if (plan.includes('suite') || plan.includes('full')) {
    return 'Full AI Business Suite';
  } else if (plan.includes('voice')) {
    return 'AI Voice Agent';
  } else {
    return 'WhatsApp Business AI';
  }
}

/**
 * Normalize billing cycle display
 */
export function normalizeBillingCycle(billingCycle: string): string {
  switch (billingCycle?.toLowerCase()) {
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return billingCycle || 'Monthly';
  }
}

/**
 * Get display name for a plan
 */
export function getPlanDisplayName(planId: string): string {
  if (!planId) return 'Unknown Plan';

  const plan = planId.toLowerCase();

  // WhatsApp plans
  if (plan.includes('whatsapp')) {
    if (plan.includes('starter')) return 'WhatsApp Starter';
    if (plan.includes('professional')) return 'WhatsApp Professional';
    if (plan.includes('enterprise')) return 'WhatsApp Enterprise';
    return 'WhatsApp Plan';
  }

  // Voice plans
  if (plan.includes('voice')) {
    if (plan.includes('starter')) return 'Voice Starter';
    if (plan.includes('professional')) return 'Voice Professional';
    if (plan.includes('enterprise')) return 'Voice Enterprise';
    return 'Voice Plan';
  }

  // Suite plans
  if (plan.includes('suite')) {
    if (plan.includes('starter')) return 'Business Suite Starter';
    if (plan.includes('professional')) return 'Business Suite Professional';
    if (plan.includes('enterprise')) return 'Business Suite Enterprise';
    return 'Business Suite';
  }

  // Generic plans
  if (plan.includes('starter')) return 'Starter Plan';
  if (plan.includes('professional')) return 'Professional Plan';
  if (plan.includes('enterprise')) return 'Enterprise Plan';

  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

/**
 * Get billing cycle display text with savings info
 */
export function getBillingCycleDisplay(billingCycle: string): string {
  switch (billingCycle?.toLowerCase()) {
    case 'monthly':
      return 'Billed monthly at full price';
    case 'yearly':
      return 'Billed annually with 20% savings';
    default:
      return 'Billing cycle not specified';
  }
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  try {
    // Assuming amount is in paisa for INR (divide by 100)
    const displayAmount = currency.toUpperCase() === 'INR' ? amount / 100 : amount;

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(displayAmount);
  } catch {
    return `${currency.toUpperCase()} ${amount}`;
  }
}