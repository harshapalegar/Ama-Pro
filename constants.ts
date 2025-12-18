import { Product } from './types';

const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  // Remove currency symbol and commas
  return parseFloat(priceStr.replace(/[^\d.]/g, ''));
};

const parseRatingCount = (countStr: string): number => {
  if (!countStr) return 0;
  return parseInt(countStr.replace(/,/g, ''), 10);
};

const parseDiscount = (discountStr: string): number => {
  if (!discountStr) return 0;
  return parseInt(discountStr.replace('%', ''), 10);
};

const rawData = [
  {
    id: "B07JW9H4J1",
    name: "Wayona Nylon Braided USB to Lightning Fast Charging and Data Sync Cable Compatible for iPhone 13, 12,11, X, 8, 7, 6, 5, iPad Air, Pro, Mini (3 FT Pack of 1, Grey)",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹399",
    actualPrice: "₹1,099",
    discountPercentage: "64%",
    rating: 4.2,
    ratingCount: "24,269",
    about: "High Compatibility : Compatible With iPhone 12, 11, X/XsMax/Xr ,iPhone 8/8 Plus,iPhone 7/7 Plus,iPhone 6s/6s Plus...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T1/images/I/51UsScvHQNL._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B098NS6PVG",
    name: "Ambrane Unbreakable 60W / 3A Fast Charging 1.5m Braided Type C Cable for Smartphones, Tablets, Laptops & other Type C devices",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹199",
    actualPrice: "₹349",
    discountPercentage: "43%",
    rating: 4.0,
    ratingCount: "43,994",
    about: "Compatible with all Type C enabled devices, be it an android smartphone (Mi, Samsung, Oppo, Vivo, Realme, OnePlus, etc)...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/31zOsqQOAOL._SY445_SX342_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B096MSW6CT",
    name: "Sounce Fast Phone Charging Cable & Data Sync USB Cable Compatible for iPhone 13, 12,11, X, 8, 7, 6, 5, iPad Air, Pro, Mini",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹199",
    actualPrice: "₹1,899",
    discountPercentage: "90%",
    rating: 3.9,
    ratingCount: "7,928",
    about: "Fast Charger& Data Sync-With built-in safety protections and four-core copper wires...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T1/images/I/31IvNJZnmdL._SY445_SX342_QL70_FMwebp_.jpg",
    isSponsored: false
  },
  {
    id: "B08HDJ86NZ",
    name: "boAt Deuce USB 300 2 in 1 Type-C & Micro USB Stress Resistant Cable (Martian Red)",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹329",
    actualPrice: "₹699",
    discountPercentage: "53%",
    rating: 4.2,
    ratingCount: "94,363",
    about: "The boAt Deuce USB 300 2 in 1 cable is compatible with smartphones, tablets, PC peripherals...",
    imgLink: "https://m.media-amazon.com/images/I/41V5FtEWPkL._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B08CF3B7N1",
    name: "Portronics Konnect L 1.2M Fast Charging 3A 8 Pin USB Cable for iPhone, iPad (Grey)",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹154",
    actualPrice: "₹399",
    discountPercentage: "61%",
    rating: 4.2,
    ratingCount: "16,905",
    about: "[CHARGE & SYNC FUNCTION]- This cable comes with charging & Data sync function...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/31VzNhhqifL._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B08Y1TFSP6",
    name: "pTron Solero TB301 3A Type-C Data and Fast Charging Cable (Black)",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹149",
    actualPrice: "₹1,000",
    discountPercentage: "85%",
    rating: 3.9,
    ratingCount: "24,871",
    about: "Fast Charging & Data Sync: Solero TB301 Type-C cable supports fast charge up to 5V/3A...",
    imgLink: "https://m.media-amazon.com/images/I/31wOPjcSxlL._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: false
  },
  {
    id: "B08WRWPM22",
    name: "boAt Micro USB 55 Tangle-free, Sturdy Micro USB Cable (Black)",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹176.63",
    actualPrice: "₹499",
    discountPercentage: "65%",
    rating: 4.1,
    ratingCount: "15,188",
    about: "It Ensures High Speed Transmission And Charging By Offering 3A Fast Charging...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/41jlwEZpa5L._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B08DDRGWTJ",
    name: "MI Usb Type-C Cable Smartphone (Black)",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹229",
    actualPrice: "₹299",
    discountPercentage: "23%",
    rating: 4.3,
    ratingCount: "30,411",
    about: "1m long Type-C USB Cable, Sturdy and Durable. Transfer data with speeds up to 480 Mbps...",
    imgLink: "https://m.media-amazon.com/images/I/31XO-wfGGGL._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B0B6F7LX4C",
    name: "MI 80 cm (32 inches) 5A Series HD Ready Smart Android LED TV L32M7-5AIN (Black)",
    category: "Electronics|HomeTheater,TV&Video|Televisions|SmartTelevisions",
    discountedPrice: "₹13,999",
    actualPrice: "₹24,999",
    discountPercentage: "44%",
    rating: 4.2,
    ratingCount: "32,840",
    about: "Resolution : HD Ready (1366 x 768) Resolution | Refresh Rate : 60 Hertz | 178 Degree wide viewing angle...",
    imgLink: "https://m.media-amazon.com/images/I/51fmHk3km+L._SX300_SY300_.jpg",
    isSponsored: true
  },
  {
    id: "B08DPLCM6T",
    name: "LG 80 cm (32 inches) HD Ready Smart LED TV 32LM563BPTC (Dark Iron Gray)",
    category: "Electronics|HomeTheater,TV&Video|Televisions|SmartTelevisions",
    discountedPrice: "₹13,490",
    actualPrice: "₹21,990",
    discountPercentage: "39%",
    rating: 4.3,
    ratingCount: "11,976",
    about: "Resolution: HD Ready (1366x768) | Refresh Rate: 50 hertz | Sound output: 10 Watts Output...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/51v-2Nzr+ML._SY300_SX300_.jpg",
    isSponsored: true
  },
  {
    id: "B09W5XR9RT",
    name: "Duracell USB C To Lightning Apple Certified (Mfi) Braided Cable",
    category: "Computers&Accessories|Accessories&Peripherals|Cables&Accessories|Cables|USBCables",
    discountedPrice: "₹970",
    actualPrice: "₹1,999",
    discountPercentage: "51%",
    rating: 4.4,
    ratingCount: "184",
    about: "1.2M Tangle Free durable tough braiding sync & charge cable. Supports iOS devices...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/4177nw8okbL._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B0B9XLX8VR",
    name: "VU 139 cm (55 inches) The GloLED Series 4K Smart LED Google TV 55GloLED (Grey)",
    category: "Electronics|HomeTheater,TV&Video|Televisions|SmartTelevisions",
    discountedPrice: "₹37,999",
    actualPrice: "₹65,000",
    discountPercentage: "42%",
    rating: 4.3,
    ratingCount: "3,587",
    about: "Resolution: 4K Ultra HD (3840x2160) | 104 Watt DJ Sound | Built-in Subwoofer...",
    imgLink: "https://m.media-amazon.com/images/I/41pdZIhY+gL._SY300_SX300_.jpg",
    isSponsored: true
  },
  {
    id: "B07KSMBL2H",
    name: "AmazonBasics Flexible Premium HDMI Cable (Black, 4K@60Hz, 18Gbps), 3-Foot",
    category: "Electronics|HomeTheater,TV&Video|Accessories|Cables|HDMICables",
    discountedPrice: "₹219",
    actualPrice: "₹700",
    discountPercentage: "69%",
    rating: 4.4,
    ratingCount: "4,26,973",
    about: "Flexible, lightweight HDMI cable for connecting media devices to playback display...",
    imgLink: "https://m.media-amazon.com/images/I/41nPYaWA+ML._SY300_SX300_.jpg",
    isSponsored: true
  },
  {
    id: "B09VCHLSJF",
    name: "OnePlus 108 cm (43 inches) Y Series 4K Ultra HD Smart Android LED TV 43Y1S Pro (Black)",
    category: "Electronics|HomeTheater,TV&Video|Televisions|SmartTelevisions",
    discountedPrice: "₹29,999",
    actualPrice: "₹39,999",
    discountPercentage: "25%",
    rating: 4.2,
    ratingCount: "7,298",
    about: "Resolution : 4K Ultra HD (3840x2160) | Refresh Rate : 60 Hertz | Dual-band Wi-Fi...",
    imgLink: "https://m.media-amazon.com/images/W/WEBP_402378-T2/images/I/51ovMTXv9RL._SX300_SY300_QL70_FMwebp_.jpg",
    isSponsored: true
  },
  {
    id: "B0BF57RN3K",
    name: "Fire-Boltt Ninja Call Pro Plus 1.83\" Smart Watch with Bluetooth Calling",
    category: "Electronics|WearableTechnology|SmartWatches",
    discountedPrice: "₹1,799",
    actualPrice: "₹19,999",
    discountPercentage: "91%",
    rating: 4.2,
    ratingCount: "13,937",
    about: "Bluetooth Calling Watch- Fire-Boltt Ninja Call Pro Plus Smartwatch enables calls from watch...",
    imgLink: "https://m.media-amazon.com/images/I/41WCgGbvwhL._SX300_SY300_QL70_ML2_.jpg",
    isSponsored: true
  },
  {
    id: "B0B3RRWSF6",
    name: "Fire-Boltt Phoenix Smart Watch with Bluetooth Calling 1.3\"",
    category: "Electronics|WearableTechnology|SmartWatches",
    discountedPrice: "₹1,998",
    actualPrice: "₹9,999",
    discountPercentage: "80%",
    rating: 4.3,
    ratingCount: "27,696",
    about: "High Resolution Display- Comes with a 1.3\" TFT Color Full Touch Screen and 120+ Sports Modes...",
    imgLink: "https://m.media-amazon.com/images/I/41sHRWXCfvL._SX300_SY300_QL70_ML2_.jpg",
    isSponsored: false
  },
  {
    id: "B0B5B6PQCT",
    name: "boAt Wave Call Smart Watch, 1.69” HD Display with 550 NITS",
    category: "Electronics|WearableTechnology|SmartWatches",
    discountedPrice: "₹1,999",
    actualPrice: "₹7,990",
    discountPercentage: "75%",
    rating: 3.8,
    ratingCount: "17,831",
    about: "Bluetooth Calling- Wave Call comes with a premium built-in speaker and 150+ Watch Faces...",
    imgLink: "https://m.media-amazon.com/images/I/41d69zua5LL._SX300_SY300_QL70_ML2_.jpg",
    isSponsored: true
  }
];

export const INITIAL_PRODUCTS: Product[] = rawData.map(item => {
  const price = parsePrice(item.discountedPrice);
  const actualPrice = parsePrice(item.actualPrice);
  const discountPercentage = parseDiscount(item.discountPercentage);
  const rating = item.rating;
  const reviews = parseRatingCount(item.ratingCount);
  
  // Heuristic fields for the LP Algorithm
  const relevance = rating / 5.0; // Normalizing rating to 0-1 scale
  const takeRate = 0.15; // Standard platform commission
  const adRate = item.isSponsored ? 0.45 : 0.05; // Sponsored items pay more
  
  return {
    id: item.id,
    name: item.name,
    price: price,
    actualPrice: actualPrice,
    discountPercentage: discountPercentage,
    category: item.category,
    description: item.about,
    image: item.imgLink,
    rating: rating,
    reviews: reviews,
    keywords: [
      ...item.name.toLowerCase().split(' ').slice(0, 5),
      ...item.category.toLowerCase().split('|')
    ],
    relevance: relevance,
    takeRate: takeRate,
    adRate: adRate,
    isSponsored: item.isSponsored,
    icon: "📦", // Fallback icon
    expectedRevenue: relevance * price * (takeRate + adRate)
  };
});
