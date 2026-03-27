import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    });
    removeItem(item.id);
    toast.success(`${item.name} moved to cart`);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-custom text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Save items you love by clicking the heart icon on any product.
            </p>
            <Link
              to="/shop"
              className="btn-sage px-8 py-3 rounded-full font-medium inline-block"
            >
              Explore Products
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
            My Wishlist ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl overflow-hidden shadow-soft group"
              >
                <div className="relative aspect-square">
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => {
                      removeItem(item.id);
                      toast.success('Removed from wishlist');
                    }}
                    className="absolute top-3 right-3 p-2 bg-card rounded-full shadow-soft hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-4">
                  <Link
                    to={`/product/${item.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors block mb-2"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-semibold">₹{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-full font-medium hover:bg-foreground/90 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
