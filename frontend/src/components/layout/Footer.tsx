import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { contactApi } from '@/lib/api';
import clayzioLogo from '@/assets/clayzio-logo.png';

const footerLinks = {
  shop: [
    { name: 'Mugs & Cups', href: '/shop?category=mugs-cups' },
    { name: 'Bowls & Plates', href: '/shop?category=bowls-plates' },
    { name: 'Vases & Décor', href: '/shop?category=vases-decor' },
    { name: 'Gift Sets', href: '/shop?category=gift-sets' },
    { name: 'All Collections', href: '/collections' },
    { name: 'Business', href: '/business' },
  ],
  help: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping & Delivery', href: '/shipping' },
    { name: 'Returns & Refunds', href: '/returns' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Ceramic Care Guide', href: '/care-guide' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      await contactApi.subscribeNewsletter(email);
      toast.success('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-off-white pt-16 pb-8">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img src={clayzioLogo} alt="Clayzio" className="h-10 brightness-0 invert" />
            </Link>
            <p className="text-off-white/70 text-sm leading-relaxed mb-6">
              Handcrafted ceramic pieces that bring warmth and artistry to your everyday life. 
              Each creation tells a story of tradition, love, and craftsmanship.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/clayziohome" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 rounded-full bg-off-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/clayzio" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-full bg-off-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://x.com/clayzio" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-full bg-off-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@theclayzio" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-full bg-off-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-off-white/70 hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-off-white/70 hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6">Stay Connected</h4>
            <p className="text-off-white/70 text-sm mb-4">
              Subscribe for exclusive offers, new arrivals, and artisan stories.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pr-12 bg-off-white/10 border border-off-white/20 rounded-full text-off-white placeholder:text-off-white/50 focus:outline-none focus:border-primary transition-colors text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </form>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <a href="tel:+919955400841" className="flex items-center gap-3 text-off-white/70 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+91 9955400841</span>
              </a>
              <a href="mailto:infoclayzio@gmail.com" className="flex items-center gap-3 text-off-white/70 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>infoclayzio@gmail.com</span>
              </a>
              <p className="flex items-start gap-3 text-off-white/70"> <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>Munda Khera Road Khurja, Khurja, Uttar Pradesh, India</span> </p>
              <address className="not-italic">
                <a
                  href="https://maps.app.goo.gl/PZPAkaWbBmCqyL947"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-off-white/70 hover:text-primary transition-colors"
                >
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>
                    Bundelkhand, Par Nawada,Nawada, Bihar, India (805110)
                  </span>
                </a>
              </address>

            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-8 border-t border-off-white/10 mb-8">
          <div className="flex items-center gap-2 text-off-white/60 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>100% Handcrafted</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Heart
              className="w-4 h-4 text-red-500 fill-red-500 animate-pulse"
              aria-hidden="true"
            />
            <span className="tracking-wide">
              Made with <span className="font-medium text-white">Love</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-off-white/60 text-sm">
            <span>🇮🇳</span>
            <span>Proudly Indian</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-off-white/10 text-sm text-off-white/60">
          <p>© {currentYear} Clayzio. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="https://www.growthix.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/70 hover:text-primary transition-colors duration-300"
            >
              Build By :
              <b className="text-blue-400"> Growthix.in</b>
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
