import React from 'react';
import { Product } from '../types';
import { StarRating } from './StarRating';

interface ProductCardProps {
  product: Product;
  showSponsored?: boolean;
  onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showSponsored, onClick }) => {
  return (
    <div 
        onClick={() => onClick && onClick(product)}
        className="bg-white border border-gray-200 rounded-sm p-4 flex flex-col h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer relative group z-0"
    >
      {showSponsored && product.isSponsored && (
        <div className="mb-2 text-xs text-gray-500 font-medium">
          Sponsored <span className="text-gray-400">ⓘ</span>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center bg-gray-50 mb-4 h-52 rounded overflow-hidden relative">
        {product.image ? (
            <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain mix-blend-multiply" 
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
            />
        ) : null}
        <span className={`text-6xl absolute ${product.image ? 'hidden' : ''}`}>
            {product.icon}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[#0F1111] font-medium text-base leading-snug line-clamp-3 hover:text-[#C7511F] hover:underline">
          {product.name}
        </h3>
        
        <StarRating rating={product.rating} count={product.reviews} />
        
        <div className="mt-1">
          <span className="text-xs align-top">$</span>
          <span className="text-2xl font-medium text-[#0F1111]">
            {Math.floor(product.price)}
          </span>
          <span className="text-xs align-top">
            {(product.price % 1).toFixed(2).substring(1)}
          </span>
          {product.actualPrice > product.price && (
              <span className="text-xs text-[#565959] line-through ml-2">
                  ${product.actualPrice}
              </span>
          )}
        </div>

        <div className="text-sm text-[#565959]">
            Delivery <span className="font-bold text-[#0F1111]">Tomorrow, Nov 24</span>
        </div>

        <button className="mt-3 w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] hover:border-[#F2C200] text-sm rounded-full py-1.5 px-3 shadow-sm active:shadow-inner">
          Add to Cart
        </button>
      </div>
    </div>
  );
};