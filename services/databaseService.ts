import { supabase } from './supabaseClient';
import { Product } from '../types';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon: string;
  created_at: string;
}

export interface AlgorithmConfig {
  id: string;
  name: string;
  lambda: number;
  slots: number;
  score_weight: number;
  selected_query: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      actualPrice: p.actual_price,
      discountPercentage: p.discount_percentage,
      category: p.category_id || 'General',
      description: p.description,
      image: p.image,
      keywords: p.keywords || [],
      relevance: p.relevance,
      takeRate: p.take_rate,
      adRate: p.ad_rate,
      isSponsored: p.is_sponsored,
      rating: p.rating,
      reviews: p.reviews,
      icon: p.icon,
      expectedRevenue: p.expected_revenue,
    }));
  },

  async createProducts(products: Product[]): Promise<boolean> {
    const { error } = await supabase.from('products').insert(
      products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        actual_price: p.actualPrice,
        discount_percentage: p.discountPercentage,
        category_id: null,
        description: p.description,
        image: p.image,
        keywords: p.keywords,
        relevance: p.relevance,
        take_rate: p.takeRate,
        ad_rate: p.adRate,
        is_sponsored: p.isSponsored,
        rating: p.rating,
        reviews: p.reviews,
        icon: p.icon,
        expected_revenue: p.expectedRevenue,
      }))
    );

    if (error) {
      console.error('Error creating products:', error);
      return false;
    }
    return true;
  },

  async deleteAllProducts(): Promise<boolean> {
    const { error } = await supabase.from('products').delete().neq('id', '');

    if (error) {
      console.error('Error deleting products:', error);
      return false;
    }
    return true;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        price: updates.price,
        actual_price: updates.actualPrice,
        discount_percentage: updates.discountPercentage,
        description: updates.description,
        is_sponsored: updates.isSponsored,
        rating: updates.rating,
        reviews: updates.reviews,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      return false;
    }
    return true;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    return true;
  },
};

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  },

  async createCategory(name: string, icon: string = '📦', parentId: string | null = null): Promise<Category | null> {
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, slug, icon, parent_id: parentId }])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }

    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      return false;
    }

    return true;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  },
};

export const configService = {
  async getAllConfigs(): Promise<AlgorithmConfig[]> {
    const { data, error } = await supabase
      .from('algorithm_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching configs:', error);
      return [];
    }

    return data || [];
  },

  async getActiveConfig(): Promise<AlgorithmConfig | null> {
    const { data, error } = await supabase
      .from('algorithm_configs')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active config:', error);
      return null;
    }

    return data;
  },

  async createConfig(config: Omit<AlgorithmConfig, 'id' | 'created_at' | 'updated_at'>): Promise<AlgorithmConfig | null> {
    const { data, error } = await supabase
      .from('algorithm_configs')
      .insert([config])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating config:', error);
      return null;
    }

    return data;
  },

  async updateConfig(id: string, updates: Partial<AlgorithmConfig>): Promise<boolean> {
    const { error } = await supabase
      .from('algorithm_configs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating config:', error);
      return false;
    }

    return true;
  },

  async deleteConfig(id: string): Promise<boolean> {
    const { error } = await supabase.from('algorithm_configs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting config:', error);
      return false;
    }

    return true;
  },

  async setActiveConfig(id: string): Promise<boolean> {
    await supabase.from('algorithm_configs').update({ is_active: false }).neq('id', '');

    const { error } = await supabase
      .from('algorithm_configs')
      .update({ is_active: true })
      .eq('id', id);

    if (error) {
      console.error('Error setting active config:', error);
      return false;
    }

    return true;
  },
};
