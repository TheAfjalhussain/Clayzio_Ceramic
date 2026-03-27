import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, X, ShoppingBag, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    totalPrice, 
    couponCode, 
    applyCoupon, 
    removeCoupon, 
    discount 
  } = useCart();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      toast.success('Coupon applied successfully!');
      setCouponInput('');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-custom text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/shop"
              className="btn-sage px-8 py-3 rounded-full font-medium inline-block"
            >
              Start Shopping
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="container-custom">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-8">
            Shopping Cart
          </h1>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 md:gap-6 p-4 bg-card rounded-2xl shadow-soft"
                >
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center border border-soft-line rounded-full">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted rounded-l-full transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted rounded-r-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹{item.price * item.quantity}
                        </p>
                        {item.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            ₹{item.originalPrice * item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-2xl shadow-soft sticky top-24">
                <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
                
                {/* Coupon */}
                <div className="mb-6">
                  {couponCode ? (
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">{couponCode}</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code"
                        className="flex-1 px-4 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders over ₹999
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between py-4 border-t border-soft-line mb-6">
                  <span className="font-display text-lg font-semibold">Total</span>
                  <span className="font-display text-lg font-semibold">₹{total.toFixed(0)}</span>
                </div>
                
                <Link
                  to="/checkout"
                  className="w-full btn-sage py-4 rounded-full font-medium text-center block"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/shop"
                  className="w-full text-center block mt-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
