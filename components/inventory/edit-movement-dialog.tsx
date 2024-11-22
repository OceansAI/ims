'use client';

import { useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Carrier } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Camera, Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
  quantity: z.number({
    required_error: "Please enter a quantity",
    invalid_type_error: "Quantity must be a number",
  }).min(1, "Quantity must be at least 1"),
  carrier: z.string({
    required_error: "Please select or enter a carrier",
  }),
  trackingNumber: z.string({
    required_error: "Please enter a tracking number",
  }).min(1, "Tracking number is required"),
  notes: z.string().optional(),
});

interface EditMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movementId: string;
  onSuccess?: () => void;
}

export function EditMovementDialog({ 
  open, 
  onOpenChange, 
  movementId,
  onSuccess 
}: EditMovementDialogProps) {
  const { movements, updateMovement, getItemById, addAttachment, removeAttachment } = useInventory();
  const { getProductById } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const movement = movements.find(m => m.id === movementId);
  const item = movement ? getItemById(movement.inventoryItemId) : null;
  const product = item ? getProductById(item.productId) : null;

  // Parse carrier and tracking info from notes
  const [carrierInfo, ...otherNotes] = movement?.notes?.split('\n') || [];
  const [carrier, trackingNumber] = carrierInfo?.split(' - ') || [];
  const notes = otherNotes.join('\n');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: movement ? new Date(movement.date) : new Date(),
      quantity: movement?.quantity || 0,
      carrier: carrier || '',
      trackingNumber: trackingNumber || '',
      notes: notes || '',
    },
  });

  if (!movement || !item || !product) return null;

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    for (const file of Array.from(uploadedFiles)) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        continue;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image type`,
          variant: "destructive",
        });
        continue;
      }

      try {
        await addAttachment(movementId, file);
        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    removeAttachment(movementId, attachmentId);
    toast({
      title: "Success",
      description: "Attachment removed successfully",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Update the movement
      updateMovement(movementId, {
        date: values.date,
        quantity: values.quantity,
        carrier: values.carrier,
        trackingNumber: values.trackingNumber,
        notes: `${values.carrier} - ${values.trackingNumber}${values.notes ? '\n' + values.notes : ''}`,
      });

      toast({
        title: "Success",
        description: "Movement updated successfully",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update movement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Movement</DialogTitle>
          <DialogDescription>
            Update movement details for {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or enter carrier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Carrier).map((carrier) => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Number</FormLabel>
                  <FormControl>
                    <Input placeholder="BOL#, PRO#, or Tracking#" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any relevant notes about this movement..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              <input
                type="file"
                ref={cameraInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {movement.attachments?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {movement.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="relative rounded-md border p-2 flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">
                        {attachment.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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