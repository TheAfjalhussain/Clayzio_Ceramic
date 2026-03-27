import { Truck, Gift, RotateCcw, Sparkles, Heart, Star, Leaf, Package } from 'lucide-react';

const messages = [
  { icon: Sparkles, text: 'Premium Aesthetic Ceramics' },
  { icon: Truck, text: 'Safe Delivery Across India' },
  { icon: Heart, text: 'Honest Pricing Always' },
  { icon: Gift, text: 'Gift-Ready Packaging' },
  { icon: RotateCcw, text: '7-Day Easy Returns' },
  { icon: Star, text: 'Handcrafted with Love' },
  { icon: Leaf, text: '100% Eco-Friendly' },
  { icon: Package, text: 'Bubble-Wrapped Safety' },
];

export function TopBar() {
  // Duplicate messages for seamless infinite scroll
  const allMessages = [...messages, ...messages];

  return (
    <div className="bg-gradient-to-r from-charcoal via-charcoal/95 to-charcoal text-off-white py-2.5 overflow-hidden relative">
      {/* Gradient edges for smooth fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-charcoal to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-charcoal to-transparent z-10" />
      
      {/* Animated marquee container */}
      <div className="flex animate-marquee-fast whitespace-nowrap">
        {allMessages.map((msg, idx) => {
          const Icon = msg.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 mx-8 text-xs font-medium tracking-wider uppercase text-off-white/90"
            >
              <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{msg.text}</span>
              <span className="mx-6 text-off-white/30">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}