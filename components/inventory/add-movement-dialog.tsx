'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { useStorageRates } from '@/lib/hooks/use-storage-rates';
import { toast } from '@/hooks/use-toast';
import { Camera, Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carrier } from '@/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productSchema = z.object({
  productId: z.string({
    required_error: "Please select a product",
  }),
  quantity: z.number({
    required_error: "Please enter a quantity",
    invalid_type_error: "Quantity must be a number",
  }).min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  type: z.enum(['INBOUND', 'OUTBOUND'], {
    required_error: "Please select a movement type",
  }),
  carrier: z.string({
    required_error: "Please select or enter a carrier",
  }),
  trackingNumber: z.string({
    required_error: "Please enter a tracking number",
  }).min(1, "Tracking number is required"),
  products: z.array(productSchema).min(1, "At least one product is required"),
  notes: z.string().optional(),
});

interface AddMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddMovementDialog({ open, onOpenChange, onSuccess }: AddMovementDialogProps) {
  const { products } = useProducts();
  const { addMovement, items, addItem } = useInventory();
  const { getCurrentRate } = useStorageRates();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'INBOUND',
      carrier: '',
      trackingNumber: '',
      products: [{ productId: '', quantity: 1 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const newFiles = Array.from(uploadedFiles).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return false;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image type`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Process each product in the movement
      for (const product of values.products) {
        let item = items.find(i => i.productId === product.productId);
        
        if (!item) {
          if (values.type === 'OUTBOUND') {
            toast({
              title: "Error",
              description: `Cannot create outbound movement for non-existent product: ${products.find(p => p.id === product.productId)?.name}`,
              variant: "destructive",
            });
            return;
          }

          const defaultRate = getCurrentRate(product.productId);
          const itemId = addItem({
            productId: product.productId,
            qtyOnHand: 0,
            qtyReceived: 0,
            qtyShipped: 0,
            storageRate: defaultRate,
          });
          
          item = items.find(i => i.productId === product.productId);
        }

        if (values.type === 'OUTBOUND') {
          const currentStock = item?.qtyOnHand || 0;
          if (product.quantity > currentStock) {
            toast({
              title: "Insufficient Stock",
              description: `Only ${currentStock} units available for ${products.find(p => p.id === product.productId)?.name}`,
              variant: "destructive",
            });
            return;
          }
        }

        // Add movement for each product
        addMovement({
          inventoryItemId: item!.id,
          type: values.type,
          quantity: product.quantity,
          notes: `${values.carrier} - ${values.trackingNumber}${values.notes ? '\n' + values.notes : ''}`,
          date: new Date(),
        });
      }

      // Here you would typically upload the files to your storage service
      if (files.length > 0) {
        console.log('Files to be uploaded:', files);
      }

      toast({
        title: "Success",
        description: `Successfully recorded ${values.type.toLowerCase()} movement for ${values.products.length} products`,
      });

      form.reset();
      setFiles([]);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record movement. Please try again.",
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
          <DialogTitle>Add Stock Movement</DialogTitle>
          <DialogDescription>
            Record an inbound or outbound movement for multiple products.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movement Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select movement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INBOUND">Inbound</SelectItem>
                        <SelectItem value="OUTBOUND">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Products</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: '', quantity: 1 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-[1fr,auto,auto] gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`products.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                              Product
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((product) => {
                                  const stock = items.find(i => i.productId === product.id)?.qtyOnHand || 0;
                                  return (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} (In Stock: {stock})
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`products.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                              Quantity
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                className="w-24"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="self-center"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
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

              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative rounded-md border p-2 flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFile(index)}
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
                onClick={() => {
                  onOpenChange(false);
                  setFiles([]);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Movement"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}