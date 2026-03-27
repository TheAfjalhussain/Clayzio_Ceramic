import { useState } from 'react';
import { Instagram, Play, ExternalLink, Heart, MessageCircle, Bookmark } from 'lucide-react';

const instagramReels = [
  {
    id: 1,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=85',
    likes: '12.3k',
    comments: '234',
    caption: 'New ceramic collection drop 🏺✨',
  },
  {
    id: 2,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=85',
    likes: '8.7k',
    comments: '156',
    caption: 'Behind the scenes: glazing process 🎨',
  },
  {
    id: 3,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&q=85',
    likes: '15.1k',
    comments: '312',
    caption: 'Unboxing our signature vases 📦',
  },
  {
    id: 4,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&controls=0&playlist=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500&q=85',
    likes: '9.4k',
    comments: '189',
    caption: 'Home styling tips with ceramics 🏠',
  },
];

const instagramPosts = [
  {
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=85',
    likes: '5.2k',
  },
  {
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&q=85',
    likes: '7.8k',
  },
];

export function InstagramSection() {
  const [activeReel, setActiveReel] = useState<number | null>(null);
  const [hoveredReel, setHoveredReel] = useState<number | null>(null);

  return (
    <section className="section-padding bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,_hsl(var(--primary)/0.05)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,_hsl(var(--secondary)/0.05)_0%,_transparent_50%)]" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2.5 pill-premium mb-6">
            <Instagram className="w-4 h-4 text-primary" />
            <span className="text-foreground/90">@clayzio</span>
          </div>
          <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5">
            See Clayzio in
            <br />
            <span className="font-elegant italic font-normal text-primary">Real Homes</span>
          </h2>
          <div className="divider-premium-lg mb-6" />
          <p className="text-premium text-lg max-w-md mx-auto">
            Follow us on Instagram for styling ideas, new drops & behind-the-scenes moments
          </p>
        </div>
        
        {/* Instagram Reels Grid */}
        <div className="mb-10">
          <h3 className="text-xl font-display font-semibold text-foreground mb-6 flex items-center gap-3">
            <Play className="w-5 h-5 text-primary" />
            Trending Reels
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {instagramReels.map((reel) => (
              <div
                key={reel.id}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer shadow-medium hover:shadow-elevated transition-all duration-500"
                onMouseEnter={() => setHoveredReel(reel.id)}
                onMouseLeave={() => setHoveredReel(null)}
                onClick={() => setActiveReel(activeReel === reel.id ? null : reel.id)}
              >
                {/* Video or Thumbnail */}
                {(hoveredReel === reel.id || activeReel === reel.id) ? (
                  <iframe
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    allow="autoplay; encrypted-media"
                    title={`Reel ${reel.id}`}
                  />
                ) : (
                  <img
                    src={reel.thumbnail}
                    alt={reel.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Play icon indicator */}
                {!(hoveredReel === reel.id || activeReel === reel.id) && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-charcoal/60 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-4 h-4 text-off-white fill-off-white" />
                  </div>
                )}
                
                {/* Reel info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-off-white text-sm font-medium line-clamp-2 mb-3">{reel.caption}</p>
                  <div className="flex items-center gap-4 text-off-white/80 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" />
                      {reel.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {reel.comments}
                    </span>
                  </div>
                </div>
                
                {/* Instagram gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-instagram opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Static Posts Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {instagramPosts.map((post, index) => (
            <a
              key={index}
              href="https://instagram.com/clayzio"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-soft hover:shadow-elevated transition-all duration-500"
            >
              <img
                src={post.image}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/60 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 text-center">
                  <Instagram className="w-6 h-6 text-off-white mx-auto mb-2" />
                  <span className="text-off-white text-sm font-medium">♥ {post.likes}</span>
                </div>
              </div>
            </a>
          ))}
          
          {/* Repeat posts for 6 items on desktop */}
          {instagramPosts.map((post, index) => (
            <a
              key={`repeat-${index}`}
              href="https://instagram.com/clayzio"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-soft hover:shadow-elevated transition-all duration-500 hidden md:block"
            >
              <img
                src={post.image}
                alt={`Instagram post ${index + 3}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/60 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 text-center">
                  <Instagram className="w-6 h-6 text-off-white mx-auto mb-2" />
                  <span className="text-off-white text-sm font-medium">♥ {post.likes}</span>
                </div>
              </div>
            </a>
          ))}
          
          {/* View more card */}
          <a
            href="https://instagram.com/clayzio"
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-soft hover:shadow-elevated transition-all duration-500 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center hidden md:flex"
          >
            <div className="text-center p-4">
              <Instagram className="w-8 h-8 text-foreground mx-auto mb-2" />
              <span className="text-foreground font-medium text-sm">View All</span>
            </div>
          </a>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12 lg:mt-14">
          <a
            href="https://instagram.com/clayzio"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-off-white px-8 py-4 rounded-full font-medium transition-all duration-500 hover:shadow-elevated overflow-hidden relative"
          >
            <Instagram className="relative z-10 w-5 h-5" />
            <span className="relative z-10">Follow @clayzio on Instagram</span>
            <ExternalLink className="relative z-10 w-4 h-4 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </a>
        </div>
      </div>
    </section>
  );
}