
// types/image-generation.ts

// Enums for predefined options
export enum ImageStyle {
  Professional = 'Professional',
  Vibrant = 'Vibrant',
  Minimalist = 'Minimalist',
  Photographic = 'Photographic',
  Illustration = 'Illustration',
  ThreeD = '3D',
}

export enum ImageAspectRatio {
  Square = '1:1',
  Landscape = '16:9',
  Portrait = '9:16',
  Panoramic = '3:1',
}

export enum ImageQuality {
  Fast = 'fast',
  Standard = 'standard',
  High = 'high',
}

// Interface for the image generation request body
export interface GenerationRequest {
  prompt: string;
  style?: ImageStyle;
  aspectRatio?: ImageAspectRatio;
  userId: string;
  negativePrompt?: string;
  quality?: ImageQuality;
  numVariations?: number; // For frontend to request multiple generations
}

// Interface for the image generation API response
export interface GenerationResponse {
  imageUrl: string;
  generationTime: number;
  creditsUsed: number;
  imageId: string;
}

// Interface for an image record stored in the database
export interface ImageRecord {
  id: string;
  user_id: string;
  prompt: string;
  negative_prompt: string | null;
  style: ImageStyle | null;
  aspect_ratio: ImageAspectRatio | null;
  model_used: string | null;
  image_url: string;
  storage_path: string | null;
  generation_time_ms: number | null;
  cost_credits: number;
  metadata: Record<string, unknown> | null; // JSONB type in DB
  created_at: string;
  updated_at: string;
}

// Interface for user credits data
export interface UserCredits {
  total_credits: number;
  used_credits: number;
}

// Interface for image filtering options
export interface FilterOptions {
  searchQuery?: string;
  selectedStyle?: ImageStyle;
  selectedAspectRatio?: ImageAspectRatio;
  sortBy?: 'newest' | 'oldest' | 'most_used';
  page?: number;
  limit?: number;
}
