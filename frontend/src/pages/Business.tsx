import { Layout } from '@/components/layout/Layout';
import { Building2, Factory, Palette, UtensilsCrossed, Users, FileText, Download, Phone, Mail, ArrowRight, CheckCircle2, Star, Package, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { contactApi } from '@/lib/api';

const services = [
  {
    icon: Package,
    title: 'Bulk Orders',
    description: 'Large quantity orders for businesses, events, and corporate gifting with competitive wholesale pricing.',
    features: ['Minimum 50 pieces', 'Volume discounts', 'Dedicated account manager', 'Priority shipping'],
  },
  {
    icon: Factory,
    title: 'Manufacturing',
    description: 'Custom manufacturing capabilities for brands looking to create their own ceramic product lines.',
    features: ['Private label options', 'Quality control', 'Scalable production', 'Material expertise'],
  },
  {
    icon: Palette,
    title: 'Customization',
    description: 'Design your own unique ceramic pieces with custom colors, glazes, patterns, and branding.',
    features: ['Logo engraving', 'Custom colors', 'Unique designs', 'Brand packaging'],
  },
  {
    icon: UtensilsCrossed,
    title: 'Hotels & Restaurants',
    description: 'Premium tableware solutions for hospitality industry with durability and elegance.',
    features: ['Commercial grade', 'Replacement warranty', 'Bulk pricing', 'Design consultation'],
  },
];

const partners = [
  { name: 'Taj Hotels', type: 'Luxury Hotel Chain' },
  { name: 'ITC Hotels', type: 'Hospitality Group' },
  { name: 'The Oberoi Group', type: 'Premium Hotels' },
  { name: 'Café Coffee Day', type: 'Restaurant Chain' },
  { name: 'Fabindia', type: 'Retail Partner' },
  { name: 'Taneira', type: 'Lifestyle Brand' },
];

const stats = [
  { value: '500+', label: 'Business Partners' },
  { value: '50K+', label: 'Products Delivered' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '15+', label: 'Years Experience' },
];

export default function Business() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    serviceType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contactApi.submit({
        name: `${formData.companyName} - ${formData.contactPerson}`,
        email: formData.email,
        phone: formData.phone,
        subject: `Business Inquiry: ${formData.serviceType}`,
        message: formData.message,
      });

      toast.success('Thank you for your inquiry! Our business team will contact you within 24 hours.');
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        serviceType: '',
        message: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&q=85" 
            alt="Ceramic manufacturing" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/40" />
        </div>
        
        <div className="container-custom relative z-10 py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Business Solutions
            </span>
            <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              Partner with Clayzio for Premium Ceramics
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              From bulk orders to custom manufacturing, we bring artisanal excellence to your business. Trusted by India's leading hotels, restaurants, and brands.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#inquiry" className="btn-premium px-8 py-4 rounded-full inline-flex items-center gap-2 group">
                <span>Get a Quote</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/clayzio-business-brochure.pdf" 
                download
                className="px-8 py-4 rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Brochure
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-soft-line">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
              Our Services
            </span>
            <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5">
              Business Solutions
            </h2>
            <div className="divider-premium-lg mb-6" />
            <p className="text-premium text-lg max-w-2xl mx-auto">
              Comprehensive ceramic solutions tailored to your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-card rounded-3xl p-8 lg:p-10 border border-soft-line hover:shadow-elevated transition-all duration-500 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hospitality Partners */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
              Trusted Partners
            </span>
            <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5">
              Our Hospitality Network
            </h2>
            <div className="divider-premium-lg mb-6" />
            <p className="text-premium text-lg max-w-2xl mx-auto">
              Serving India's most prestigious hotels and restaurants
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners.map((partner, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 text-center border border-soft-line hover:shadow-soft transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-1">{partner.name}</h4>
                <p className="text-xs text-muted-foreground">{partner.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brochure Download Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-sage relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(var(--sage)/0.3)_0%,_transparent_50%)]" />
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center lg:text-left">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-white mb-4">
                Download Our Business Brochure
              </h3>
              <p className="text-white/80 text-lg mb-6">
                Get detailed information about our products, pricing, customization options, and partnership opportunities.
              </p>
              <a 
                href="/clayzio-business-brochure.pdf" 
                download
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-foreground rounded-full font-medium hover:bg-white/90 transition-all shadow-elevated group"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF Brochure</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h4 className="font-display text-xl text-white mb-4">Brochure Includes:</h4>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-white/60" />
                  Complete product catalog
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-white/60" />
                  Wholesale pricing tiers
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-white/60" />
                  Customization options
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-white/60" />
                  Manufacturing capabilities
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-white/60" />
                  Partnership benefits
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="section-padding bg-background">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                Get in Touch
              </span>
              <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5">
                Business Inquiry
              </h2>
              <div className="divider-premium-lg mb-6" />
              <p className="text-premium text-lg max-w-xl mx-auto">
                Tell us about your requirements and our team will get back to you within 24 hours
              </p>
            </div>

            <div className="bg-card rounded-3xl p-8 lg:p-12 border border-soft-line shadow-soft">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Your company name"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contact Person *</label>
                    <Input
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Your name"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Service Required *</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    required
                    className="w-full h-12 rounded-xl border border-input bg-background px-4 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a service</option>
                    <option value="Bulk Orders">Bulk Orders</option>
                    <option value="Manufacturing">Manufacturing Partnership</option>
                    <option value="Customization">Custom Design & Branding</option>
                    <option value="Hospitality">Hotels & Restaurants</option>
                    <option value="Corporate Gifting">Corporate Gifting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your requirements, quantities, timelines, etc."
                    required
                    rows={5}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-full text-lg font-medium bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="mt-12 grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-soft-line">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Line</p>
                  <a href="tel:+919876543211" className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors">
                    +91 98765 43211
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-soft-line">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Email</p>
                  <a href="mailto:business@clayzio.com" className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors">
                    business@clayzio.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
