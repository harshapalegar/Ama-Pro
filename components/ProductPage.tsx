import React from 'react';
import { Product } from '../types';
import { StarRating } from './StarRating';
import { MapPin, ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

interface ProductPageProps {
  product: Product;
  onBack: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ product, onBack }) => {
  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="max-w-[1500px] mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        <div className="text-xs text-[#565959] mb-4 flex items-center gap-1">
           <span className="hover:underline cursor-pointer" onClick={onBack}>Back to results</span>
           <span>›</span>
           <span className="text-[#c45500] font-bold">{product.category.split('|')[0]}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Images (4 cols) */}
          <div className="md:col-span-4 lg:col-span-5">
             <div className="sticky top-4">
                <div className="flex gap-4">
                   <div className="flex flex-col gap-2">
                       {/* Thumbnails */}
                       {[product.image].concat([product.image, product.image, product.image]).map((img, i) => (
                           <div key={i} className={`w-10 h-10 md:w-14 md:h-14 border rounded flex items-center justify-center cursor-pointer hover:shadow-md ${i === 0 ? 'border-[#e77600] shadow-sm ring-1 ring-[#e77600]' : 'border-gray-200'}`}>
                              <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                           </div>
                       ))}
                   </div>
                   <div className="flex-1 flex items-center justify-center bg-white border-0">
                      <img src={product.image} alt={product.name} className="max-w-full max-h-[500px] object-contain" />
                   </div>
                </div>
             </div>
          </div>

          {/* Center Column: Details (5 cols) */}
          <div className="md:col-span-5 lg:col-span-5">
             <h1 className="text-xl md:text-2xl font-medium text-[#0F1111] leading-snug mb-2">
                {product.name}
             </h1>
             <div className="flex items-center gap-2 mb-2">
                <a href="#" className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">Visit the Store</a>
             </div>
             <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-4">
                 <StarRating rating={product.rating} count={product.reviews} size={18} />
             </div>

             <div className="mb-4">
                <div className="flex items-start gap-2">
                   <span className="text-2xl text-[#CC0C39] font-light">-{product.discountPercentage}%</span>
                   <div className="flex items-start">
                      <span className="text-xs font-bold align-top mt-1">$</span>
                      <span className="text-3xl font-medium text-[#0F1111]">{Math.floor(product.price)}</span>
                      <span className="text-xs font-bold align-top mt-1">{(product.price % 1).toFixed(2).substring(1)}</span>
                   </div>
                </div>
                <div className="text-sm text-[#565959] mt-1">
                   List Price: <span className="line-through">${product.actualPrice.toFixed(2)}</span>
                </div>
             </div>

             {/* Icons Row */}
             <div className="flex gap-6 mb-6">
                <div className="flex flex-col items-center gap-1 w-20 text-center">
                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <RotateCcw size={20} className="text-[#007185]" />
                   </div>
                   <span className="text-xs text-[#007185] leading-tight">7 days Replacement</span>
                </div>
                <div className="flex flex-col items-center gap-1 w-20 text-center">
                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Truck size={20} className="text-[#007185]" />
                   </div>
                   <span className="text-xs text-[#007185] leading-tight">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 w-20 text-center">
                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <ShieldCheck size={20} className="text-[#007185]" />
                   </div>
                   <span className="text-xs text-[#007185] leading-tight">Warranty Policy</span>
                </div>
             </div>

             <div className="border-t border-gray-200 pt-4">
                 <h3 className="font-bold text-base mb-2">About this item</h3>
                 <ul className="list-disc pl-5 space-y-1 text-sm text-[#0F1111]">
                     {product.description.split('. ').map((point, i) => (
                         point && <li key={i}>{point}.</li>
                     ))}
                 </ul>
             </div>
          </div>

          {/* Right Column: Buy Box (3 cols) */}
          <div className="md:col-span-3 lg:col-span-2">
             <div className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white">
                 <div className="text-2xl font-medium text-[#0F1111] mb-2">
                    ${product.price.toFixed(2)}
                 </div>
                 <div className="text-sm text-[#565959] mb-4">
                    FREE delivery <span className="font-bold text-[#0F1111]">Monday, Nov 26</span>. Order within <span className="text-green-600">2 hrs 15 mins</span>
                 </div>
                 <div className="text-lg text-green-700 font-medium mb-4">In Stock</div>
                 
                 <div className="flex items-center gap-2 mb-4 text-sm">
                     <span className="text-gray-600">Ships from</span>
                     <span className="font-medium text-[#0F1111]">ShopHub</span>
                 </div>
                 <div className="flex items-center gap-2 mb-4 text-sm">
                     <span className="text-gray-600">Sold by</span>
                     <span className="text-[#007185] hover:underline cursor-pointer">ElectronicsInc</span>
                 </div>

                 <button className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full py-2 text-sm font-medium shadow-sm mb-2">
                    Add to Cart
                 </button>
                 <button className="w-full bg-[#FA8900] hover:bg-[#e37b00] border border-[#e37b00] rounded-full py-2 text-sm font-medium shadow-sm mb-4">
                    Buy Now
                 </button>
                 
                 <div className="flex items-center gap-2 text-sm text-[#007185] mb-4">
                    <Lock size={12} /> Secure transaction
                 </div>

                 <div className="flex items-start gap-2 text-xs text-[#565959]">
                    <input type="checkbox" className="mt-0.5" />
                    <span>Add gift options</span>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};