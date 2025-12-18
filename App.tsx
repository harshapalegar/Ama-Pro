import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from './constants';
import { Product, ViewState, DashboardTab, LPResult, ScoreResult } from './types';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductPage } from './components/ProductPage';
import { CSVUploadModal } from './components/CSVUploadModal';
import { CategoryManager } from './components/CategoryManager';
import { LPAlgorithm, scoreBasedRanking } from './services/algorithmService';
import { useProducts } from './hooks/useProducts';
import { useAlgorithmConfig } from './hooks/useAlgorithmConfig';
import { csvService } from './services/csvService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Info, Settings, LayoutDashboard, BarChart2, Database, AlertCircle,
  Upload, RotateCcw, Search as SearchIcon, ChevronRight, Menu,
  ChevronDown, Download, ExternalLink, MoreHorizontal, Folder, FileText,
  Zap, Tag, RefreshCw
} from 'lucide-react';

export default function App() {
  // Core State
  const { products, loading: productsLoading, addProducts, removeAllProducts } = useProducts();
  const { activeConfig, configs, updateConfig, setActive } = useAlgorithmConfig();

  const [view, setView] = useState<ViewState>('home');
  const [previousView, setPreviousView] = useState<ViewState>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<{
    sponsored: Product[];
    organic: Product[];
    sponsoredSource: 'algorithm' | 'default';
  }>({ sponsored: [], organic: [], sponsoredSource: 'default' });

  // Dashboard State
  const [activeTab, setActiveTab] = useState<DashboardTab>('products');
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Algorithm Parameters - synced with active config
  const [algoParams, setAlgoParams] = useState({
    lambda: 0.90,
    slots: 10,
    scoreWeight: 1.0,
    selectedQuery: 'cable'
  });

  const [lpResults, setLpResults] = useState<LPResult | null>(null);
  const [scoreResults, setScoreResults] = useState<ScoreResult | null>(null);
  const [liveAlgorithmData, setLiveAlgorithmData] = useState<Product[]>([]);
  const [productFilter, setProductFilter] = useState('');

  // Sync active config to algo params
  useEffect(() => {
    if (activeConfig) {
      setAlgoParams({
        lambda: activeConfig.lambda,
        slots: activeConfig.slots,
        scoreWeight: activeConfig.score_weight,
        selectedQuery: activeConfig.selected_query
      });
    }
  }, [activeConfig]);

  // Handlers
  const handleSearch = (query: string) => {
    if (!query) return;
    const lowerQ = query.toLowerCase();

    const matched = products.filter(p =>
      p.keywords.some(k => k.includes(lowerQ)) ||
      p.category.toLowerCase().includes(lowerQ) ||
      p.name.toLowerCase().includes(lowerQ) ||
      p.description.toLowerCase().includes(lowerQ)
    );

    const organic = matched;
    let sponsored = matched.filter(p => p.isSponsored);

    if (liveAlgorithmData.length > 0 && liveAlgorithmData[0].keywords.some(k => k.includes(lowerQ))) {
       sponsored = liveAlgorithmData;
       setSearchResults({ sponsored, organic, sponsoredSource: 'algorithm' });
    } else {
       sponsored = sponsored.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
       setSearchResults({ sponsored, organic, sponsoredSource: 'default' });
    }

    setSearchQuery(query);
    setView('search');
    window.scrollTo(0, 0);
  };

  const handleProductClick = (product: Product) => {
      setPreviousView(view);
      setSelectedProduct(product);
      setView('product');
      window.scrollTo(0, 0);
  };

  const handleCSVUpload = async (importedProducts: Product[]) => {
    setUploading(true);
    try {
      await addProducts(importedProducts);
      alert(`Successfully imported ${importedProducts.length} products!`);
    } catch (err) {
      alert(`Upload failed: ${String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const runLP = () => {
    const matched = products.filter(p =>
      p.keywords.some(k => k.includes(algoParams.selectedQuery)) && p.isSponsored
    );

    if (matched.length === 0) {
        alert('No sponsored products match that query.');
        return;
    }

    const lp = new LPAlgorithm(matched, algoParams.slots, algoParams.lambda);
    const result = lp.optimize();
    setLpResults(result);
    setActiveTab('results');
  };

  const applyToSite = () => {
    if (!lpResults) return;
    setLiveAlgorithmData(lpResults.items);
    alert('Algorithm results applied! Searching for the query used in dashboard will now use these results.');
  };

  const runComparison = () => {
    const matched = products.filter(p =>
        p.keywords.some(k => k.includes(algoParams.selectedQuery)) && p.isSponsored
    );

    if (matched.length === 0) {
        alert('No sponsored products match that query.');
        return;
    }

    const lp = new LPAlgorithm(matched, algoParams.slots, algoParams.lambda);
    const lpRes = lp.optimize();
    const scoreRes = scoreBasedRanking(matched, algoParams.slots, algoParams.scoreWeight);

    setLpResults(lpRes);
    setScoreResults(scoreRes);
    setActiveTab('comparison');
  };

  const handleParamChange = async (updates: Partial<typeof algoParams>) => {
    const newParams = { ...algoParams, ...updates };
    setAlgoParams(newParams);

    if (activeConfig) {
      await updateConfig(activeConfig.id, {
        lambda: newParams.lambda,
        slots: newParams.slots,
        score_weight: newParams.scoreWeight,
        selected_query: newParams.selectedQuery,
      });
    }
  };

  const downloadDataset = () => {
    const csv = csvService.generateCSVFromProducts(products);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // AWS Style Button Component
  const AwsButton = ({ children, primary, onClick, icon: Icon, disabled }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border rounded shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed
            ${primary
                ? 'bg-[#ec7211] hover:bg-[#eb5f07] text-white border-transparent'
                : 'bg-white hover:bg-gray-50 text-[#16191f] border-gray-300'}`}
    >
        {Icon && <Icon size={14} />}
        {children}
    </button>
  );

  // Render Functions
  const renderHome = () => (
    <div className="bg-[#eaeded] min-h-screen pb-10">
      <div className="relative w-full h-[250px] md:h-[300px] lg:h-[350px] bg-gray-800 overflow-hidden cursor-pointer group">
         <div className="absolute inset-0 bg-gradient-to-r from-[#232f3e] to-[#37475a] flex items-center justify-center">
            <div className="text-center text-white px-4 transform transition-transform duration-500 group-hover:scale-105">
                <h1 className="text-3xl md:text-5xl font-bold mb-2 text-[#FF9900]">Great Indian Festival</h1>
                <p className="text-lg md:text-2xl font-medium">Up to 80% off | Mobiles, Laptops & more</p>
                <div className="mt-4 inline-block bg-[#FF9900] text-[#131921] font-bold py-2 px-6 rounded-sm">Explore Now</div>
            </div>
         </div>
         <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#eaeded] to-transparent"></div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 -mt-20 md:-mt-40 relative z-10 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
           <div className="bg-white p-5 z-10 flex flex-col h-[400px] cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-[#0F1111] leading-tight">Up to 70% off | Electronics clearance store</h3>
              <div className="grid grid-cols-2 gap-4 flex-1">
                 <div onClick={() => handleSearch('laptop')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">💻</div>
                    <span className="text-xs text-gray-700">Laptops</span>
                 </div>
                 <div onClick={() => handleSearch('headphones')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">🎧</div>
                    <span className="text-xs text-gray-700">Headphones</span>
                 </div>
                 <div onClick={() => handleSearch('camera')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">📷</div>
                    <span className="text-xs text-gray-700">Cameras</span>
                 </div>
                 <div onClick={() => handleSearch('tv')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">📺</div>
                    <span className="text-xs text-gray-700">TVs</span>
                 </div>
              </div>
              <span className="text-sm text-[#007185] cursor-pointer hover:text-[#C7511F] hover:underline mt-2">See all deals</span>
           </div>
           <div className="bg-white p-5 z-10 flex flex-col h-[400px] cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-[#0F1111]">Revamp your style | Amazon Fashion</h3>
              <div className="flex-1 bg-gray-100 flex items-center justify-center text-8xl mb-2 rounded cursor-pointer overflow-hidden group" onClick={() => handleSearch('fashion')}>
                <span className="transform transition-transform duration-300 group-hover:scale-110">👕</span>
              </div>
              <span className="text-sm text-[#007185] cursor-pointer hover:text-[#C7511F] hover:underline mt-2">Explore Fashion</span>
           </div>
           <div className="bg-white p-5 z-10 flex flex-col h-[400px] cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-[#0F1111] leading-tight">Appliances for your home | Up to 55% off</h3>
              <div className="grid grid-cols-2 gap-4 flex-1">
                 <div onClick={() => handleSearch('blender')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">🍹</div>
                    <span className="text-xs text-gray-700">Mixers</span>
                 </div>
                 <div onClick={() => handleSearch('cookware')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">🍳</div>
                    <span className="text-xs text-gray-700">Cookware</span>
                 </div>
                 <div onClick={() => handleSearch('pillow')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">🛏️</div>
                    <span className="text-xs text-gray-700">Bedding</span>
                 </div>
                 <div onClick={() => handleSearch('home')} className="cursor-pointer group">
                    <div className="bg-gray-100 h-24 flex items-center justify-center text-4xl mb-1 rounded group-hover:bg-gray-200">🏠</div>
                    <span className="text-xs text-gray-700">Decor</span>
                 </div>
              </div>
              <span className="text-sm text-[#007185] cursor-pointer hover:text-[#C7511F] hover:underline mt-2">See more</span>
           </div>
           <div className="bg-white p-5 z-10 flex flex-col h-[400px] cursor-pointer shadow-sm hover:shadow-md transition-shadow">
               <div className="bg-white p-4 mb-4 border-b border-gray-100">
                   <h3 className="text-xl font-bold mb-2">Sign in for your best experience</h3>
                   <button className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg py-2 text-sm font-medium shadow-sm">Sign in securely</button>
               </div>
               <div className="flex-1 flex flex-col">
                   <h4 className="font-bold mb-2">Best Sellers in Beauty</h4>
                   <div className="flex-1 bg-gray-100 flex items-center justify-center text-6xl mb-2 rounded cursor-pointer group" onClick={() => handleSearch('beauty')}>
                       <span className="transform transition-transform duration-300 group-hover:scale-110">💄</span>
                   </div>
               </div>
           </div>
        </div>
      </div>
      <div className="max-w-[1500px] mx-auto px-4 space-y-6">
         <div className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xl font-bold text-[#0F1111]">Today's Deals ({products.length})</h3>
                <a href="#" className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">See all deals</a>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
               {products.slice(0, 10).map(p => (
                   <div key={p.id} onClick={() => handleProductClick(p)} className="min-w-[200px] max-w-[200px] flex-shrink-0 cursor-pointer p-2 border border-transparent hover:border-gray-200 rounded">
                       <div className="bg-gray-100 h-40 flex items-center justify-center text-6xl mb-2 rounded p-4">
                            {p.image ? <img src={p.image} className="max-h-full max-w-full mix-blend-multiply" /> : p.icon}
                       </div>
                       <div className="flex items-center gap-2 mb-1">
                           <span className="bg-[#CC0C39] text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">{p.discountPercentage}% off</span>
                           <span className="text-[#CC0C39] font-bold text-xs">Deal</span>
                       </div>
                       <div className="text-lg font-medium">
                           <span className="text-xs align-top">$</span>{Math.floor(p.price)}<span className="text-xs align-top">{(p.price % 1).toFixed(2).substring(1)}</span>
                       </div>
                       <div className="text-xs text-gray-500 line-clamp-2 mt-1 hover:text-[#C7511F] hover:underline">{p.name}</div>
                   </div>
               ))}
            </div>
         </div>
         <div className="bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-[#0F1111] mb-4">Best Sellers in Computers</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
               {products.filter(p => p.category.includes('Computers')).slice(0, 10).map((p, i) => (
                   <div key={`${p.id}-${i}`} onClick={() => handleProductClick(p)} className="min-w-[160px] max-w-[160px] flex-shrink-0 cursor-pointer">
                       <div className="bg-gray-100 h-48 flex items-center justify-center text-6xl mb-2 rounded shadow-sm hover:shadow-md transition-shadow p-2">
                           {p.image ? <img src={p.image} className="max-h-full max-w-full mix-blend-multiply" /> : p.icon}
                       </div>
                       <div className="text-sm font-medium line-clamp-2 text-[#007185] hover:text-[#C7511F] hover:underline leading-snug">{p.name}</div>
                       <div className="text-xs text-gray-500 mb-1">{p.reviews.toLocaleString()} reviews</div>
                       <div className="font-bold text-[#0F1111]">${p.price}</div>
                   </div>
               ))}
               <div className="min-w-[160px] flex items-center justify-center bg-gray-50 text-sm text-[#007185] font-medium cursor-pointer hover:bg-gray-100">See more</div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="max-w-[1500px] mx-auto p-4 flex gap-6">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="font-bold text-sm mb-2">Delivery Day</div>
        <div className="flex items-center gap-2 mb-4 text-sm">
            <input type="checkbox" /> Get it by Tomorrow
        </div>
        <div className="font-bold text-sm mb-2">Avg. Customer Review</div>
        <div className="flex flex-col gap-1 mb-4">
             {[4, 3, 2, 1].map(star => (
                 <div key={star} className="flex items-center gap-1 text-sm cursor-pointer hover:text-[#C7511F]">
                    <span className="text-[#FF9900]">{'★'.repeat(star)}{'☆'.repeat(5-star)}</span> & Up
                 </div>
             ))}
        </div>
        <div className="font-bold text-sm mb-2">Price</div>
        <div className="flex flex-col gap-1 text-sm text-[#0F1111]">
            <span className="cursor-pointer hover:text-[#C7511F]">Under $25</span>
            <span className="cursor-pointer hover:text-[#C7511F]">$25 to $50</span>
            <span className="cursor-pointer hover:text-[#C7511F]">$50 to $100</span>
            <span className="cursor-pointer hover:text-[#C7511F]">$100 to $200</span>
            <span className="cursor-pointer hover:text-[#C7511F]">$200 & Above</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="mb-4 bg-white p-4 border border-gray-200 rounded shadow-sm flex justify-between items-center">
          <span className="text-sm font-medium">
             {searchResults.organic.length + (searchResults.sponsored?.length || 0)} results for <span className="text-[#C7511F] font-bold">"{searchQuery}"</span>
          </span>
          <select className="text-sm border border-gray-300 rounded p-1 bg-gray-50 shadow-sm outline-none focus:ring-1 focus:ring-[#FF9900]">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Avg. Customer Review</option>
          </select>
        </div>
        {searchResults.sponsored.length > 0 && (
          <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                 Sponsored Products
                 {searchResults.sponsoredSource === 'algorithm' && (
                     <span className="bg-[#FF9900] text-black text-xs px-2 py-0.5 rounded-full font-bold">LP Optimized</span>
                 )}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.sponsored.map(p => (
                <ProductCard key={`sp-${p.id}`} product={p} showSponsored={true} onClick={handleProductClick} />
              ))}
            </div>
          </div>
        )}
        <h3 className="font-bold text-xl text-[#0F1111] mb-4">Results</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {searchResults.organic.map(p => (
            <ProductCard key={p.id} product={p} onClick={handleProductClick} />
            ))}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex h-[calc(100vh-60px)] bg-gray-100 text-[#16191f]">
      {/* Sidebar */}
      <div className="w-[240px] bg-white border-r border-gray-300 hidden md:flex flex-col">
        <div className="p-4">
           <div className="text-base font-bold text-[#16191f] mb-4 px-2">ShopHub Optimization</div>
           <div className="space-y-1">
             <div className="flex items-center gap-2 px-2 py-1.5 text-sm bg-blue-50 text-[#0073bb] border-l-4 border-[#0073bb] font-bold">
               <Settings size={16} /> Campaigns
             </div>
             <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#545b64] hover:text-[#16191f] hover:bg-gray-100 border-l-4 border-transparent cursor-pointer">
               <BarChart2 size={16} /> Bidding Strategies
             </div>
             <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#545b64] hover:text-[#16191f] hover:bg-gray-100 border-l-4 border-transparent cursor-pointer">
               <Database size={16} /> Targeting Groups
             </div>
           </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4 px-4">
            <div className="flex items-center justify-between text-[#545b64] font-bold text-xs uppercase tracking-wider mb-2">
                Storage Lens
                <ChevronDown size={14} />
            </div>
            <div className="space-y-1">
                 <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#545b64] hover:text-[#16191f] hover:bg-gray-100 cursor-pointer">
                    Dashboards
                 </div>
                 <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#545b64] hover:text-[#16191f] hover:bg-gray-100 cursor-pointer">
                    AWS Organizations settings
                 </div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Breadcrumb & Title Header */}
        <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-1 text-xs text-[#545b64] mb-2">
                <span className="hover:text-[#0073bb] hover:underline cursor-pointer">ShopHub</span>
                <ChevronRight size={12} />
                <span className="hover:text-[#0073bb] hover:underline cursor-pointer">Optimization</span>
                <ChevronRight size={12} />
                <span className="text-[#16191f] font-bold">prod-ranking-algo-v1</span>
            </div>
            <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-bold text-[#16191f]">prod-ranking-algo-v1</h1>
                 <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-200">Live</span>
            </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-300">
             <div className="flex gap-8">
                {[
                    { id: 'products', label: 'Objects' },
                    { id: 'algorithm', label: 'Properties' },
                    { id: 'results', label: 'Metrics' },
                    { id: 'comparison', label: 'Analysis' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as DashboardTab)}
                        className={`pb-2 pt-1 text-sm font-medium border-b-2 transition-colors
                            ${activeTab === tab.id
                                ? 'border-[#ec7211] text-[#16191f] font-bold'
                                : 'border-transparent text-[#545b64] hover:text-[#16191f] hover:border-gray-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
             </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f2f3f3]">

             {/* PRODUCTS TAB */}
             {activeTab === 'products' && (
                 <div className="bg-white border border-gray-300 shadow-sm">
                     <div className="p-4 border-b border-gray-200">
                         <h2 className="text-lg font-bold text-[#16191f]">Products ({products.length})</h2>
                         <p className="text-sm text-[#545b64] mt-1">
                            Manage product inventory, upload datasets, and organize by categories.
                         </p>
                     </div>

                     {/* Toolbar */}
                     <div className="p-4 flex flex-col gap-4">
                         <div className="flex flex-wrap items-center justify-between gap-2">
                             <div className="flex items-center gap-2 flex-wrap">
                                <AwsButton icon={RefreshCw} onClick={() => window.location.reload()}>Refresh</AwsButton>
                                <AwsButton icon={Download} onClick={downloadDataset}>Export CSV</AwsButton>
                                <AwsButton icon={Tag} onClick={() => setShowCategoryModal(true)}>Categories</AwsButton>
                                <button onClick={() => setShowCSVModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border rounded shadow-sm hover:bg-gray-50 text-[#16191f] border-gray-300 cursor-pointer">
                                    <Upload size={14} /> Import CSV
                                </button>
                                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                <AwsButton
                                    onClick={() => {
                                        if(confirm('Reset to default dataset?')) {
                                            removeAllProducts();
                                            addProducts(INITIAL_PRODUCTS);
                                        }
                                    }}
                                >Reset Data</AwsButton>
                             </div>
                         </div>

                         {/* Search Bar */}
                         <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#545b64]" size={16} />
                            <input
                                type="text"
                                placeholder="Find products by name"
                                className="w-full pl-9 pr-4 py-1.5 border border-[#879596] rounded text-sm focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb]"
                                value={productFilter}
                                onChange={(e) => setProductFilter(e.target.value)}
                            />
                         </div>
                     </div>

                     {/* Table */}
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-t border-gray-200">
                            <thead className="bg-[#fafafa] text-[#545b64] border-b border-gray-200">
                                <tr>
                                    <th className="p-3 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                                    <th className="px-4 py-2 font-bold">Name</th>
                                    <th className="px-4 py-2 font-bold">Category</th>
                                    <th className="px-4 py-2 font-bold">Price</th>
                                    <th className="px-4 py-2 font-bold">Relevance</th>
                                    <th className="px-4 py-2 font-bold">Sponsored</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products
                                    .filter(p => p.name.toLowerCase().includes(productFilter.toLowerCase()))
                                    .map((p) => (
                                    <tr key={p.id} className="hover:bg-blue-50 group">
                                        <td className="p-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                                        <td className="px-4 py-3 font-medium text-[#16191f] group-hover:text-[#0073bb] cursor-pointer flex items-center gap-2 max-w-xs">
                                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded bg-white">
                                                {p.image ? (
                                                    <img src={p.image} className="max-w-full max-h-full" alt="" />
                                                ) : (
                                                    <FileText size={14} className="text-[#545b64]" />
                                                )}
                                            </div>
                                            <span className="truncate">{p.name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-[#545b64] truncate max-w-[150px]">{p.category.split('|').pop()}</td>
                                        <td className="px-4 py-3 text-[#16191f] font-mono">${p.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-[#545b64]">{p.relevance.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-[#545b64]">
                                            {p.isSponsored ? 'Sponsored' : 'Standard'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                 </div>
             )}

             {/* ALGORITHM TAB */}
             {activeTab === 'algorithm' && (
                 <div className="space-y-6 max-w-4xl">
                    <div className="bg-white border border-gray-300 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[#16191f]">Algorithm Configuration</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <div className="text-xs font-bold text-[#545b64] mb-1">Target Query Context</div>
                                <select
                                    className="w-full p-1.5 text-sm border border-[#879596] rounded bg-white shadow-sm focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211] outline-none"
                                    value={algoParams.selectedQuery}
                                    onChange={(e) => handleParamChange({ selectedQuery: e.target.value })}
                                >
                                    <option value="cable">Cable</option>
                                    <option value="iphone">iPhone</option>
                                    <option value="headphones">Headphones</option>
                                    <option value="mouse">Mouse</option>
                                    <option value="laptop">Laptop</option>
                                    <option value="tv">TV</option>
                                    <option value="watch">Watch</option>
                                </select>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#545b64] mb-1 flex items-center gap-1">
                                    <Zap size={12} /> Relevance Threshold (λ)
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range" min="0.70" max="1.00" step="0.05"
                                        value={algoParams.lambda}
                                        onChange={(e) => handleParamChange({ lambda: parseFloat(e.target.value) })}
                                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ec7211]"
                                    />
                                    <span className="text-sm font-mono">{algoParams.lambda.toFixed(2)}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#545b64] mb-1">Sponsored Slots</div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range" min="5" max="15" step="1"
                                        value={algoParams.slots}
                                        onChange={(e) => handleParamChange({ slots: parseInt(e.target.value) })}
                                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ec7211]"
                                    />
                                    <span className="text-sm font-mono">{algoParams.slots}</span>
                                </div>
                            </div>
                             <div>
                                <div className="text-xs font-bold text-[#545b64] mb-1">Score Weight (w)</div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range" min="0.5" max="3.0" step="0.1"
                                        value={algoParams.scoreWeight}
                                        onChange={(e) => handleParamChange({ scoreWeight: parseFloat(e.target.value) })}
                                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ec7211]"
                                    />
                                    <span className="text-sm font-mono">{algoParams.scoreWeight.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-300 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-[#16191f]">Execution Control</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-[#545b64] mb-4">
                                Run the Linear Programming algorithm to generate an optimal ranking based on the current configuration. Changes apply instantly.
                            </p>
                            <div className="flex gap-4 flex-wrap">
                                <AwsButton primary onClick={runLP}>Run Optimization</AwsButton>
                                <AwsButton onClick={applyToSite}>Apply to Production</AwsButton>
                                <AwsButton onClick={runComparison}>Run A/B Comparison</AwsButton>
                            </div>
                        </div>
                    </div>
                 </div>
             )}

             {/* RESULTS TAB */}
             {activeTab === 'results' && (
                 <div className="space-y-6">
                    {!lpResults ? (
                       <div className="p-8 text-center bg-white border border-gray-300">
                           <Info className="mx-auto h-10 w-10 text-[#0073bb] mb-2" />
                           <h3 className="font-bold text-[#16191f]">No Metrics Available</h3>
                           <p className="text-sm text-[#545b64]">Run the optimization in the Properties tab to view metrics.</p>
                       </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Metric Cards */}
                            <div className="bg-white border border-gray-300 p-4 shadow-sm">
                                <div className="text-sm text-[#545b64] font-medium">Total Revenue</div>
                                <div className="text-2xl font-bold text-[#16191f] mt-1">${lpResults.totalRevenue.toFixed(2)}</div>
                                <div className="mt-2 text-xs text-green-700 flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                    +12.5% vs baseline
                                </div>
                            </div>
                            <div className="bg-white border border-gray-300 p-4 shadow-sm">
                                <div className="text-sm text-[#545b64] font-medium">Relevance Score</div>
                                <div className="text-2xl font-bold text-[#16191f] mt-1">{lpResults.totalRelevance.toFixed(3)}</div>
                            </div>
                             <div className="bg-white border border-gray-300 p-4 shadow-sm">
                                <div className="text-sm text-[#545b64] font-medium">Items Ranked</div>
                                <div className="text-2xl font-bold text-[#16191f] mt-1">{lpResults.items.length}</div>
                            </div>

                            {/* Main Chart */}
                            <div className="bg-white border border-gray-300 p-6 shadow-sm col-span-1 md:col-span-3 h-96">
                                <h3 className="font-bold text-[#16191f] mb-6">Slot Performance Distribution</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={lpResults.items.map((item, i) => ({
                                       name: `Slot ${i+1}`,
                                       revenue: item.expectedRevenue,
                                       relevance: item.relevance * 10
                                   }))}>
                                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                       <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                       <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                       <Tooltip cursor={{fill: '#f2f3f3'}} />
                                       <Legend />
                                       <Bar dataKey="revenue" name="Exp. Revenue ($)" fill="#ec7211" radius={[2, 2, 0, 0]} barSize={40} />
                                       <Bar dataKey="relevance" name="Relevance Index" fill="#232f3e" radius={[2, 2, 0, 0]} barSize={40} />
                                   </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                 </div>
             )}

             {/* COMPARISON TAB */}
             {activeTab === 'comparison' && (
                 <div className="space-y-6">
                    {(!lpResults || !scoreResults) ? (
                       <div className="p-8 text-center bg-white border border-gray-300">
                           <AlertCircle className="mx-auto h-10 w-10 text-[#d13212] mb-2" />
                           <h3 className="font-bold text-[#16191f]">Comparison Data Missing</h3>
                           <p className="text-sm text-[#545b64]">Run the 'A/B Comparison' in the Properties tab.</p>
                       </div>
                    ) : (
                        <div className="bg-white border border-gray-300 shadow-sm">
                             <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-[#16191f]">Algorithm Performance Analysis</h2>
                            </div>
                             <div className="p-6">
                                <div className="flex items-center gap-12 mb-8 flex-wrap">
                                    <div>
                                        <div className="text-sm text-[#545b64] mb-1">Standard Score Model</div>
                                        <div className="text-3xl font-bold text-[#16191f] border-l-4 border-red-600 pl-3">
                                            ${scoreResults.totalRevenue.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-[#545b64] mb-1">Linear Programming Model</div>
                                        <div className="text-3xl font-bold text-[#16191f] border-l-4 border-green-600 pl-3">
                                            ${lpResults.totalRevenue.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-sm text-[#545b64] mb-1">Improvement</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            +{(((lpResults.totalRevenue - scoreResults.totalRevenue)/scoreResults.totalRevenue)*100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={[
                                            { name: 'Revenue', standard: scoreResults.totalRevenue, optimized: lpResults.totalRevenue },
                                            { name: 'Relevance (x100)', standard: scoreResults.totalRelevance * 100, optimized: lpResults.totalRelevance * 100 },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" fontSize={12} />
                                            <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                                            <Tooltip cursor={{fill: '#f2f3f3'}} />
                                            <Legend />
                                            <Bar dataKey="standard" name="Standard Model" fill="#d13212" radius={[0, 4, 4, 0]} barSize={20} />
                                            <Bar dataKey="optimized" name="LP Model" fill="#1d8102" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                             </div>
                        </div>
                    )}
                 </div>
             )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onSearch={handleSearch} onNavigate={(v) => { setView(v); setSelectedProduct(null); }} />
      <main className="flex-1 bg-gray-100">
        {view === 'home' && renderHome()}
        {view === 'search' && renderSearch()}
        {view === 'dashboard' && renderDashboard()}
        {view === 'product' && selectedProduct && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
                 <Header onSearch={handleSearch} onNavigate={(v) => { setView(v); setSelectedProduct(null); }} />
                 <ProductPage product={selectedProduct} onBack={() => { setView(previousView); setSelectedProduct(null); }} />
            </div>
        )}
      </main>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={handleCSVUpload}
      />

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {view !== 'dashboard' && view !== 'product' && (
        <footer className="bg-[#131921] text-white py-8 mt-auto">
            <div className="max-w-[1000px] mx-auto text-center">
                <div className="text-xs text-gray-400 mb-4 space-x-4">
                    <span>Conditions of Use</span>
                    <span>Privacy Notice</span>
                    <span>Consumer Health Data Privacy Disclosure</span>
                    <span>Your Ads Privacy Choices</span>
                </div>
                <div className="text-xs text-gray-400">
                    © 1996-2024, ShopHub.com, Inc. or its affiliates
                </div>
            </div>
        </footer>
      )}
    </div>
  );
}
