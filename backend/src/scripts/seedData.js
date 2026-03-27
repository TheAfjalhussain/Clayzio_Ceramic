/**
 * ============================================
 * 🌱 DATABASE SEED SCRIPT (FIXED)
 * ============================================
 * Run: npm run seed
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import connectDB from '../config/database.js';
import { User, Product, Coupon } from '../models/index.js';

/**
 * Slug generator (100% unique)
 */
const generateSlug = (name) => {
  return `${slugify(name, { lower: true, strict: true })}-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
};

/**
 * Sample products data
 */
const sampleProducts = [
  {
    name: 'Handcrafted Dinner Plate Set',
    description:
      'Beautiful handcrafted ceramic dinner plates perfect for everyday dining. Each plate is uniquely made by skilled artisans.',
    shortDescription: 'Set of 4 handcrafted ceramic dinner plates',
    price: 2499,
    compareAtPrice: 3499,
    category: 'dinnerware',
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'],
    materials: 'Premium Stoneware Ceramic',
    dimensions: '10.5" diameter x 1" height',
    weight: '450g per plate',
    stock: 50,
    isFeatured: true,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 124,
    tags: ['dinner plates', 'handcrafted', 'ceramic']
  },
  {
    name: 'Minimalist Ceramic Mug',
    description:
      'A beautifully simple ceramic mug designed for your morning coffee or evening tea.',
    shortDescription: 'Handmade ceramic mug with comfortable grip',
    price: 599,
    compareAtPrice: 899,
    category: 'drinkware',
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800'],
    materials: 'Glazed Ceramic',
    stock: 200,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 89,
    tags: ['mug', 'coffee', 'tea']
  },
  {
    name: 'Artisan Serving Bowl',
    description: 'Large serving bowl with a stunning reactive glaze finish.',
    shortDescription: 'Large ceramic serving bowl with reactive glaze',
    price: 1899,
    compareAtPrice: 2499,
    category: 'serveware',
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'],
    materials: 'Stoneware with Reactive Glaze',
    stock: 35,
    isBestseller: true,
    rating: 4.7,
    reviewCount: 67,
    tags: ['serving bowl', 'salad bowl']
  },
  {
    name: 'Terracotta Planter Set',
    description:
      'Set of 3 terracotta planters in graduated sizes with drainage holes.',
    shortDescription: 'Set of 3 terracotta planters with saucers',
    price: 1299,
    compareAtPrice: 1799,
    category: 'planters',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'],
    materials: 'Natural Terracotta',
    stock: 75,
    isNewArrival: true,
    rating: 4.6,
    reviewCount: 43,
    tags: ['planters', 'terracotta']
  },
  {
    name: 'Ceramic Vase Collection',
    description: 'Elegant ceramic vase with a matte finish and organic shape.',
    shortDescription: 'Modern matte ceramic vase',
    price: 999,
    compareAtPrice: 1499,
    category: 'decor',
    images: ['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800'],
    materials: 'Matte Finish Ceramic',
    stock: 60,
    isFeatured: true,
    isNewArrival: true,
    rating: 4.5,
    reviewCount: 28,
    tags: ['vase', 'decor']
  },
  {
    name: 'Complete Dinner Set - 16 Pieces',
    description:
      'Complete dining set for 4 people with plates, bowls, and mugs.',
    shortDescription: 'Complete 16-piece ceramic dinner set',
    price: 5999,
    compareAtPrice: 7999,
    category: 'sets',
    images: ['https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=800'],
    materials: 'Premium Ceramic',
    stock: 25,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 156,
    tags: ['dinner set', 'complete set']
  }
];

/**
 * Sample coupons data
 */
const sampleCoupons = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    type: 'percentage',
    value: 10,
    minOrderAmount: 500,
    maxDiscount: 500,
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isFirstOrderOnly: true
  },
  {
    code: 'FLAT200',
    description: 'Flat ₹200 off on orders above ₹1500',
    type: 'fixed',
    value: 200,
    minOrderAmount: 1500,
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  {
    code: 'BULK20',
    description: '20% off on bulk orders',
    type: 'percentage',
    value: 20,
    minOrderAmount: 5000,
    maxDiscount: 2000,
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  }
];

/**
 * Main seed function
 */
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({})
    ]);
    console.log('📦 Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Admin User',
      email: 'admin@clayzio.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });
    console.log('👤 Created admin user');

    // ✅ FIXED: Generate slugs before insertMany
    const productsWithSlugs = sampleProducts.map((product) => ({
      ...product,
      slug: generateSlug(product.name)
    }));

    const products = await Product.insertMany(productsWithSlugs);
    console.log(`🏺 Created ${products.length} products`);

    // Create coupons
    const coupons = await Coupon.insertMany(sampleCoupons);
    console.log(`🎟️ Created ${coupons.length} coupons`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Admin Login:');
    console.log('   Email: admin@clayzio.com');
    console.log('   Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
