export interface Product {
  id: string; // Changed to string to match dataset IDs usually
  name: string;
  price: number;
  actualPrice: number; // For strikethrough price
  discountPercentage: number;
  category: string;
  description: string;
  image: string; // URL from img_link
  
  // Algorithmic fields (Synthesized)
  keywords: string[];
  relevance: number;
  takeRate: number;
  adRate: number;
  isSponsored: boolean;
  rating: number;
  reviews: number;
  icon: string; // Fallback
  expectedRevenue: number;
  
  // Dynamic properties for algorithm display
  dualScore?: number;
  score?: number;
}

export interface LPResult {
  items: Product[];
  totalRevenue: number;
  totalRelevance: number;
  maxRelevance: number;
  relevanceRatio: number;
  targetRelevance: number;
  metConstraint: boolean;
}

export interface ScoreResult {
  items: Product[];
  totalRevenue: number;
  totalRelevance: number;
  maxRelevance: number;
  relevanceRatio: number;
}

export type ViewState = 'home' | 'search' | 'dashboard' | 'product';
export type DashboardTab = 'algorithm' | 'results' | 'comparison' | 'products';