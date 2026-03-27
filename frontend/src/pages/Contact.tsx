import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Loader2, Send } from 'lucide-react';
import { contactApi } from '@/lib/api';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await contactApi.submit(formData);
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-primary to-primary/70 to-muted overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(var(--sage)/0.2)_0%,_transparent_50%)]" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-white font-medium mb-4">
            Contact Us
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
            Get in Touch
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Have a question, feedback, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
          
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card p-8 lg:p-10 rounded-3xl shadow-soft border border-soft-line">
                <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-2">Send us a Message</h2>
                <p className="text-muted-foreground mb-8">Fill out the form and we'll get back to you as soon as possible.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-muted/50 rounded-xl border border-soft-line focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-muted/50 rounded-xl border border-soft-line focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-muted/50 rounded-xl border border-soft-line focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-muted/50 rounded-xl border border-soft-line focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      >
                        <option value="">Select a subject</option>
                        <option value="order">Order Inquiry</option>
                        <option value="product">Product Question</option>
                        <option value="wholesale">Wholesale/Bulk Orders</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3.5 bg-muted/50 rounded-xl border border-soft-line focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                      placeholder="Tell us how we can help..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto btn-sage px-10 py-4 rounded-full font-medium inline-flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-card to-muted/30 p-6 rounded-2xl shadow-soft border border-soft-line hover:shadow-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">Email Us</h3>
                    <a href="mailto:infoclayzio@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                      infoclayzio@gmail.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">We reply within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-card to-muted/30 p-6 rounded-2xl shadow-soft border border-soft-line hover:shadow-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage to-sage/70 flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Phone className="w-6 h-6 text-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">Call Us</h3>
                    <a href="tel:+919955400841" className="text-muted-foreground hover:text-primary transition-colors">
                      +91 9955400841
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">Mon-Sat, 10am-7pm</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-card to-muted/30 p-6 rounded-2xl shadow-soft border border-soft-line hover:shadow-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center flex-shrink-0 shadow-soft">
                    <MapPin className="w-6 h-6 text-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">Bihar Address</h3>
                    <p className="text-muted-foreground">
                      Bundelkhand, Par nawada, Nawada,
                      Bihar, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-card to-muted/60 p-6 rounded-2xl shadow-soft border border-soft-line hover:shadow-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/20 flex items-center justify-center flex-shrink-0 shadow-soft">
                    <MapPin className="w-6 h-6 text-charcoal" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">U.P Address</h3>
                    <p className="text-muted-foreground">
                      Munda Khera Road Khurja, Khurja,
                      Uttar Pradesh, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-card to-muted/30 p-6 rounded-2xl shadow-soft border border-soft-line hover:shadow-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Mon - Sat: 10am - 7pm<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative h-[420px] w-full overflow-hidden rounded-xl border bg-muted">
  
  {/* Google Map Embed */}
  <iframe
    title="Growthix Location"
    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3619.2782526308274!2d85.5458028!3d24.8884887!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f2ffc15beee847%3A0x60777084edc12f99!2sClayzio!5e0!3m2!1sen!2sin!4v1768662649968!5m2!1sen!2sin"
    className="absolute inset-0 h-full w-full border-0"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />

</section>

    </Layout>
  );
}
