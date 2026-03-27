import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { productsApi } from '@/lib/api';
import { Filter, ChevronDown, Grid, LayoutGrid, X, Loader2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/ui/ProductCard';

const categories = [
  { id: '1', name: 'Mugs & Cups', slug: 'mugs-cups' },
  { id: '2', name: 'Bowls & Plates', slug: 'bowls-plates' },
  { id: '3', name: 'Vases & Décor', slug: 'vases-decor' },
  { id: '4', name: 'Aroma & Diffusers', slug: 'aroma-diffusers' },
  { id: '5', name: 'Planters', slug: 'planters' },
  { id: '6', name: 'Gift Sets', slug: 'gift-sets' },
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'bestseller', label: 'Bestsellers' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  
  const categoryFilter = searchParams.get('category');
  const sortBy = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('search') || '';

  // Fetch products from API
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', categoryFilter, searchQuery],
    queryFn: async () => {
      const response = await productsApi.getAll({
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
      });
      return response || [];
    },
  });

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];
    
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'bestseller':
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
    }
    
    return result;
  }, [products, sortBy]);

  const handleCategoryChange = (slug: string | null) => {
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: string) => {
    searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <Layout>
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-to-br from-secondary via-muted to-background py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-secondary/40 rounded-full blur-3xl" />
        </div>
        <div className="container-custom text-center relative z-10">
          <span className="inline-block pill-sage mb-4">Our Collection</span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
            {categoryFilter 
              ? categories.find(c => c.slug === categoryFilter)?.name || 'Shop'
              : searchQuery 
                ? `Search: "${searchQuery}"`
                : 'Shop All'
            }
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our handcrafted ceramic pieces, each one made with love and attention to detail
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShoppingBag className="w-4 h-4" />
            <span>{sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} available</span>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-8">
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
                  <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Categories
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className={cn(
                          "w-full text-left py-3 px-4 rounded-xl transition-all duration-300",
                          !categoryFilter 
                            ? "bg-primary text-primary-foreground font-medium shadow-soft" 
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        All Products
                      </button>
                    </li>
                    {categories.map(category => (
                      <li key={category.id}>
                        <button
                          onClick={() => handleCategoryChange(category.slug)}
                          className={cn(
                            "w-full text-left py-3 px-4 rounded-xl transition-all duration-300",
                            categoryFilter === category.slug 
                              ? "bg-primary text-primary-foreground font-medium shadow-soft" 
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Promotional Card */}
                <div className="bg-gradient-to-br from-secondary to-clay-beige rounded-2xl p-6 shadow-soft">
                  <h4 className="font-display text-lg font-semibold text-foreground mb-2">
                    Free Shipping
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    On all orders above ₹999
                  </p>
                  <div className="w-12 h-1 bg-primary rounded-full" />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-card rounded-full shadow-soft hover:shadow-medium transition-shadow"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">Filters</span>
                  </button>
                  
                  {/* Active Filters */}
                  {(categoryFilter || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear filters
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Grid Toggle - Desktop */}
                  <div className="hidden md:flex items-center gap-1 bg-card rounded-xl p-1.5 shadow-soft border border-border/50">
                    <button
                      onClick={() => setGridCols(2)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        gridCols === 2 ? "bg-primary text-primary-foreground shadow-soft" : "hover:bg-muted"
                      )}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGridCols(3)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        gridCols === 3 ? "bg-primary text-primary-foreground shadow-soft" : "hover:bg-muted"
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="appearance-none bg-card px-5 py-2.5 pr-10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-soft border border-border/50"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className={cn(
                  "grid gap-6",
                  gridCols === 2 && "grid-cols-1 sm:grid-cols-2",
                  gridCols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                  gridCols === 4 && "grid-cols-2 lg:grid-cols-4"
                )}>
                  {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-card rounded-3xl shadow-soft">
                  <div className="p-6 rounded-full bg-muted mb-6">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-soft"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-card p-6 animate-slide-in-right shadow-hover">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl font-semibold">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-foreground">Categories</h4>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      handleCategoryChange(null);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-3 px-4 rounded-xl transition-all",
                      !categoryFilter 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "hover:bg-muted"
                    )}
                  >
                    All Products
                  </button>
                </li>
                {categories.map(category => (
                  <li key={category.id}>
                    <button
                      onClick={() => {
                        handleCategoryChange(category.slug);
                        setIsFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left py-3 px-4 rounded-xl transition-all",
                        categoryFilter === category.slug 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "hover:bg-muted"
                      )}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
