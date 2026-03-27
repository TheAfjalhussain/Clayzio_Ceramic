import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const values = [
  'Honest Pricing',
  'Slow, thoughtful curation',
  'Respect for craft & makers',
  'Sustainable packaging',
];

export function BrandStory() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-light via-background to-muted/50" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated">
              <img
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=85"
                alt="Clayzio artisan at work"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative frame */}
            <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] -z-10" />
          </div>
          
          {/* Content */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <span className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                Our Story
              </span>
              <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                Our Clay,
                <br />
                <span className="font-elegant italic font-normal">Your Story.</span>
              </h2>
            </div>
            
            <div className="space-y-5">
              <p className="text-premium text-lg leading-relaxed">
                Clayzio was born from a simple idea—ceramics should feel personal, warm, and grounded. We work closely with trusted makers and small units around Khurja to bring you designs that feel like home, not mass factory stock.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Every piece is selected with intention, ensuring quality craftsmanship meets modern aesthetics. We believe in transparency, fair prices, and celebrating the hands that shape each creation.
              </p>
            </div>
            
            {/* Values list */}
            <ul className="space-y-4 pt-2">
              {values.map((value, index) => (
                <li key={index} className="flex items-center gap-4 group">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{value}</span>
                </li>
              ))}
            </ul>
            
            {/* CTA */}
            <Link
              to="/about"
              className="inline-flex items-center gap-3 text-foreground font-medium group pt-4"
            >
              <span className="border-b-2 border-foreground/30 group-hover:border-primary transition-colors pb-0.5">
                Read Our Full Story
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-primary transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}