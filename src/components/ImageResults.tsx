import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Download, Eye, Sparkles, Trash2, Copy, Scissors, CheckSquare, Square } from 'lucide-react';
import { SimilarityResult } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';

interface ImageResultsProps {
  results: SimilarityResult[];
  isLoading: boolean;
  onResultsChange?: (results: SimilarityResult[]) => void;
}

const ImageResults: React.FC<ImageResultsProps> = ({ results, isLoading, onResultsChange }) => {
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 95) return "bg-green-500";
    if (similarity >= 85) return "bg-blue-500";
    if (similarity >= 75) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const downloadImage = (result: SimilarityResult) => {
    const link = document.createElement('a');
    link.href = result.image.dataUrl;
    link.download = result.image.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewImage = (result: SimilarityResult) => {
    window.open(result.image.dataUrl, '_blank');
  };

  const toggleSelection = useCallback((index: number) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedImages(new Set(results.map((_, index) => index)));
  }, [results]);

  const deselectAll = useCallback(() => {
    setSelectedImages(new Set());
  }, []);

  const deleteSelected = useCallback(() => {
    if (!onResultsChange) return;
    
    const newResults = results.filter((_, index) => !selectedImages.has(index));
    onResultsChange(newResults);
    setSelectedImages(new Set());
    
    toast({
      title: "Images deleted",
      description: `Removed ${selectedImages.size} image${selectedImages.size > 1 ? 's' : ''} from results`,
    });
  }, [results, selectedImages, onResultsChange, toast]);

  const copySelected = useCallback(() => {
    const selectedResults = results.filter((_, index) => selectedImages.has(index));
    selectedResults.forEach((result, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = result.image.dataUrl;
        link.download = `copy_${result.image.file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 100); // Stagger downloads
    });
    
    toast({
      title: "Images copied",
      description: `Downloaded ${selectedImages.size} image${selectedImages.size > 1 ? 's' : ''}`,
    });
  }, [results, selectedImages, toast]);

  const cutSelected = useCallback(() => {
    if (!onResultsChange) return;
    
    const selectedResults = results.filter((_, index) => selectedImages.has(index));
    selectedResults.forEach((result, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = result.image.dataUrl;
        link.download = `cut_${result.image.file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 100); // Stagger downloads
    });
    
    const newResults = results.filter((_, index) => !selectedImages.has(index));
    onResultsChange(newResults);
    setSelectedImages(new Set());
    
    toast({
      title: "Images cut",
      description: `Downloaded and removed ${selectedResults.length} image${selectedResults.length > 1 ? 's' : ''}`,
    });
  }, [results, selectedImages, onResultsChange, toast]);

  const deleteAll = useCallback(() => {
    if (!onResultsChange) return;
    
    onResultsChange([]);
    setSelectedImages(new Set());
    
    toast({
      title: "All images deleted",
      description: "Cleared all search results",
      variant: "destructive"
    });
  }, [onResultsChange, toast]);

  const hasSelected = selectedImages.size > 0;
  const allSelected = selectedImages.size === results.length && results.length > 0;

  if (isLoading) {
    return (
      <Card className="p-8 bg-gradient-card">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Analyzing Images</h3>
            <p className="text-sm text-muted-foreground">Finding visually similar images...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-8 bg-gradient-card">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-full bg-muted/10 mx-auto w-fit">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No Similar Images Found</h3>
            <p className="text-sm text-muted-foreground">
              Try lowering the similarity threshold or uploading more images to search through
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Similar Images Found</h3>
          <p className="text-sm text-muted-foreground">
            {results.length} image{results.length > 1 ? 's' : ''} match your criteria
            {hasSelected && ` • ${selectedImages.size} selected`}
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {results.length} Results
        </Badge>
      </div>

      {/* Selection and Actions Bar */}
      <Card className="p-4 bg-gradient-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={allSelected ? deselectAll : selectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({results.length})
              </label>
            </div>
            {hasSelected && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {selectedImages.size} selected
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copySelected}
              disabled={!hasSelected}
              className="flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              Copy ({selectedImages.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cutSelected}
              disabled={!hasSelected || !onResultsChange}
              className="flex items-center gap-1"
            >
              <Scissors className="h-3 w-3" />
              Cut ({selectedImages.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelected}
              disabled={!hasSelected || !onResultsChange}
              className="flex items-center gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Delete ({selectedImages.size})
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteAll}
              disabled={results.length === 0 || !onResultsChange}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete All
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((result, index) => (
          <Card key={index} className={`overflow-hidden bg-gradient-card hover:shadow-glow transition-all duration-300 group relative ${
            selectedImages.has(index) ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}>
            <div className="aspect-square relative overflow-hidden">
              <img
                src={result.image.dataUrl}
                alt={`Similar image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedImages.has(index)}
                  onCheckedChange={() => toggleSelection(index)}
                  className="bg-white/90 border-white/90 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              
              <div className="absolute top-2 right-2">
                <Badge 
                  className={`${getSimilarityColor(result.similarity)} text-white font-medium`}
                >
                  {result.similarity.toFixed(1)}%
                </Badge>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => viewImage(result)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="flex-1"
                  onClick={() => downloadImage(result)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground truncate" title={result.image.file.name}>
                  {result.image.file.name}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(result.image.file.size / 1024).toFixed(1)} KB</span>
                  <span className="font-medium text-primary">
                    {result.similarity.toFixed(1)}% Match
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageResults;