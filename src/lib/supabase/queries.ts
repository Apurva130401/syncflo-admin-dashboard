
import { createClient } from '@/lib/supabase/client'; // For client-side usage

// Define types for clarity
interface GeneratedImageInsert {
  user_id: string;
  prompt: string;
  negative_prompt?: string;
  style?: string;
  aspect_ratio?: string;
  model_used?: string;
  image_url: string;
  storage_path?: string;
  generation_time_ms?: number;
  cost_credits?: number;
  metadata?: Record<string, unknown>;
}

interface ImageFilters {
  searchQuery?: string;
  selectedStyle?: string;
  selectedAspectRatio?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

// Helper function to calculate subscription end date
function calculateEndDate(billingCycle: string): string {
  const now = new Date();
  if (billingCycle === 'yearly') {
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate.toISOString();
  } else {
    // Monthly
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    return endDate.toISOString();
  }
}

// --- Supabase Client for Client Components ---
// Use this client for operations that run in the browser
const supabaseClient = createClient();


export async function getUserCredits(userId: string) {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('user_credits')
    .select('total_credits, used_credits')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user credits:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function saveGeneratedImage(imageData: GeneratedImageInsert) {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('generated_images')
    .insert(imageData)
    .select()
    .single();

  if (error) {
    console.error('Error saving generated image:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function getUserImages(userId: string, filters: ImageFilters) {
  const supabase = supabaseClient;
  const { searchQuery, selectedStyle, selectedAspectRatio, sortBy, page = 1, limit = 12 } = filters;

  let query = supabase
    .from('generated_images')
    .select('*, count()', { head: false, count: 'exact' })
    .eq('user_id', userId);

  if (searchQuery) {
    query = query.ilike('prompt', `%{searchQuery}%`);
  }
  if (selectedStyle) {
    query = query.eq('style', selectedStyle);
  }
  if (selectedAspectRatio) {
    query = query.eq('aspect_ratio', selectedAspectRatio);
  }

  if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching user images:', error);
    return { data: null, count: 0, error };
  }
  return { data, count, error: null };
}

export async function deleteImage(imageId: string) {
  const supabase = supabaseClient;
  const { error } = await supabase
    .from('generated_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('Error deleting image:', error);
    return { success: false, error };
  }
  return { success: true, error: null };
}

export async function updateCredits(userId: string, newUsedCredits: number) {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('user_credits')
    .update({ used_credits: newUsedCredits })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating credits:', error);
    return { success: false, error };
  }
  return { success: true, error: null };
}

export async function getUserOnboardingStatus(userId: string) {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user onboarding status:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function updateUserOnboardingStatus(userId: string, completed: boolean) {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: completed, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user onboarding status:', error);
    return { success: false, error };
  }
  return { success: true, error: null };
}

export async function getUserSubscriptionDetails(userId: string, supabase?: typeof supabaseClient) {
  // Use provided supabase client or default to client-side client
  const dbClient = supabase || supabaseClient;
  const { data, error } = await dbClient
    .from('profiles')
    .select(`
      subscription_status,
      current_plan,
      billing_cycle,
      subscription_start_date,
      subscription_end_date,
      trial_end_date,
      razorpay_subscription_id,
      last_payment_date,
      whatsapp_subscription_status,
      whatsapp_plan_id,
      voice_subscription_status,
      voice_plan_id
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user subscription details:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function getUserPaymentHistory(userId: string, limit: number = 10) {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching payment history:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function updateUserSubscription(userId: string, subscriptionData: {
  current_plan: string;
  billing_cycle: string;
  subscription_status: string;
  razorpay_subscription_id?: string;
}, supabase?: typeof supabaseClient) {
  // Use provided supabase client or default to client-side client
  const dbClient = supabase || supabaseClient;

  // Calculate subscription dates based on billing cycle
  const now = new Date();
  const subscriptionStartDate = now.toISOString();
  const subscriptionEndDate = calculateEndDate(subscriptionData.billing_cycle);

  // Determine product-specific subscription statuses
  const isWhatsappPlan = subscriptionData.current_plan.includes('whatsapp');
  const isVoicePlan = subscriptionData.current_plan.includes('voice');
  const isSuitePlan = subscriptionData.current_plan.includes('suite');

  const updateData = {
    ...subscriptionData,
    subscription_start_date: subscriptionStartDate,
    subscription_end_date: subscriptionEndDate,
    last_payment_date: subscriptionStartDate,
    whatsapp_subscription_status: isWhatsappPlan ? subscriptionData.subscription_status : null,
    voice_subscription_status: isVoicePlan ? subscriptionData.subscription_status : null,
    whatsapp_plan_id: isWhatsappPlan ? subscriptionData.current_plan : null,
    voice_plan_id: isVoicePlan ? subscriptionData.current_plan : null,
    updated_at: new Date().toISOString()
  };

  // First, try to get the existing profile
  const { data: existingProfile } = await dbClient
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    // Profile exists, update it
    const { data, error } = await dbClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user subscription:', error);
      return { success: false, error };
    }
    console.log('✅ Updated user subscription successfully:', {
      userId,
      subscription_status: updateData.subscription_status,
      current_plan: updateData.current_plan,
      billing_cycle: updateData.billing_cycle,
      subscription_start_date: updateData.subscription_start_date,
      subscription_end_date: updateData.subscription_end_date
    });
    return { success: true, error: null };
  } else {
    // Profile doesn't exist, create it
    const { data, error } = await dbClient
      .from('profiles')
      .insert({
        id: userId,
        ...updateData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error };
    }
    console.log('Created new user profile for subscription:', updateData);
    return { success: true, error: null };
  }
}

export async function createPaymentRecord(paymentData: {
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency?: string;
  billing_cycle: string;
  status: string;
  payment_method?: string;
}, supabase?: typeof supabaseClient) {
  // Use provided supabase client or default to client-side client
  const dbClient = supabase || supabaseClient;
  const { data, error } = await dbClient
    .from('payment_history')
    .insert(paymentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating payment record:', error);
    return { success: false, error };
  }
  return { success: true, error: null };
}

export async function getUserSubscriptionStatus(userId: string) {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user subscription status:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function insertSubscriptionEvent(eventData: {
  user_id: string;
  event_type: string;
  new_plan?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}, supabase?: typeof supabaseClient) {
  // Use provided supabase client or default to client-side client
  const dbClient = supabase || supabaseClient;
  const { data, error } = await dbClient
    .from('subscription_events')
    .insert({
      ...eventData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting subscription event:', error);
    return { success: false, error };
  }
  return { success: true, error: null };
}
