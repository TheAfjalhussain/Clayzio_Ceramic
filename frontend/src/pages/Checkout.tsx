import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CreditCard, Wallet, Building, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ordersApi } from '@/lib/api';

type PaymentMethod = 'card' | 'upi' | 'cod';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, discount, clearCart, couponCode } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = totalPrice + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order via API with proper CreateOrderData format
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
        shipping_address: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.pincode,
        },
        payment_method: paymentMethod,
        subtotal: subtotal,
        discount: discount || 0,
        shipping_cost: shipping,
        total_amount: total,
        coupon_code: couponCode || undefined,
      };

      await ordersApi.create(orderData);

      toast.success('Order placed successfully! Thank you for shopping with Clayzio.');
      clearCart();
      navigate('/');
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="container-custom">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-8">
            Checkout
          </h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Information */}
                <div className="bg-card p-6 rounded-2xl shadow-soft">
                  <h2 className="font-display text-xl font-semibold mb-6">Contact Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card p-6 rounded-2xl shadow-soft">
                  <h2 className="font-display text-xl font-semibold mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="House/Flat No., Street, Locality"
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">PIN Code *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card p-6 rounded-2xl shadow-soft">
                  <h2 className="font-display text-xl font-semibold mb-6">Payment Method</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-colors",
                        paymentMethod === 'card'
                          ? "border-primary bg-primary/5"
                          : "border-soft-line hover:border-muted-foreground"
                      )}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-colors",
                        paymentMethod === 'upi'
                          ? "border-primary bg-primary/5"
                          : "border-soft-line hover:border-muted-foreground"
                      )}
                    >
                      <Wallet className="w-6 h-6" />
                      <span className="font-medium">UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-colors",
                        paymentMethod === 'cod'
                          ? "border-primary bg-primary/5"
                          : "border-soft-line hover:border-muted-foreground"
                      )}
                    >
                      <Building className="w-6 h-6" />
                      <span className="font-medium">COD</span>
                    </button>
                  </div>
                  
                  {paymentMethod === 'cod' && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Cash on Delivery available. Additional ₹49 COD charges may apply.
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card p-6 rounded-2xl shadow-soft sticky top-24">
                  <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3 mb-6 pt-4 border-t border-soft-line">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-4 border-t border-soft-line mb-6">
                    <span className="font-display text-lg font-semibold">Total</span>
                    <span className="font-display text-lg font-semibold">₹{total.toFixed(0)}</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-sage py-4 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
