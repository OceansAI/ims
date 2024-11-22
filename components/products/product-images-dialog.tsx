'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useProducts } from '@/lib/hooks/use-products';
import { supabase } from '@/lib/supabase/client';
import { Upload, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

interface ProductImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function ProductImagesDialog({
  open,
  onOpenChange,
  product,
}: ProductImagesDialogProps) {
  const { updateProduct } = useProducts();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        return {
          id: crypto.randomUUID(),
          url: publicUrl,
          alt: file.name,
          primary: product.images?.length === 0,
        };
      });

      const newImages = await Promise.all(uploadPromises);
      const updatedImages = [...(product.images || []), ...newImages];

      await updateProduct(product.id, {
        images: updatedImages,
      });

      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    const updatedImages = product.images?.map(img => ({
      ...img,
      primary: img.id === imageId,
    }));

    try {
      await updateProduct(product.id, { images: updatedImages });
      toast({
        title: 'Success',
        description: 'Primary image updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update primary image',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (imageId: string) => {
    const updatedImages = product.images?.filter(img => img.id !== imageId);
    
    try {
      await updateProduct(product.id, { images: updatedImages });
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Product Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Images'}
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {product.images?.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg border overflow-hidden group"
              >
                <Image
                  src={image.url}
                  alt={image.alt || ''}
                  fill
                  className="object-cover"
                />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant={image.primary ? 'default' : 'secondary'}
                    onClick={() => handleSetPrimary(image.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {image.primary && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Primary
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(!product.images || product.images.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No images uploaded yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}