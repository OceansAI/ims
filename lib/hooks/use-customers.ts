'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Customer } from '@/types';
import { useRealtimeSubscription } from './use-supabase';
import { toast } from '@/hooks/use-toast';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  getCustomerById: (id: string) => Customer | undefined;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
}

export const useCustomers = (): CustomerState => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setCustomers(data || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err as Error);
        toast({
          title: 'Error',
          description: 'Failed to fetch customers',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Real-time updates
  useRealtimeSubscription<Customer>('customers', (payload) => {
    if (!payload.new || !payload.old) return;

    setCustomers(currentCustomers => {
      if (payload.old) {
        // Update
        return currentCustomers.map(customer =>
          customer.id === payload.old.id ? payload.new : customer
        );
      } else {
        // Insert
        return [...currentCustomers, payload.new];
      }
    });
  });

  const getCustomerById = (id: string) => customers.find(c => c.id === id);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => [...prev, data]);

      toast({
        title: 'Success',
        description: 'Customer added successfully',
      });
    } catch (err) {
      console.error('Error adding customer:', err);
      toast({
        title: 'Error',
        description: 'Failed to add customer',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => 
        prev.map(customer => customer.id === id ? { ...customer, ...data } : customer)
      );

      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
    } catch (err) {
      console.error('Error updating customer:', err);
      toast({
        title: 'Error',
        description: 'Failed to update customer',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const removeCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => customer.id !== id));

      toast({
        title: 'Success',
        description: 'Customer removed successfully',
      });
    } catch (err) {
      console.error('Error removing customer:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove customer',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    getCustomerById,
    addCustomer,
    updateCustomer,
    removeCustomer,
  };
};