import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, Product } from '@/lib/api';

export function FeaturedCollection() {
  const { data: products } = useQuery({
    queryKey: ['featured-gallery'],
    queryFn: async () => {
      return await productsApi.getFeatured(4);
    },
  });

  const galleryImages = products?.slice(0, 4).map((p: Product) => p.images?.[0]).filter(Boolean) || [
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
    'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600',
    'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-muted to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.08)_0%,_transparent_50%)]" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2.5 pill-premium">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-foreground/90">New Drop</span>
              </div>
              
              <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground">
                The Calm Clay
                <br />
                <span className="font-elegant italic font-normal text-primary">Collection</span>
              </h2>
              
              <p className="text-premium text-lg max-w-lg">
                Soft beiges and sage-toned ceramics designed to bring warmth to your coffee tables, consoles, and cozy corners. Each piece tells a story of slow craft and mindful living.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-medium text-lg transition-all duration-500 hover:shadow-elevated overflow-hidden relative"
              >
                <span className="relative z-10">Shop the Collection</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 bg-card/80 backdrop-blur-sm text-foreground px-8 py-4 rounded-full font-medium hover:bg-card transition-all shadow-soft"
              >
                Our Story
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex gap-12 pt-6">
              <div>
                <p className="heading-display text-4xl lg:text-5xl text-foreground">500+</p>
                <p className="text-sm text-muted-foreground mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="heading-display text-4xl lg:text-5xl text-foreground">50+</p>
                <p className="text-sm text-muted-foreground mt-1">Unique Designs</p>
              </div>
              <div>
                <p className="heading-display text-4xl lg:text-5xl text-foreground">4.9</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Rating</p>
              </div>
            </div>
          </div>
          
          {/* Gallery Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              <div className="space-y-4 lg:space-y-5">
                <div className="aspect-[3/4] rounded-2xl lg:rounded-3xl overflow-hidden shadow-medium image-zoom">
                  <img
                    src={galleryImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600'}
                    alt="Featured ceramic"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl lg:rounded-3xl overflow-hidden shadow-medium image-zoom">
                  <img
                    src={galleryImages[1] || 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600'}
                    alt="Featured ceramic"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-10 space-y-4 lg:space-y-5">
                <div className="aspect-square rounded-2xl lg:rounded-3xl overflow-hidden shadow-medium image-zoom">
                  <img
                    src={galleryImages[2] || 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600'}
                    alt="Featured ceramic"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl lg:rounded-3xl overflow-hidden shadow-medium image-zoom">
                  <img
                    src={galleryImages[3] || 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'}
                    alt="Featured ceramic"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-5 shadow-elevated border border-soft-line/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/15">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Handcrafted in</p>
                  <p className="font-display text-lg font-semibold text-foreground">Khurja, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}