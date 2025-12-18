import React, { useState } from 'react';
import { Search, ShoppingCart, MapPin, Menu } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (view: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onNavigate }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    onSearch(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-[#131921] text-white px-4 py-2 flex items-center gap-4">
        {/* Logo area */}
        <div 
            className="flex items-center hover:border hover:border-white p-1 rounded cursor-pointer"
            onClick={() => onNavigate('home')}
        >
          <span className="text-2xl font-bold tracking-tight">ShopHub</span>
        </div>

        {/* Deliver to */}
        <div className="hidden md:flex flex-col leading-none text-xs hover:border hover:border-white p-2 rounded cursor-pointer">
          <span className="text-gray-300 ml-3">Deliver to</span>
          <div className="flex items-center font-bold">
            <MapPin size={14} className="mr-1" />
            <span>New York 10001</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex max-w-3xl">
          <div className="flex w-full rounded overflow-hidden h-10 focus-within:ring-3 focus-within:ring-[#FF9900]">
            <select className="bg-gray-100 text-gray-600 text-xs px-2 border-r border-gray-300 outline-none hover:bg-gray-200 cursor-pointer w-auto max-w-[50px] md:max-w-fit">
              <option>All</option>
              <option>Electronics</option>
              <option>Home</option>
            </select>
            <input 
              type="text" 
              className="flex-1 px-3 text-black outline-none"
              placeholder="Search ShopHub"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="bg-[#FF9900] hover:bg-[#FA8900] px-4 flex items-center justify-center"
              onClick={handleSearch}
            >
              <Search className="text-[#131921]" size={22} />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block leading-none text-xs hover:border hover:border-white p-2 rounded cursor-pointer">
            <div className="text-gray-100">Hello, Sign in</div>
            <div className="font-bold">Account & Lists</div>
          </div>

          <div 
            className="leading-none text-xs hover:border hover:border-white p-2 rounded cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="text-gray-100">Admin</div>
            <div className="font-bold">Dashboard</div>
          </div>

          <div className="flex items-end hover:border hover:border-white p-2 rounded cursor-pointer">
            <div className="relative">
                <ShoppingCart size={28} />
                <span className="absolute -top-1 -right-1 text-[#FF9900] font-bold text-sm">0</span>
            </div>
            <span className="font-bold hidden md:inline mb-1">Cart</span>
          </div>
        </div>
      </div>

      {/* Sub Header */}
      <div className="bg-[#232f3e] text-white text-sm px-4 py-1.5 flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-1 font-bold cursor-pointer hover:border hover:border-white px-1 rounded">
          <Menu size={20} />
          All
        </div>
        {['Today\'s Deals', 'Customer Service', 'Registry', 'Gift Cards', 'Sell'].map((item) => (
            <span key={item} className="cursor-pointer hover:border hover:border-white px-2 py-1 rounded">
                {item}
            </span>
        ))}
      </div>
    </header>
  );
};
