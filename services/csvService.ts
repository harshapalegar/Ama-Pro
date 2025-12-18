import Papa from 'papaparse';
import { Product } from '../types';

export interface CSVParseResult {
  success: boolean;
  data?: Product[];
  preview?: Product[];
  error?: string;
  rowCount?: number;
}

const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  return parseFloat(String(priceStr).replace(/[^\d.]/g, ''));
};

const parseRatingCount = (countStr: string): number => {
  if (!countStr) return 0;
  return parseInt(String(countStr).replace(/,/g, ''), 10);
};

const parseDiscount = (discountStr: string): number => {
  if (!discountStr) return 0;
  return parseInt(String(discountStr).replace('%', ''), 10);
};

export const csvService = {
  parseCSV(file: File): Promise<CSVParseResult> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          try {
            if (!results.data || results.data.length === 0) {
              resolve({
                success: false,
                error: 'CSV file is empty',
              });
              return;
            }

            const products: Product[] = results.data.map((row: any, index: number) => {
              const price = parsePrice(row.price || row.discountedPrice || 0);
              const actualPrice = parsePrice(row.actualPrice || row.actual_price || price * 1.2);
              const discountPercentage = parseDiscount(row.discountPercentage || row.discount_percentage || 0);
              const rating = parseFloat(row.rating || 0) || 0;
              const reviews = parseRatingCount(row.reviews || row.ratingCount || 0);

              const relevance = rating / 5.0;
              const takeRate = parseFloat(row.takeRate || row.take_rate || 0.15);
              const adRate = parseFloat(row.adRate || row.ad_rate || (row.isSponsored || row.is_sponsored ? 0.45 : 0.05));

              return {
                id: row.id || `${Date.now()}-${index}`,
                name: row.name || 'Unknown Product',
                price: price,
                actualPrice: actualPrice,
                discountPercentage: discountPercentage,
                category: row.category || 'General',
                description: row.description || row.about || '',
                image: row.image || row.imgLink || '',
                keywords: Array.isArray(row.keywords)
                  ? row.keywords
                  : row.keywords
                  ? String(row.keywords).split(',').map((k: string) => k.trim())
                  : [],
                relevance: relevance,
                takeRate: takeRate,
                adRate: adRate,
                isSponsored: row.isSponsored === 'true' || row.is_sponsored === 'true' || row.isSponsored === true,
                rating: rating,
                reviews: reviews,
                icon: row.icon || '📦',
                expectedRevenue: relevance * price * (takeRate + adRate),
              };
            });

            resolve({
              success: true,
              data: products,
              preview: products.slice(0, 10),
              rowCount: products.length,
            });
          } catch (err) {
            resolve({
              success: false,
              error: `Error parsing CSV: ${String(err)}`,
            });
          }
        },
        error: (err: any) => {
          resolve({
            success: false,
            error: `CSV parsing error: ${err.message}`,
          });
        },
      });
    });
  },

  generateCSVFromProducts(products: Product[]): string {
    const headers = [
      'id',
      'name',
      'price',
      'actualPrice',
      'discountPercentage',
      'category',
      'description',
      'image',
      'keywords',
      'relevance',
      'takeRate',
      'adRate',
      'isSponsored',
      'rating',
      'reviews',
      'icon',
    ];

    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.price,
      p.actualPrice,
      p.discountPercentage,
      `"${p.category.replace(/"/g, '""')}"`,
      `"${p.description.replace(/"/g, '""')}"`,
      p.image,
      `"${p.keywords.join(',')}"`,
      p.relevance,
      p.takeRate,
      p.adRate,
      p.isSponsored,
      p.rating,
      p.reviews,
      p.icon,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },
};
