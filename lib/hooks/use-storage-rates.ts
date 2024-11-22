'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { StorageRate } from '@/types';
import { useRealtimeSubscription } from './use-supabase';
import { toast } from '@/hooks/use-toast';

interface StorageRateState {
  rates: StorageRate[];
  loading: boolean;
  error: Error | null;
  getCurrentRate: (productId: string) => Promise<number>;
  addRate: (rate: Omit<StorageRate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRate: (id: string, updates: Partial<StorageRate>) => Promise<void>;
  removeRate: (id: string) => Promise<void>;
}

export const useStorageRates = (): StorageRateState => {
  const [rates, setRates] = useState<StorageRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase
          .from('storage_rates')
          .select('*')
          .order('effective_date', { ascending: false });

        if (error) throw error;
        setRates(data);
      } catch (err) {
        setError(err as Error);
        toast({
          title: 'Error',
          description: 'Failed to fetch storage rates',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Real-time updates
  useRealtimeSubscription<StorageRate>('storage_rates', ({ new: newRate, old: oldRate }) => {
    setRates(currentRates => {
      if (oldRate) {
        return currentRates.map(rate =>
          rate.id === oldRate.id ? newRate : rate
        );
      } else {
        return [...currentRates, newRate];
      }
    });
  });

  const getCurrentRate = async (productId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_current_product_rate', {
        p_product_id: productId,
        p_date: new Date().toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting current rate:', err);
      return 25.00; // Default rate
    }
  };

  const addRate = async (rate: Omit<StorageRate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('storage_rates')
        .insert([rate]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Storage rate added successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add storage rate',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateRate = async (id: string, updates: Partial<StorageRate>) => {
    try {
      const { error } = await supabase
        .from('storage_rates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Storage rate updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update storage rate',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const removeRate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('storage_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Storage rate removed successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove storage rate',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    rates,
    loading,
    error,
    getCurrentRate,
    addRate,
    updateRate,
    removeRate,
  };
};