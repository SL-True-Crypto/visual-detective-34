import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Sparkles, Zap } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import SimilaritySlider from '@/components/SimilaritySlider';
import ImageResults from '@/components/ImageResults';
import { ImageData, SimilarityResult, findSimilarImages } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [referenceImage, setReferenceImage] = useState<ImageData[]>([]);
  const [searchImages, setSearchImages] = useState<ImageData[]>([]);
  const [similarityThreshold, setSimilarityThreshold] = useState(75);
  const [results, setResults] = useState<SimilarityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (referenceImage.length === 0) {
      toast({
        title: "No reference image",
        description: "Please upload a reference image to search for similarities",
        variant: "destructive"
      });
      return;
    }

    if (searchImages.length === 0) {
      toast({
        title: "No search images",
        description: "Please upload images to search through",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const similarImages = await findSimilarImages(
        referenceImage[0],
        searchImages,
        similarityThreshold
      );
      setResults(similarImages);
      
      toast({
        title: "Search completed",
        description: `Found ${similarImages.length} similar image${similarImages.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "An error occurred while searching for similar images",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearAll = () => {
    setReferenceImage([]);
    setSearchImages([]);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-20" />
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="AI Image Similarity Detection" 
            className="w-full h-full object-cover opacity-30" 
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Visual Detective
              </h1>
            </div>
            <p className="text-xl text-foreground/90 max-w-2xl mx-auto font-medium">
              Find visually similar images using advanced perceptual hashing algorithms. 
              Upload a reference image and discover matching content in your collection.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Perceptual Hashing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Fast & Accurate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Reference Image Upload */}
        <Card className="p-6 bg-gradient-card">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Reference Image</h2>
                <p className="text-sm text-muted-foreground">
                  Upload the image you want to find similar matches for
                </p>
              </div>
            </div>
            <ImageUpload
              onImagesSelected={setReferenceImage}
              images={referenceImage}
              title="Upload Reference Image"
              description="Drag and drop your reference image here, or click to browse"
              multiple={false}
            />
          </div>
        </Card>

        {/* Search Images Upload */}
        <Card className="p-6 bg-gradient-card">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Image Collection</h2>
                <p className="text-sm text-muted-foreground">
                  Upload multiple images to search through ({searchImages.length} uploaded)
                </p>
              </div>
            </div>
            <ImageUpload
              onImagesSelected={setSearchImages}
              images={searchImages}
              title="Upload Images to Search"
              description="Drag and drop multiple images here, or click to browse"
              multiple={true}
              maxFiles={100}
            />
          </div>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SimilaritySlider
              value={similarityThreshold}
              onChange={setSimilarityThreshold}
            />
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleSearch}
              disabled={isSearching || referenceImage.length === 0 || searchImages.length === 0}
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find Similar Images
                </>
              )}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="lg"
              className="w-full"
              disabled={referenceImage.length === 0 && searchImages.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Results */}
        <ImageResults 
          results={results} 
          isLoading={isSearching} 
          onResultsChange={setResults}
        />
      </div>
    </div>
  );
};

export default Index;
