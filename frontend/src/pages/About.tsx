import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const values = [
  {
    title: 'Honest Pricing',
    description: 'No inflated MRPs. No confusing discounts. Just fair prices for quality craftsmanship.',
  },
  {
    title: 'Thoughtful Curation',
    description: 'Every piece is carefully selected for its design, quality, and ability to bring warmth to your home.',
  },
  {
    title: 'Artisan Partnerships',
    description: 'We work directly with skilled craftspeople in Khurja, ensuring fair wages and preserving traditional techniques.',
  },
  {
    title: 'Sustainable Practices',
    description: 'From recycled packaging materials to supporting small-batch production, we prioritize the planet.',
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-secondary">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <span className="pill-sage mb-6 inline-block">Our Story</span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
            Crafting Warmth for Indian Homes
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Clayzio was born from a simple belief—your home deserves beautiful things at honest prices.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-hover">
                <img
                  src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"
                  alt="Clayzio ceramics workshop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
                Our Beginning
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  It started with a frustrating shopping experience. Beautiful ceramics with absurd price tags, or affordable options that looked mass-produced and soulless. Where was the middle ground?
                </p>
                <p>
                  We set out to find it. Our search led us to Khurja—India's pottery capital—where generations of artisans have been shaping clay into art. But many of these craftspeople struggled to reach modern consumers, while buyers had no direct access to their work.
                </p>
                <p>
                  Clayzio bridges this gap. We work directly with skilled makers, eliminating middlemen to offer you premium aesthetic ceramics at prices that make sense. Every piece is thoughtfully designed for modern Indian homes while honoring traditional craftsmanship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-sage-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              What We Stand For
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              More than a brand, Clayzio is a promise—to makers, to you, and to the craft we love.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="bg-card p-6 rounded-2xl shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Explore our collection of handpicked ceramics and bring warmth to your home.
          </p>
          <Link
            to="/shop"
            className="btn-sage px-8 py-4 rounded-full font-medium text-lg inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </Layout>
  );
}
