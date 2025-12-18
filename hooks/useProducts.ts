import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { productService } from '../services/databaseService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProducts = useCallback(
    async (newProducts: Product[]) => {
      const success = await productService.createProducts(newProducts);
      if (success) {
        await fetchProducts();
        return true;
      }
      return false;
    },
    [fetchProducts]
  );

  const removeAllProducts = useCallback(async () => {
    const success = await productService.deleteAllProducts();
    if (success) {
      setProducts([]);
      return true;
    }
    return false;
  }, []);

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      const success = await productService.updateProduct(id, updates);
      if (success) {
        setProducts(products.map(p => (p.id === id ? { ...p, ...updates } : p)));
        return true;
      }
      return false;
    },
    [products]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const success = await productService.deleteProduct(id);
      if (success) {
        setProducts(products.filter(p => p.id !== id));
        return true;
      }
      return false;
    },
    [products]
  );

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProducts,
    removeAllProducts,
    updateProduct,
    deleteProduct,
  };
};
