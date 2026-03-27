import { Sparkles, Package, Home, Award, Leaf, Heart } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Premium Aesthetic, Honest Pricing',
    description: 'We curate only modern, minimal designs and price them fairly—no inflated MRPs or confusing discounts.',
    accent: 'from-primary/20 to-sage/10',
  },
  {
    icon: Package,
    title: 'Safe Delivery & Gift-Ready',
    description: 'Double-layered boxes, recycled filler, and a warm unboxing experience for every order.',
    accent: 'from-secondary/30 to-clay-beige/20',
  },
  {
    icon: Home,
    title: 'Made for Indian Homes',
    description: 'Microwave-friendly (where specified), easy to clean, and designed to handle daily life.',
    accent: 'from-sage-light to-primary/10',
  },
];

const additionalFeatures = [
  { icon: Award, text: 'Artisan Crafted' },
  { icon: Leaf, text: 'Eco-Conscious' },
  { icon: Heart, text: 'Made with Love' },
];

export function WhyClayzio() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-cream via-background to-muted/30" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <div className="space-y-10">
            <div>
              <span className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                Why Choose Us
              </span>
              <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                Why Clayzio?
              </h2>
              <div className="divider-premium mb-0 ml-0 mr-auto" />
            </div>
            
            {/* Features List */}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex gap-5 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center flex-shrink-0 shadow-soft group-hover:shadow-medium group-hover:scale-105 transition-all duration-300`}>
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              {additionalFeatures.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-soft border border-soft-line/30"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image with testimonial */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated">
              <img
                src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&q=85"
                alt="Clayzio unboxing experience"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
            </div>
            
            {/* Floating testimonial card */}
            <div className="absolute -bottom-8 -left-8 lg:-left-12 glass rounded-2xl p-6 shadow-elevated max-w-xs border border-soft-line/30">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">★</span>
                ))}
              </div>
              <p className="font-display text-lg font-medium text-foreground mb-2 leading-snug">
                "The packaging was so thoughtful! Every piece arrived perfect."
              </p>
              <p className="text-sm text-muted-foreground">
                — Priya S., Mumbai
              </p>
            </div>
            
            {/* Top floating badge */}
            <div className="absolute -top-4 -right-4 glass rounded-full px-5 py-3 shadow-medium border border-soft-line/30">
              <p className="text-sm font-semibold text-foreground">500+ Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}