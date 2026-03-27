export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  specifications?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Mugs & Cups',
    slug: 'mugs-cups',
    description: 'Hand-glazed ceramic mugs for your morning rituals',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
    productCount: 24,
  },
  {
    id: '2',
    name: 'Bowls & Plates',
    slug: 'bowls-plates',
    description: 'Artisan tableware for everyday dining',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600',
    productCount: 18,
  },
  {
    id: '3',
    name: 'Vases & Décor',
    slug: 'vases-decor',
    description: 'Statement pieces for your living spaces',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600',
    productCount: 32,
  },
  {
    id: '4',
    name: 'Aroma & Diffusers',
    slug: 'aroma-diffusers',
    description: 'Ceramic diffusers for calming ambiance',
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600',
    productCount: 12,
  },
  {
    id: '5',
    name: 'Planters',
    slug: 'planters',
    description: 'Beautiful homes for your green friends',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
    productCount: 20,
  },
  {
    id: '6',
    name: 'Gift Sets',
    slug: 'gift-sets',
    description: 'Curated collections for special occasions',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600',
    productCount: 8,
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Calm Clay Mug',
    description: 'A beautifully hand-glazed ceramic mug in our signature warm beige tone. Perfect for your morning coffee or evening tea rituals. Each piece is unique with subtle variations in the glaze that add character and warmth. Microwave and dishwasher safe.',
    shortDescription: 'Hand-glazed stoneware mug with organic finish',
    price: 699,
    originalPrice: 899,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800',
    ],
    category: 'mugs-cups',
    tags: ['bestseller', 'microwave-safe'],
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    isBestseller: true,
    specifications: {
      'Material': 'Stoneware ceramic',
      'Capacity': '350ml',
      'Dimensions': '9cm × 8cm',
      'Care': 'Microwave & dishwasher safe',
    },
  },
  {
    id: '2',
    name: 'Sage Speckled Bowl',
    description: 'A versatile ceramic bowl featuring our calming sage green glaze with natural speckles. Ideal for soups, salads, or as a beautiful decorative piece. The organic shape and earth-toned finish bring a touch of nature to your table.',
    shortDescription: 'Speckled ceramic bowl with sage finish',
    price: 549,
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
    ],
    category: 'bowls-plates',
    tags: ['new', 'handcrafted'],
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    isNew: true,
    specifications: {
      'Material': 'Stoneware ceramic',
      'Capacity': '500ml',
      'Dimensions': '15cm diameter × 6cm height',
      'Care': 'Dishwasher safe',
    },
  },
  {
    id: '3',
    name: 'Artisan Bud Vase',
    description: 'An elegant minimalist vase perfect for single stems or small bouquets. The smooth, matte finish in warm clay tones adds sophistication to any space. Handcrafted by skilled artisans from Khurja.',
    shortDescription: 'Minimalist ceramic bud vase',
    price: 849,
    originalPrice: 999,
    images: [
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800',
      'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800',
    ],
    category: 'vases-decor',
    tags: ['featured', 'gift-worthy'],
    rating: 4.7,
    reviewCount: 67,
    inStock: true,
    isFeatured: true,
    specifications: {
      'Material': 'Stoneware ceramic',
      'Dimensions': '12cm diameter × 20cm height',
      'Finish': 'Matte',
      'Care': 'Hand wash recommended',
    },
  },
  {
    id: '4',
    name: 'Serenity Oil Diffuser',
    description: 'A ceramic essential oil diffuser designed to create a calming atmosphere in your home. The porous clay naturally absorbs and releases essential oils, providing a gentle, long-lasting fragrance without the need for electricity.',
    shortDescription: 'Natural ceramic oil diffuser',
    price: 449,
    images: [
      'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800',
    ],
    category: 'aroma-diffusers',
    tags: ['wellness', 'eco-friendly'],
    rating: 4.6,
    reviewCount: 45,
    inStock: true,
    specifications: {
      'Material': 'Porous ceramic',
      'Dimensions': '8cm diameter × 10cm height',
      'Usage': 'Add 5-10 drops of essential oil',
      'Duration': 'Fragrance lasts 2-3 days',
    },
  },
  {
    id: '5',
    name: 'Terra Planter',
    description: 'A beautifully crafted ceramic planter with drainage hole, perfect for succulents or small indoor plants. The warm terracotta-inspired glaze brings an earthy elegance to your plant collection.',
    shortDescription: 'Ceramic planter with drainage',
    price: 599,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
      'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800',
    ],
    category: 'planters',
    tags: ['indoor', 'drainage'],
    rating: 4.8,
    reviewCount: 112,
    inStock: true,
    isBestseller: true,
    specifications: {
      'Material': 'Stoneware ceramic',
      'Dimensions': '12cm diameter × 10cm height',
      'Features': 'Drainage hole with saucer',
      'Suitable for': 'Small to medium plants',
    },
  },
  {
    id: '6',
    name: 'Warmth Gift Set',
    description: 'A thoughtfully curated gift set featuring two of our signature mugs and a small vase, packaged in our premium gift box. Perfect for housewarmings, weddings, or anyone who appreciates beautiful ceramics.',
    shortDescription: 'Curated 3-piece ceramic gift set',
    price: 1999,
    originalPrice: 2399,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    ],
    category: 'gift-sets',
    tags: ['gift', 'value-pack'],
    rating: 5.0,
    reviewCount: 34,
    inStock: true,
    isFeatured: true,
    specifications: {
      'Contents': '2 mugs + 1 bud vase',
      'Packaging': 'Premium gift box',
      'Care card': 'Included',
      'Gift wrapping': 'Ready to gift',
    },
  },
  {
    id: '7',
    name: 'Morning Ritual Cup',
    description: 'A perfectly sized tea cup with a delicate handle and subtle texture. The soft cream glaze with sage undertones makes every sip feel like a meditation.',
    shortDescription: 'Delicate ceramic tea cup',
    price: 449,
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800',
    ],
    category: 'mugs-cups',
    tags: ['tea', 'delicate'],
    rating: 4.7,
    reviewCount: 78,
    inStock: true,
    specifications: {
      'Material': 'Porcelain ceramic',
      'Capacity': '200ml',
      'Dimensions': '8cm × 6cm',
      'Care': 'Hand wash recommended',
    },
  },
  {
    id: '8',
    name: 'Dinner Plate Set',
    description: 'A set of 4 dinner plates with our signature reactive glaze finish. Each plate features unique patterns created during the firing process, making your dining table truly one-of-a-kind.',
    shortDescription: 'Set of 4 reactive glaze dinner plates',
    price: 2499,
    originalPrice: 2999,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
    ],
    category: 'bowls-plates',
    tags: ['set', 'dining'],
    rating: 4.9,
    reviewCount: 56,
    inStock: true,
    isNew: true,
    specifications: {
      'Material': 'Stoneware ceramic',
      'Quantity': '4 plates',
      'Diameter': '26cm each',
      'Care': 'Dishwasher safe',
    },
  },
];

export const featuredProducts = products.filter(p => p.isFeatured);
export const bestsellers = products.filter(p => p.isBestseller);
export const newArrivals = products.filter(p => p.isNew);
