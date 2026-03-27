import { Truck, Shield, Gift, RotateCcw, CreditCard, Leaf } from 'lucide-react';

const trustItems = [
  { icon: Truck, text: 'Free Shipping', subtext: 'On orders over ₹999' },
  { icon: Shield, text: 'Safe Packaging', subtext: 'Double-layer protection' },
  { icon: Gift, text: 'Gift Ready', subtext: 'Beautiful unboxing' },
  { icon: RotateCcw, text: 'Easy Returns', subtext: '7-day policy' },
  { icon: CreditCard, text: 'Secure Payment', subtext: '100% protected' },
  { icon: Leaf, text: 'Eco Friendly', subtext: 'Sustainable craft' },
];

export function TrustStrip() {
  return (
    <section className="py-10 md:py-14 bg-gradient-to-br from-primary/10 via-secondary border-y border-soft-line/30 overflow-hidden relative z-50">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container-wide relative z-10">
        {/* Desktop - Flex layout */}
        <div className="hidden md:flex items-center justify-between gap-6 lg:gap-10">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 group cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-card shadow-soft group-hover:shadow-medium group-hover:bg-primary/10 transition-all duration-500 flex items-center justify-center border border-soft-line/50">
                <item.icon className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground tracking-tight">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile - Horizontal scroll */}
        <div className="md:hidden overflow-x-auto scroll-snap-x -mx-4 px-4 pb-2 no-scrollbar">
          <div className="flex gap-6 w-max">
            {trustItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 scroll-snap-item"
              >
                <div className="w-12 h-12 rounded-xl bg-card shadow-soft flex items-center justify-center border border-soft-line/50">
                  <item.icon className="w-5 h-5 text-foreground/70" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">{item.text}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{item.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}