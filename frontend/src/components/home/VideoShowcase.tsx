import { useState } from 'react';
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export function VideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <section className="section-padding bg-charcoal relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.1)_0%,_transparent_60%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-off-white/90 text-sm font-medium tracking-wide uppercase">Watch Our Story</span>
          </div>
          <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-off-white mb-5">
            Experience the Art of
            <br />
            <span className="font-elegant italic font-normal text-primary">Handcrafted Ceramics</span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6" />
          <p className="text-off-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Go behind the scenes and discover the passion, skill, and artistry that goes into every piece at Clayzio
          </p>
        </div>
        
        {/* Video Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 rounded-[2.5rem] blur-2xl opacity-50" />
          
          <div className="relative aspect-video rounded-2xl lg:rounded-3xl overflow-hidden shadow-elevated">
            {!isPlaying ? (
              // Thumbnail with play button
              <div className="relative w-full h-full group cursor-pointer" onClick={handlePlayClick}>
                <img
                  src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1400&q=90"
                  alt="Clayzio ceramic crafting"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-charcoal/40 group-hover:bg-charcoal/30 transition-colors duration-500" />
                
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Ripple effect */}
                    <div className="absolute inset-0 animate-ping-slow">
                      <div className="w-24 h-24 rounded-full bg-primary/30" />
                    </div>
                    <button className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Play className="w-10 h-10 text-primary-foreground fill-primary-foreground ml-1" />
                    </button>
                  </div>
                </div>
                
                {/* Video info */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <p className="text-off-white text-lg font-semibold mb-1">The Making of Clayzio</p>
                    <p className="text-off-white/70 text-sm">3:45 • Behind the Scenes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full glass-dark text-off-white text-sm font-medium">
                      HD Quality
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Embedded YouTube Video
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=1&modestbranding=1&rel=0"
                title="Clayzio Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
        
        {/* Stats below video */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          {[
            { value: '500+', label: 'Happy Customers' },
            { value: '50+', label: 'Unique Designs' },
            { value: '100%', label: 'Handcrafted' },
            { value: '4.8★', label: 'Average Rating' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl lg:text-4xl font-display font-semibold text-primary mb-2">{stat.value}</p>
              <p className="text-off-white/60 text-sm uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}