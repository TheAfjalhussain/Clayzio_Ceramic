import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    id: '1',
    name: 'Mugs & Cups',
    slug: 'mugs-cups',
    description: 'Hand-glazed ceramic mugs for your morning ritual',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=85',
    productCount: 24,
    featured: true,
  },
  {
    id: '2',
    name: 'Bowls & Plates',
    slug: 'bowls-plates',
    description: 'Artisan tableware for elevated dining',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=85',
    productCount: 18,
    featured: false,
  },
  {
    id: '3',
    name: 'Vases & Décor',
    slug: 'vases-decor',
    description: 'Statement pieces for your space',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=85',
    productCount: 32,
    featured: true,
  },
  {
    id: '4',
    name: 'Aroma & Diffusers',
    slug: 'aroma-diffusers',
    description: 'Ceramic diffusers for calm ambiance',
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=85',
    productCount: 12,
    featured: false,
  },
  {
    id: '5',
    name: 'Planters',
    slug: 'planters',
    description: 'Beautiful homes for your greens',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=85',
    productCount: 20,
    featured: false,
  },
  {
    id: '6',
    name: 'Gift Sets',
    slug: 'gift-sets',
    description: 'Curated collections for special moments',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=85',
    productCount: 8,
    featured: true,
  },
];

export function CategoriesSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
            Explore
          </span>
          <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl xl:text-display-md text-foreground mb-5">
            Shop by Category
          </h2>
          <div className="divider-premium-lg mb-6" />
          <p className="text-premium text-lg max-w-md mx-auto">
            Start with the pieces that speak to your home and heart
          </p>
        </div>
        
        {/* Categories Grid - Premium Bento Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {/* Large Featured Card */}
          <Link
            to={`/shop?category=${categories[0].slug}`}
            className="group relative rounded-3xl overflow-hidden col-span-2 row-span-2 card-premium min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
          >
            <div className="absolute inset-0">
              <img
                src={categories[0].image}
                alt={categories[0].name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <div className="absolute inset-0 p-6 md:p-8 lg:p-10 flex flex-col justify-end">
              <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-white/90 text-xs font-medium mb-4">
                  Featured
                </span>
                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-3">
                  {categories[0].name}
                </h3>
                <p className="text-white/70 text-base md:text-lg mb-6 max-w-sm">
                  {categories[0].description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm font-medium">
                    {categories[0].productCount} items
                  </span>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-charcoal transition-all duration-300">
                    <ArrowUpRight className="w-6 h-6 text-white group-hover:text-charcoal transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Medium Cards */}
          {categories.slice(1, 3).map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative rounded-3xl overflow-hidden card-premium min-h-[280px] md:min-h-[340px]"
            >
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 hidden sm:block line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs font-medium">
                      {category.productCount} items
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-charcoal transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 text-white group-hover:text-charcoal transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Bottom Row - 3 Cards */}
          {categories.slice(3).map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative rounded-3xl overflow-hidden card-premium min-h-[240px] md:min-h-[280px]"
            >
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="font-display text-lg md:text-xl font-semibold text-white mb-2">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs font-medium">
                      {category.productCount} items
                    </span>
                    <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-charcoal transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4 text-white group-hover:text-charcoal transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all group"
          >
            <span>View All Categories</span>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}