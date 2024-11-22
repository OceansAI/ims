'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';
import { useRealtimeSubscription } from './use-supabase';
import { toast } from '@/hooks/use-toast';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: Error | null;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

export const useProducts = (): ProductState => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data);
      } catch (err) {
        setError(err as Error);
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Real-time updates
  useRealtimeSubscription<Product>('products', ({ new: newProduct, old: oldProduct }) => {
    setProducts(currentProducts => {
      if (oldProduct) {
        // Update
        return currentProducts.map(product =>
          product.id === oldProduct.id ? newProduct : product
        );
      } else {
        // Insert
        return [...currentProducts, newProduct];
      }
    });
  });

  const getProductById = (id: string) => products.find(p => p.id === id);

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product added successfully',
      });

      return data;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product removed successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove product',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    getProductById,
    addProduct,
    updateProduct,
    removeProduct,
  };
};