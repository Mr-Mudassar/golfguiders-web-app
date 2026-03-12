'use client';

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  onOpenChange,
  imageUrl,
  alt = 'Image preview',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-7xl w-full h-[90vh] p-0 gap-0 overflow-hidden bg-black/90 border-0',
          '[&>button]:hidden', // Hide default close button
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
        )}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4">
          {/* Custom Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image Container - constrained to modal boundaries */}
          {imageUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full max-w-full max-h-full">
                <Image
                  src={imageUrl}
                  alt={alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ImagePreviewModal };
