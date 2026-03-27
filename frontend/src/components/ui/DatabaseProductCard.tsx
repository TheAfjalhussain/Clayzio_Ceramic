import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, ImageIcon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/api';

interface DatabaseProductCardProps {
  product: Product;
  className?: string;
}

export function DatabaseProductCard({ product, className }: DatabaseProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const productId = product._id || product.id || '';
  const inWishlist = isInWishlist(productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const originalPrice = product.originalPrice ?? product.original_price;
    addItem({
      id: productId,
      name: product.name,
      price: Number(product.price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const originalPrice = product.originalPrice ?? product.original_price;
    toggleItem({
      id: productId,
      name: product.name,
      price: Number(product.price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const originalPrice = product.originalPrice ?? product.original_price;
  const discount = originalPrice
    ? Math.round(((Number(originalPrice) - Number(product.price)) / Number(originalPrice)) * 100)
    : 0;

  const productImage = product.images?.[0];
  const isNew = product.isNew ?? product.is_new;
  const isBestseller = product.isBestseller ?? product.is_bestseller;
  const inStock = product.inStock ?? product.in_stock ?? true;

  return (
    <Link
      to={`/product/${productId}`}
      className={cn(
        'group block bg-card rounded-3xl overflow-hidden transition-all duration-700 border border-soft-line/30',
        'hover:shadow-elevated hover:-translate-y-3',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted via-muted/50 to-background">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft backdrop-blur-sm">
              New Arrival
            </span>
          )}
          {isBestseller && (
            <span className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shadow-soft">
              Bestseller
            </span>
          )}
          {discount > 0 && (
            <span className="px-4 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold shadow-soft">
              -{discount}% Off
            </span>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={handleToggleWishlist}
            className={cn(
              "w-11 h-11 rounded-full shadow-medium transition-all duration-300 hover:scale-110 flex items-center justify-center",
              inWishlist
                ? "bg-primary text-primary-foreground"
                : "bg-white/95 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
          </button>
          <Link
            to={`/product/${productId}`}
            onClick={(e) => e.stopPropagation()}
            className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 flex items-center justify-center text-foreground"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
        
        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-6 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-elevated",
              inStock
                ? "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                : "bg-muted/80 text-muted-foreground cursor-not-allowed"
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 line-clamp-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-foreground">
            ₹{Number(product.price).toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{Number(originalPrice).toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Rating */}
        {product.rating && Number(product.rating) > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-soft-line/50">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(Number(product.rating))
                      ? "text-primary fill-primary"
                      : "text-muted fill-muted"
                  )}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {Number(product.rating).toFixed(1)} ({product.reviewCount ?? product.review_count ?? 0})
            </span>
          </div>
        )}

        {/* Stock Status */}
        {!inStock && (
          <div className="mt-4 pt-4 border-t border-soft-line/50">
            <span className="text-sm text-destructive font-medium">Out of Stock</span>
          </div>
        )}
      </div>
    </Link>
  );
}