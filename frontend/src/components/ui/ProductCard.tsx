import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Universal Product type that works with both API and static data
interface ProductCardProduct {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  images: string[];
  short_description?: string;
  shortDescription?: string;
  rating?: number;
  review_count?: number;
  reviewCount?: number;
  in_stock?: boolean;
  inStock?: boolean;
  is_new?: boolean;
  isNew?: boolean;
  is_bestseller?: boolean;
  isBestseller?: boolean;
}

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  // Normalize properties (support both camelCase and snake_case)
  const originalPrice = product.originalPrice ?? product.original_price;
  const shortDescription = product.shortDescription ?? product.short_description ?? '';
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? product.review_count ?? 0;
  const isNew = product.isNew ?? product.is_new ?? false;
  const isBestseller = product.isBestseller ?? product.is_bestseller ?? false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice,
      image: product.images[0],
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice,
      image: product.images[0],
    });
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn('card-product group block', className)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <span className="pill-sage text-xs">New</span>
          )}
          {isBestseller && (
            <span className="pill-clay text-xs">Bestseller</span>
          )}
          {discount > 0 && (
            <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium">
              -{discount}%
            </span>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleWishlist}
            className={cn(
              "p-2.5 rounded-full shadow-soft transition-colors",
              inWishlist
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="p-2.5 bg-card rounded-full shadow-soft hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            className="w-full bg-foreground text-background py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-1">{shortDescription}</p>
        <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">₹{product.price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(rating)
                    ? "text-primary fill-primary"
                    : "text-muted"
                )}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({reviewCount})
          </span>
        </div>
      </div>
    </Link>
  );
}


// import { Link } from 'react-router-dom';
// import { Heart, ShoppingBag, Eye } from 'lucide-react';
// import { useCart } from '@/contexts/CartContext';
// import { useWishlist } from '@/contexts/WishlistContext';
// import { toast } from 'sonner';
// import { cn } from '@/lib/utils';

// // Universal Product type that works with both API and static data
// interface ProductCardProduct {
//   id: string;
//   name: string;
//   price: number;
//   original_price?: number;
//   originalPrice?: number;
//   images: string[];
//   short_description?: string;
//   shortDescription?: string;
//   rating?: number;
//   review_count?: number;
//   reviewCount?: number;
//   in_stock?: boolean;
//   inStock?: boolean;
//   is_new?: boolean;
//   isNew?: boolean;
//   is_bestseller?: boolean;
//   isBestseller?: boolean;
// }

// interface ProductCardProps {
//   product: ProductCardProduct;
//   className?: string;
// }

// export function ProductCard({ product, className }: ProductCardProps) {
//   const { addItem } = useCart();
//   const { isInWishlist, toggleItem } = useWishlist();
//   const inWishlist = isInWishlist(product.id);

//   // Normalize properties (support both camelCase and snake_case)
//   const originalPrice = product.originalPrice ?? product.original_price;
//   const shortDescription = product.shortDescription ?? product.short_description ?? '';
//   const rating = product.rating ?? 0;
//   const reviewCount = product.reviewCount ?? product.review_count ?? 0;
//   const isNew = product.isNew ?? product.is_new ?? false;
//   const isBestseller = product.isBestseller ?? product.is_bestseller ?? false;

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     addItem({
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       originalPrice,
//       image: product.images[0],
//     });
//     toast.success(`${product.name} added to cart`);
//   };

//   const handleToggleWishlist = (e: React.MouseEvent) => {
//     e.preventDefault();
//     toggleItem({
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       originalPrice,
//       image: product.images[0],
//     });
//     toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
//   };

//   const discount = originalPrice
//     ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
//     : 0;

//   return (
//     <Link
//       to={`/product/${product.id}`}
//       className={cn('card-product group block', className)}
//     >
//       {/* Image Container */}
//       <div className="relative aspect-square overflow-hidden bg-muted">
//         <img
//           src={product.images[0]}
//           alt={product.name}
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//         />
        
//         {/* Badges */}
//         <div className="absolute top-4 left-4 flex flex-col gap-2">
//           {isNew && (
//             <span className="pill-sage text-xs">New</span>
//           )}
//           {isBestseller && (
//             <span className="pill-clay text-xs">Bestseller</span>
//           )}
//           {discount > 0 && (
//             <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium">
//               -{discount}%
//             </span>
//           )}
//         </div>
        
//         {/* Quick Actions */}
//         <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           <button
//             onClick={handleToggleWishlist}
//             className={cn(
//               "p-2.5 rounded-full shadow-soft transition-colors",
//               inWishlist
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-card hover:bg-primary hover:text-primary-foreground"
//             )}
//           >
//             <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
//           </button>
//           <Link
//             to={`/product/${product.id}`}
//             className="p-2.5 bg-card rounded-full shadow-soft hover:bg-primary hover:text-primary-foreground transition-colors"
//           >
//             <Eye className="w-4 h-4" />
//           </Link>
//         </div>
        
//         {/* Add to Cart Button */}
//         <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
//           <button
//             onClick={handleAddToCart}
//             className="w-full bg-foreground text-background py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
//           >
//             <ShoppingBag className="w-4 h-4" />
//             Add to Cart
//           </button>
//         </div>
//       </div>
      
//       {/* Product Info */}
//       <div className="p-4">
//         <p className="text-sm text-muted-foreground mb-1">{shortDescription}</p>
//         <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
//           {product.name}
//         </h3>
//         <div className="flex items-center gap-2">
//           <span className="font-semibold text-foreground">₹{product.price}</span>
//           {originalPrice && (
//             <span className="text-sm text-muted-foreground line-through">
//               ₹{originalPrice}
//             </span>
//           )}
//         </div>
        
//         {/* Rating */}
//         <div className="flex items-center gap-1 mt-2">
//           <div className="flex">
//             {[...Array(5)].map((_, i) => (
//               <svg
//                 key={i}
//                 className={cn(
//                   "w-4 h-4",
//                   i < Math.floor(rating)
//                     ? "text-primary fill-primary"
//                     : "text-muted"
//                 )}
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//               </svg>
//             ))}
//           </div>
//           <span className="text-sm text-muted-foreground">
//             ({reviewCount})
//           </span>
//         </div>
//       </div>
//     </Link>
//   );
// }
