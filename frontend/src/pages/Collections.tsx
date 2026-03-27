import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    id: 'calm-clay',
    name: 'The Calm Clay Collection',
    description: 'Soft beiges and sage-toned ceramics designed to bring warmth to your coffee tables, consoles, and cozy corners.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    productCount: 12,
  },
  {
    id: 'morning-ritual',
    name: 'Morning Ritual',
    description: 'Start your day right with our collection of mugs and cups designed for your perfect morning brew.',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
    productCount: 8,
  },
  {
    id: 'table-stories',
    name: 'Table Stories',
    description: 'Elevate your dining experience with bowls and plates that make every meal feel special.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
    productCount: 15,
  },
  {
    id: 'green-haven',
    name: 'Green Haven',
    description: 'Beautiful planters and vases to create your own indoor garden sanctuary.',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
    productCount: 10,
  },
];

export default function Collections() {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-secondary">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Our Collections
          </h1>
          <p className="text-muted-foreground text-lg">
            Thoughtfully curated collections for every corner of your home.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="space-y-24">
            {collections.map((collection, index) => (
              <div
                key={collection.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-hover">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <span className="pill-sage mb-4 inline-block">
                    {collection.productCount} Products
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                    {collection.name}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    {collection.description}
                  </p>
                  <Link
                    to={`/shop?collection=${collection.id}`}
                    className="inline-flex items-center gap-2 btn-sage px-6 py-3 rounded-full font-medium"
                  >
                    Explore Collection
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
