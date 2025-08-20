// Image processing utilities for similarity detection
export interface ImageData {
  file: File;
  dataUrl: string;
  hash?: string;
}

export interface SimilarityResult {
  image: ImageData;
  similarity: number;
}

// Convert image to canvas for processing
export const imageToCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Resize to standard size for comparison
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  
  ctx.drawImage(img, 0, 0, size, size);
  return canvas;
};

// Enhanced perceptual hash with edge detection and structural focus
export const generateImageHash = async (imageData: ImageData): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = imageToCanvas(img);
        const ctx = canvas.getContext('2d')!;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Convert to grayscale with enhanced preprocessing
        const grayscale: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          grayscale.push(gray);
        }
        
        // Apply Gaussian blur to reduce text sensitivity
        const blurred = applyGaussianBlur(grayscale, canvas.width, canvas.height);
        
        // Enhanced edge detection for structural features
        const edges = detectEdges(blurred, canvas.width, canvas.height);
        
        // Generate structural hash from edges and layout
        const structuralHash = generateStructuralHash(edges, canvas.width, canvas.height);
        
        // Combine with traditional difference hash but weighted toward structure
        const diffHash = generateDifferenceHash(blurred, canvas.width, canvas.height);
        
        // Combine both hashes (70% structural, 30% difference)
        const combinedHash = combineHashes(structuralHash, diffHash, 0.7);
        
        resolve(combinedHash);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imageData.dataUrl;
  });
};

// Calculate Hamming distance between two binary strings
export const hammingDistance = (hash1: string, hash2: string): number => {
  if (hash1.length !== hash2.length) return Infinity;
  
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
};

// Gaussian blur to reduce text sensitivity
const applyGaussianBlur = (pixels: number[], width: number, height: number): number[] => {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1]; // 3x3 Gaussian kernel
  const result = new Array(pixels.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let kernelSum = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          const pixelIndex = py * width + px;
          
          sum += pixels[pixelIndex] * kernel[kernelIndex];
          kernelSum += kernel[kernelIndex];
        }
      }
      
      result[y * width + x] = Math.round(sum / kernelSum);
    }
  }
  
  return result;
};

// Enhanced edge detection for structural features
const detectEdges = (pixels: number[], width: number, height: number): number[] => {
  const edges = new Array(pixels.length).fill(0);
  
  // Sobel edge detection
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          const pixelIndex = py * width + px;
          
          gx += pixels[pixelIndex] * sobelX[kernelIndex];
          gy += pixels[pixelIndex] * sobelY[kernelIndex];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = magnitude > 30 ? 255 : 0; // Threshold for edges
    }
  }
  
  return edges;
};

// Generate structural hash focusing on layout and shapes
const generateStructuralHash = (edges: number[], width: number, height: number): string => {
  let hash = '';
  const blockSize = 4; // Larger blocks for structural features
  
  for (let y = 0; y < height - blockSize; y += blockSize) {
    for (let x = 0; x < width - blockSize; x += blockSize) {
      let blockSum = 0;
      
      for (let by = 0; by < blockSize; by++) {
        for (let bx = 0; bx < blockSize; bx++) {
          blockSum += edges[(y + by) * width + (x + bx)];
        }
      }
      
      const avg = blockSum / (blockSize * blockSize);
      hash += avg > 64 ? '1' : '0'; // Higher threshold for structural features
    }
  }
  
  return hash;
};

// Traditional difference hash
const generateDifferenceHash = (pixels: number[], width: number, height: number): string => {
  let hash = '';
  
  for (let i = 0; i < pixels.length - 1; i++) {
    if ((i + 1) % width === 0) continue; // Skip last pixel of each row
    hash += pixels[i] < pixels[i + 1] ? '1' : '0';
  }
  
  return hash;
};

// Combine two hashes with weighting
const combineHashes = (hash1: string, hash2: string, weight1: number): string => {
  const minLength = Math.min(hash1.length, hash2.length);
  let combined = '';
  
  for (let i = 0; i < minLength; i++) {
    // Weighted combination - if structural hash says similar, give it more weight
    if (hash1[i] === hash2[i]) {
      combined += hash1[i];
    } else {
      // Use random weighted selection based on weight
      combined += Math.random() < weight1 ? hash1[i] : hash2[i];
    }
  }
  
  return combined;
};

// Enhanced similarity calculation with adaptive thresholding
export const calculateSimilarity = (hash1: string, hash2: string): number => {
  const distance = hammingDistance(hash1, hash2);
  const maxDistance = hash1.length;
  const baseSimilarity = Math.max(0, (1 - distance / maxDistance) * 100);
  
  // Apply adaptive boost for structural similarity
  const structuralBoost = distance < maxDistance * 0.3 ? 10 : 0;
  
  return Math.min(100, baseSimilarity + structuralBoost);
};

// Find similar images based on reference image
export const findSimilarImages = async (
  referenceImage: ImageData,
  searchImages: ImageData[],
  threshold: number = 70
): Promise<SimilarityResult[]> => {
  const referenceHash = await generateImageHash(referenceImage);
  const results: SimilarityResult[] = [];
  
  for (const image of searchImages) {
    const imageHash = await generateImageHash(image);
    const similarity = calculateSimilarity(referenceHash, imageHash);
    
    if (similarity >= threshold) {
      results.push({ image, similarity });
    }
  }
  
  // Sort by similarity (highest first)
  return results.sort((a, b) => b.similarity - a.similarity);
};

// Convert file to data URL
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Validate if file is an image
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};