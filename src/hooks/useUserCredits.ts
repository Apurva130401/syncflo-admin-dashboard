
// hooks/useUserCredits.ts

import { useState, useEffect, useCallback } from 'react';
import { getUserCredits, updateCredits as updateCreditsQuery } from '@/lib/supabase/queries';
import { useToast } from '@/components/ui/use-toast';
import type { User } from '@supabase/supabase-js';

interface UserCredits {
  total: number;
  used: number;
}

interface UseUserCreditsResult {
  credits: UserCredits | null;
  canGenerate: boolean;
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  deductCredits: (amount?: number) => Promise<boolean>;
}

export function useUserCredits(user: User | null): UseUserCreditsResult {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getUserCredits(user.id);

    if (fetchError) {
      setError('Failed to load credits');
      toast({
        title: 'Error',
        description: 'Failed to load user credits.',
        variant: 'destructive',
      });
    } else if (data) {
      setCredits({ total: data.total_credits, used: data.used_credits });
    }
    setLoading(false);
  }, [user, toast]);

  const deductCredits = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!user || !credits) {
      setError('User or credits not loaded.');
      return false;
    }

    const newUsedCredits = credits.used + amount;
    if (newUsedCredits > credits.total) {
      setError('Insufficient credits.');
      toast({
        title: 'Error',
        description: 'Insufficient credits to perform this action.',
        variant: 'destructive',
      });
      return false;
    }

    const { success, error: updateError } = await updateCreditsQuery(user.id, newUsedCredits);

    if (updateError) {
      setError('Failed to deduct credits');
      toast({
        title: 'Error',
        description: 'Failed to deduct credits.',
        variant: 'destructive',
      });
      return false;
    }

    setCredits(prev => prev ? { ...prev, used: newUsedCredits } : null);
    return true;
  }, [user, credits, toast]);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const canGenerate = credits ? (credits.total - credits.used) > 0 : false;

  return {
    credits,
    canGenerate,
    loading,
    error,
    refreshCredits,
    deductCredits,
  };
}
