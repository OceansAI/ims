'use client';

import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export function useRealtimeSubscription<T>(
  table: string,
  callback: (payload: { new: T; old: T }) => void,
  deps: any[] = []
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Memoize the callback to prevent infinite updates
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => memoizedCallback(payload as any)
      )
      .subscribe();

    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [table, memoizedCallback]);

  return channel;
}

export function useSupabaseQuery<T>(
  query: string,
  params?: any[],
  options?: { realtime?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the query parameters
  const queryKey = JSON.stringify(params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error } = await supabase.rpc(query, params);
        if (error) throw error;
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, queryKey]);

  // Memoize the update callback
  const handleRealtimeUpdate = useCallback(({ new: newRecord, old: oldRecord }: { new: T; old: T }) => {
    setData((currentData) => {
      if (!currentData) return currentData;

      if (oldRecord) {
        return currentData.map((item) =>
          (item as any).id === oldRecord.id ? newRecord : item
        );
      } else {
        return [...currentData, newRecord];
      }
    });
  }, []);

  useRealtimeSubscription<T>(query, handleRealtimeUpdate, []);

  return { data, loading, error };
}