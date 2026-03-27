import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Star, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, Product } from '@/lib/api';
import { ProductCard } from '@/components/ui/ProductCard';

export function BestsellersSection() {
  const { data: bestsellers, isLoading } = useQuery({
    queryKey: ['bestsellers'],
    queryFn: async () => {
      const response = await productsApi.getBestsellers(4);
      return response;
    },
  });

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-4">
              <Heart className="w-5 h-5 text-primary fill-primary/30" />
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Customer Favorites</span>
            </div>
            <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              Loved by Our
              <br />
              <span className="font-elegant italic font-normal">Customers</span>
            </h2>
            <p className="text-premium text-lg">
              Our most popular pieces, chosen by you. Each one crafted with love and care.
            </p>
          </div>
          <Link
            to="/shop?sort=bestseller"
            className="hidden lg:inline-flex items-center gap-3 px-7 py-3.5 bg-card rounded-full shadow-soft hover:shadow-medium text-foreground font-medium transition-all group border border-soft-line/50"
          >
            View All Bestsellers
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading bestsellers...</p>
            </div>
          </div>
        ) : bestsellers && bestsellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {bestsellers.map((product: Product, index: number) => (
              <div 
                key={product._id || product.id} 
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-3xl shadow-soft border border-soft-line/30">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No bestsellers available yet.</p>
            <Link to="/shop" className="text-primary font-medium hover:underline inline-flex items-center gap-2">
              Browse all products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
        
        {/* Mobile CTA */}
        <div className="mt-10 text-center lg:hidden">
          <Link
            to="/shop?sort=bestseller"
            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-medium shadow-medium"
          >
            View All Bestsellers
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}