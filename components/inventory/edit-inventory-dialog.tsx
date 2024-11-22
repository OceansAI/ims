'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  qtyOnHand: z.number().min(0, "Quantity cannot be negative"),
  storageRate: z.number().min(0, "Storage rate cannot be negative"),
});

interface EditInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  onSuccess?: () => void;
}

export function EditInventoryDialog({ 
  open, 
  onOpenChange, 
  itemId,
  onSuccess 
}: EditInventoryDialogProps) {
  const { getItemById, updateItem } = useInventory();
  const { getProductById } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const item = getItemById(itemId);
  const product = item ? getProductById(item.productId) : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qtyOnHand: item?.qtyOnHand || 0,
      storageRate: item?.storageRate || 0,
    },
  });

  if (!item || !product) return null;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      updateItem(itemId, {
        qtyOnHand: values.qtyOnHand,
        storageRate: values.storageRate,
      });

      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Update inventory details for {product.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="qtyOnHand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity on Hand</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="storageRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Rate ($ per unit)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}