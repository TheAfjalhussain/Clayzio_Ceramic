import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Aditi Sharma',
    location: 'Bangalore',
    rating: 5,
    text: 'Loved the packaging and the mug feels so premium. Clayzio is my new go-to gift brand. The quality exceeded my expectations!',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    product: 'Calm Clay Mug Set',
  },
  {
    id: 2,
    name: 'Rohit Mehta',
    location: 'Mumbai',
    rating: 5,
    text: 'Finally found ceramics that match my minimalist home aesthetic. The bowls are absolutely gorgeous and feel great in hand.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    product: 'Sage Bowl Collection',
  },
  {
    id: 3,
    name: 'Priya Nair',
    location: 'Delhi',
    rating: 5,
    text: 'The Calm Clay collection transformed my living room. Every guest asks where I got these beautiful vases from!',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    product: 'Statement Vase',
  },
  {
    id: 4,
    name: 'Arjun Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: "Ordered a gift set for my sister's housewarming. She was thrilled! The presentation was perfect and delivery was safe.",
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    product: 'Premium Gift Set',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5">
            Stories from Our
            <br />
            <span className="font-elegant italic font-normal">Customers</span>
          </h2>
          <div className="divider-premium-lg mb-6" />
          <p className="text-premium text-lg">
            Join thousands of happy homes
          </p>
        </div>
        
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group bg-card p-6 lg:p-7 rounded-2xl lg:rounded-3xl shadow-soft hover:shadow-elevated transition-all duration-500 border border-soft-line/30 relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Quote className="w-5 h-5 text-primary" />
              </div>
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              
              {/* Text */}
              <p className="text-foreground mb-6 leading-relaxed text-sm lg:text-base">
                "{testimonial.text}"
              </p>
              
              {/* Product tag */}
              <div className="mb-5">
                <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  {testimonial.product}
                </span>
              </div>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-11 h-11 rounded-full object-cover shadow-soft"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="bg-card p-6 rounded-2xl shadow-soft border border-soft-line/30">
            <div className="flex gap-1 mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-primary fill-primary" />
              ))}
            </div>
            <p className="text-foreground mb-6 leading-relaxed">
              "{testimonials[currentIndex].text}"
            </p>
            <div className="mb-4">
              <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                {testimonials[currentIndex].product}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={testimonials[currentIndex].image}
                alt={testimonials[currentIndex].name}
                className="w-12 h-12 rounded-full object-cover shadow-soft"
              />
              <div>
                <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[currentIndex].location}</p>
              </div>
            </div>
          </div>
          
          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="p-3 bg-card rounded-full shadow-soft hover:shadow-medium hover:bg-primary/10 transition-all border border-soft-line/30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="p-3 bg-card rounded-full shadow-soft hover:shadow-medium hover:bg-primary/10 transition-all border border-soft-line/30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Read more link */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 text-foreground font-medium group">
            <span className="border-b-2 border-foreground/30 group-hover:border-primary transition-colors pb-0.5">
              Read more reviews
            </span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}