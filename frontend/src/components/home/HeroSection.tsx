import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, Star, Sparkles, ArrowRight, Play } from 'lucide-react';

const heroSlides = [
  {
    image: './banner/planter.jpg',
    title: 'Handcrafted Planters',
    subtitle: 'Bring Nature Indoors',
    description: 'Beautiful ceramic planters for your indoor garden',
    cta: 'Shop Planters',
    link: '/shop?category=planters',
  },
  {
    image: './banner/image1.png',
    title: 'Artisan Tableware',
    subtitle: 'New Arrivals',
    description: 'Elevate your dining experience with our curated collection',
    cta: 'Explore Tableware',
    link: '/shop?category=tableware',
  },
  {
    image: './banner/image2.png',
    title: 'Warm Ceramics for Calm Homes',
    subtitle: 'The Calm Clay Collection',
    description: 'Handcrafted pieces that bring warmth and tranquility to your space',
    cta: 'Shop Collection',
    link: '/shop?category=vases',
  },
  {
    image: './banner/image.png',
    title: 'Statement Décor Pieces',
    subtitle: 'Featured Collection',
    description: 'Transform your home with handpicked decorative ceramics',
    cta: 'View Décor',
    link: '/shop?category=decor',
  },
  {
    image: './banner/image5.png',
    title: 'Gift-Ready Sets',
    subtitle: 'Perfect for Every Occasion',
    description: 'Thoughtfully curated ceramic gift sets with premium packaging',
    cta: 'Shop Gifts',
    link: '/shop?category=gifts',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((currentSlide + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleSlideChange = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const nextSlide = () => handleSlideChange((currentSlide + 1) % heroSlides.length);
  const prevSlide = () => handleSlideChange((currentSlide - 1 + heroSlides.length) % heroSlides.length);

  return (
    <section className="relative h-[100svh] min-h-[350px] max-h-[580px] overflow-hidden">
      {/* Full-screen Image Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/50 via-charcoal/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/20" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            {/* Animated badge */}
            <div
              key={`badge-${currentSlide}`}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-up"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-off-white/90 text-xs font-medium tracking-wide uppercase">
                {heroSlides[currentSlide].subtitle}
              </span>
            </div>

            {/* Main heading */}
            <h1
              key={`title-${currentSlide}`}
              className="heading-display text-xl sm:text-2xl md:text-4xl lg:text-6xl text-off-white mb-6 animate-fade-up"
              style={{ animationDelay: '100ms' }}
            >
              {heroSlides[currentSlide].title}
            </h1>

            {/* Description */}
            <p
              key={`desc-${currentSlide}`}
              className="text-md md:text-lg text-off-white/80 mb-10 max-w-lg leading-relaxed animate-fade-up"
              style={{ animationDelay: '200ms' }}
            >
              {heroSlides[currentSlide].description}
            </p>

            {/* CTA Buttons */}
            <div
              key={`cta-${currentSlide}`}
              className="flex flex-wrap gap-4 animate-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                to={heroSlides[currentSlide].link}
                className="group relative px-8 py-3 rounded-md font-medium text-lg inline-flex items-center gap-3 bg-primary text-primary-foreground overflow-hidden transition-all duration-500 hover:shadow-elevated hover:scale-105"
              >
                <span className="relative z-10">{heroSlides[currentSlide].cta}</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/collections"
                className="group px-4 py-3 rounded-full font-medium text-md border-2 border-off-white/40 text-off-white bg-white/5 backdrop-blur-sm hover:bg-white/20 hover:border-off-white transition-all duration-500 inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Explore All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute top-1/4 right-8 lg:right-16 hidden lg:block animate-float">
        <div className="glass px-5 py-3 rounded-2xl flex items-center gap-3 shadow-elevated border border-white/20">
          <div className="p-2.5 rounded-xl bg-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Safe Packaging</p>
            <p className="text-xs text-muted-foreground">Bubble wrapped</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-1/3 right-8 lg:right-24 hidden lg:block animate-float-slow">
        <div className="glass px-5 py-3 rounded-2xl flex items-center gap-3 shadow-elevated border border-white/20">
          <div className="p-2.5 rounded-xl bg-primary/20">
            <Star className="w-5 h-5 text-primary fill-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">4.8 Rated</p>
            <p className="text-xs text-muted-foreground">500+ reviews</p>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Slide indicators */}
            <div className="flex items-center gap-3">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`relative h-1 rounded-full transition-all duration-500 overflow-hidden ${
                    index === currentSlide ? 'w-12 bg-white/30' : 'w-3 bg-white/20 hover:bg-white/40'
                  }`}
                >
                  {index === currentSlide && (
                    <div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      style={{
                        animation: 'progress 5s linear forwards',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Arrow controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-off-white hover:bg-white/20 transition-all border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-off-white/60 text-sm font-medium min-w-[60px] text-center">
                {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
              </span>
              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-off-white hover:bg-white/20 transition-all border border-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar animation keyframes */}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}