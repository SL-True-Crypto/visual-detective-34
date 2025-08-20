import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageData, fileToDataUrl, isImageFile } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImagesSelected: (images: ImageData[]) => void;
  images: ImageData[];
  title: string;
  description: string;
  multiple?: boolean;
  maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesSelected,
  images,
  title,
  description,
  multiple = false,
  maxFiles = 1
}) => {
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const imageFiles = acceptedFiles.filter(isImageFile);
      
      if (imageFiles.length === 0) {
        toast({
          title: "Invalid files",
          description: "Please select valid image files (PNG, JPG, etc.)",
          variant: "destructive"
        });
        return;
      }

      if (!multiple && imageFiles.length > 1) {
        toast({
          title: "Too many files",
          description: "Please select only one image file",
          variant: "destructive"
        });
        return;
      }

      const filesToProcess = multiple ? 
        imageFiles.slice(0, maxFiles) : 
        [imageFiles[0]];

      const imageDataPromises = filesToProcess.map(async (file) => {
        const dataUrl = await fileToDataUrl(file);
        return { file, dataUrl };
      });

      const newImages = await Promise.all(imageDataPromises);
      onImagesSelected(multiple ? [...images, ...newImages] : newImages);

      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${newImages.length} image${newImages.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process the selected images",
        variant: "destructive"
      });
    }
  }, [images, multiple, maxFiles, onImagesSelected, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesSelected(newImages);
  };

  const hasImages = images.length > 0;

  return (
    <div className="space-y-4">
      <Card 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed transition-all cursor-pointer bg-gradient-card hover:shadow-glow ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose {multiple ? 'Images' : 'Image'}
          </Button>
          {isDragActive && (
            <p className="text-sm text-primary font-medium">Drop images here...</p>
          )}
        </div>
      </Card>

      {hasImages && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden bg-gradient-card">
                <div className="aspect-square relative">
                  <img
                    src={image.dataUrl}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;