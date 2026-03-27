import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, ChevronRight, Share2, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import { ProductInfoTabs } from '@/components/product/ProductInfoTabs';
import { ProductReviews } from '@/components/product/ProductReviews';
import { Product } from '@/lib/api/products';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<{ type: string; value: string; priceAdjustment: number } | null>(null);
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        const productData = await productsApi.getById(id);
        setProduct(productData);
        
        // Fetch related products
        if (productData?.category) {
          const related = await productsApi.getRelated(id, 4);
          setRelatedProducts(related || []);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
      
      setIsLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleVariantChange = useCallback((variant: { type: string; value: string; priceAdjustment: number } | null) => {
    setSelectedVariant(variant);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-32 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to="/shop" 
              className="btn-sage px-8 py-3 rounded-full inline-flex items-center gap-2"
            >
              Continue Shopping
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const productId = product._id || product.id || '';
  const inWishlist = isInWishlist(productId);
  const finalPrice = product.price + (selectedVariant?.priceAdjustment || 0);
  const originalPrice = product.original_price;
  const shortDescription = product.short_description || '';
  const isNew = product.is_new ?? false;
  const isBestseller = product.is_bestseller ?? false;
  const inStock = product.in_stock ?? true;
  const reviewCount = product.review_count ?? 0;
  const rating = product.rating ?? 0;
  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productId,
        name: product.name + (selectedVariant ? ` (${selectedVariant.value})` : ''),
        price: finalPrice,
        originalPrice,
        image: product.images?.[0] || '/placeholder.svg',
      });
    }
    
    setIsAddingToCart(false);
    toast.success(
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img 
            src={product.images[0] || '/placeholder.svg'} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium">{quantity} × {product.name}</p>
          <p className="text-sm text-muted-foreground">Added to cart</p>
        </div>
      </div>
    );
  };

  const handleToggleWishlist = () => {
    toggleItem({
      id: productId,
      name: product.name,
      price: product.price,
      originalPrice,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: shortDescription,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-muted/50 to-muted py-4 border-b border-soft-line">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to={`/shop?category=${product.category}`} className="text-muted-foreground hover:text-primary transition-colors capitalize">
              {product.category.replace('-', ' ')}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Images Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 group">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {isNew && (
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      NEW
                    </span>
                  )}
                  {isBestseller && (
                    <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      BESTSELLER
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      -{discount}%
                    </span>
                  )}
                </div>

                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300",
                        selectedImage === index 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-transparent hover:border-muted-foreground/50"
                      )}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6 lg:py-4">
              <div className="flex flex-wrap gap-2">
                {isNew && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    New Arrival
                  </span>
                )}
                {isBestseller && (
                  <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent-foreground text-sm font-medium px-3 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Bestseller
                  </span>
                )}
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-3 leading-tight">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground">{shortDescription}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5 transition-colors",
                        i < Math.floor(rating)
                          ? "text-amber-400 fill-amber-400"
                          : i < rating
                          ? "text-amber-400 fill-amber-400/50"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-foreground font-semibold">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-4 py-2">
                <span className="font-display text-4xl font-bold text-foreground">
                  ₹{finalPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                      Save ₹{(originalPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <div className="py-4 border-y border-soft-line">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-soft-line rounded-full bg-muted/30">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-muted rounded-l-full transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-muted rounded-r-full transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock || isAddingToCart}
                    className="flex-1 btn-sage px-8 py-4 rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Add to Cart — ₹{(finalPrice * quantity).toLocaleString()}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleToggleWishlist}
                    className={cn(
                      "p-4 rounded-full border-2 transition-all",
                      inWishlist
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-soft-line hover:border-primary hover:text-primary"
                    )}
                  >
                    <Heart className={cn("w-6 h-6", inWishlist && "fill-current")} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="w-full py-4 bg-foreground text-background rounded-full font-semibold text-lg hover:bg-primary transition-colors disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-2xl">
                  <Truck className="w-6 h-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Free Shipping</span>
                  <span className="text-xs text-muted-foreground">Above ₹999</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-2xl">
                  <Shield className="w-6 h-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Secure Pay</span>
                  <span className="text-xs text-muted-foreground">100% Safe</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-2xl">
                  <RotateCcw className="w-6 h-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Easy Returns</span>
                  <span className="text-xs text-muted-foreground">7 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info Tabs */}
          <div className="mt-16">
            <ProductInfoTabs 
              description={product.description || ''}
              careInstructions={product.care_instructions}
              materials={product.materials}
              dimensions={product.dimensions}
              weight={product.weight}
            />
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <ProductReviews productId={product.id} productName={product.name} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl font-semibold text-foreground mb-3">
                  You May Also Like
                </h2>
                <p className="text-muted-foreground">
                  Similar products you might enjoy
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map(relatedProduct => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}











// import { useState, useEffect, useCallback } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { Layout } from '@/components/layout/Layout';
// import { ProductCard } from '@/components/ui/ProductCard';
// import { useCart } from '@/contexts/CartContext';
// import { useWishlist } from '@/contexts/WishlistContext';
// import { toast } from 'sonner';
// import { Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, ChevronRight, Share2, ShoppingBag, Check, Loader2 } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { productsApi } from '@/lib/api';
// import { ProductInfoTabs } from '@/components/product/ProductInfoTabs';
// import { ProductReviews } from '@/components/product/ProductReviews';
// import { Product } from '@/lib/api/products';

// export default function ProductDetail() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [isAddingToCart, setIsAddingToCart] = useState(false);
//   const [product, setProduct] = useState<Product | null>(null);
//   const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedVariant, setSelectedVariant] = useState<{ type: string; value: string; priceAdjustment: number } | null>(null);
//   const { addItem } = useCart();
//   const { isInWishlist, toggleItem } = useWishlist();

//   useEffect(() => {
//     const fetchProduct = async () => {
//       if (!id) return;
      
//       setIsLoading(true);
      
//       try {
//         const productData = await productsApi.getById(id);
//         setProduct(productData);
        
//         // Fetch related products
//         if (productData?.category) {
//           const related = await productsApi.getRelated(id, 4);
//           setRelatedProducts(related || []);
//         }
//       } catch (error) {
//         console.error('Error fetching product:', error);
//       }
      
//       setIsLoading(false);
//     };

//     fetchProduct();
//   }, [id]);

//   const handleVariantChange = useCallback((variant: { type: string; value: string; priceAdjustment: number } | null) => {
//     setSelectedVariant(variant);
//   }, []);

//   if (isLoading) {
//     return (
//       <Layout>
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
//             <p className="text-muted-foreground">Loading product...</p>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   if (!product) {
//     return (
//       <Layout>
//         <div className="container-custom py-32 text-center">
//           <div className="max-w-md mx-auto">
//             <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
//               <ShoppingBag className="w-12 h-12 text-muted-foreground" />
//             </div>
//             <h1 className="font-display text-3xl font-semibold mb-4">Product Not Found</h1>
//             <p className="text-muted-foreground mb-8">
//               The product you're looking for doesn't exist or has been removed.
//             </p>
//             <Link 
//               to="/shop" 
//               className="btn-sage px-8 py-3 rounded-full inline-flex items-center gap-2"
//             >
//               Continue Shopping
//               <ChevronRight className="w-4 h-4" />
//             </Link>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   const productId = product.id;
//   const inWishlist = isInWishlist(productId);
//   const finalPrice = product.price + (selectedVariant?.priceAdjustment || 0);
//   const originalPrice = product.original_price;
//   const shortDescription = product.short_description || '';
//   const isNew = product.is_new ?? false;
//   const isBestseller = product.is_bestseller ?? false;
//   const inStock = product.in_stock ?? true;
//   const reviewCount = product.review_count ?? 0;
//   const rating = product.rating ?? 0;
//   const discount = originalPrice
//     ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
//     : 0;

//   const handleAddToCart = async () => {
//     setIsAddingToCart(true);
    
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     for (let i = 0; i < quantity; i++) {
//       addItem({
//         id: productId,
//         name: product.name + (selectedVariant ? ` (${selectedVariant.value})` : ''),
//         price: finalPrice,
//         originalPrice,
//         image: product.images?.[0] || '/placeholder.svg',
//       });
//     }
    
//     setIsAddingToCart(false);
//     toast.success(
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
//           <img 
//             src={product.images[0] || '/placeholder.svg'} 
//             alt="" 
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div>
//           <p className="font-medium">{quantity} × {product.name}</p>
//           <p className="text-sm text-muted-foreground">Added to cart</p>
//         </div>
//       </div>
//     );
//   };

//   const handleToggleWishlist = () => {
//     toggleItem({
//       id: productId,
//       name: product.name,
//       price: product.price,
//       originalPrice,
//       image: product.images?.[0] || '/placeholder.svg',
//     });
//     toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
//   };

//   const handleShare = async () => {
//     const url = window.location.href;
//     if (navigator.share) {
//       await navigator.share({
//         title: product.name,
//         text: shortDescription,
//         url,
//       });
//     } else {
//       await navigator.clipboard.writeText(url);
//       toast.success('Link copied to clipboard!');
//     }
//   };

//   const handleBuyNow = async () => {
//     await handleAddToCart();
//     navigate('/checkout');
//   };

//   return (
//     <Layout>
//       {/* Breadcrumb */}
//       <div className="bg-gradient-to-r from-muted/50 to-muted py-4 border-b border-soft-line">
//         <div className="container-custom">
//           <nav className="flex items-center gap-2 text-sm">
//             <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
//             <ChevronRight className="w-4 h-4 text-muted-foreground" />
//             <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link>
//             <ChevronRight className="w-4 h-4 text-muted-foreground" />
//             <Link to={`/shop?category=${product.category}`} className="text-muted-foreground hover:text-primary transition-colors capitalize">
//               {product.category.replace('-', ' ')}
//             </Link>
//             <ChevronRight className="w-4 h-4 text-muted-foreground" />
//             <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
//           </nav>
//         </div>
//       </div>

//       <section className="section-padding bg-background">
//         <div className="container-custom">
//           <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
//             {/* Images Gallery */}
//             <div className="space-y-4">
//               <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 group">
//                 {product.images.length > 0 ? (
//                   <img
//                     src={product.images[selectedImage]}
//                     alt={product.name}
//                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center">
//                     <ShoppingBag className="w-24 h-24 text-muted-foreground/30" />
//                   </div>
//                 )}
                
//                 <div className="absolute top-4 left-4 flex flex-col gap-2">
//                   {isNew && (
//                     <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
//                       NEW
//                     </span>
//                   )}
//                   {isBestseller && (
//                     <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
//                       BESTSELLER
//                     </span>
//                   )}
//                   {discount > 0 && (
//                     <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
//                       -{discount}%
//                     </span>
//                   )}
//                 </div>

//                 <button
//                   onClick={handleShare}
//                   className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg"
//                 >
//                   <Share2 className="w-5 h-5" />
//                 </button>
//               </div>

//               {product.images.length > 1 && (
//                 <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
//                   {product.images.map((image, index) => (
//                     <button
//                       key={index}
//                       onClick={() => setSelectedImage(index)}
//                       className={cn(
//                         "w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300",
//                         selectedImage === index 
//                           ? "border-primary ring-2 ring-primary/20" 
//                           : "border-transparent hover:border-muted-foreground/50"
//                       )}
//                     >
//                       <img src={image} alt="" className="w-full h-full object-cover" />
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Product Details */}
//             <div className="space-y-6 lg:py-4">
//               <div className="flex flex-wrap gap-2">
//                 {isNew && (
//                   <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
//                     <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
//                     New Arrival
//                   </span>
//                 )}
//                 {isBestseller && (
//                   <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent-foreground text-sm font-medium px-3 py-1 rounded-full">
//                     <Star className="w-3.5 h-3.5 fill-current" />
//                     Bestseller
//                   </span>
//                 )}
//                 {inStock ? (
//                   <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
//                     <Check className="w-3.5 h-3.5" />
//                     In Stock
//                   </span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
//                     Out of Stock
//                   </span>
//                 )}
//               </div>

//               <div>
//                 <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-3 leading-tight">
//                   {product.name}
//                 </h1>
//                 <p className="text-lg text-muted-foreground">{shortDescription}</p>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-1">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={cn(
//                         "w-5 h-5 transition-colors",
//                         i < Math.floor(rating)
//                           ? "text-amber-400 fill-amber-400"
//                           : i < rating
//                           ? "text-amber-400 fill-amber-400/50"
//                           : "text-muted-foreground/30"
//                       )}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-foreground font-semibold">{rating.toFixed(1)}</span>
//                 <span className="text-muted-foreground">({reviewCount} reviews)</span>
//               </div>

//               <div className="flex items-baseline gap-4 py-2">
//                 <span className="font-display text-4xl font-bold text-foreground">
//                   ₹{finalPrice.toLocaleString()}
//                 </span>
//                 {originalPrice && (
//                   <>
//                     <span className="text-xl text-muted-foreground line-through">
//                       ₹{originalPrice.toLocaleString()}
//                     </span>
//                     <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
//                       Save ₹{(originalPrice - product.price).toLocaleString()}
//                     </span>
//                   </>
//                 )}
//               </div>

//               <div className="py-4 border-y border-soft-line">
//                 <p className="text-muted-foreground leading-relaxed">
//                   {product.description}
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="flex items-center border border-soft-line rounded-full bg-muted/30">
//                     <button
//                       onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                       className="p-3 hover:bg-muted rounded-l-full transition-colors disabled:opacity-50"
//                       disabled={quantity <= 1}
//                     >
//                       <Minus className="w-5 h-5" />
//                     </button>
//                     <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
//                     <button
//                       onClick={() => setQuantity(quantity + 1)}
//                       className="p-3 hover:bg-muted rounded-r-full transition-colors"
//                     >
//                       <Plus className="w-5 h-5" />
//                     </button>
//                   </div>
                  
//                   <button
//                     onClick={handleAddToCart}
//                     disabled={!inStock || isAddingToCart}
//                     className="flex-1 btn-sage px-8 py-4 rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
//                   >
//                     {isAddingToCart ? (
//                       <>
//                         <Loader2 className="w-5 h-5 animate-spin" />
//                         Adding...
//                       </>
//                     ) : (
//                       <>
//                         <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
//                         Add to Cart — ₹{(finalPrice * quantity).toLocaleString()}
//                       </>
//                     )}
//                   </button>
                  
//                   <button
//                     onClick={handleToggleWishlist}
//                     className={cn(
//                       "p-4 rounded-full border-2 transition-all",
//                       inWishlist
//                         ? "bg-primary text-primary-foreground border-primary"
//                         : "border-soft-line hover:border-primary hover:text-primary"
//                     )}
//                   >
//                     <Heart className={cn("w-6 h-6", inWishlist && "fill-current")} />
//                   </button>
//                 </div>

//                 <button
//                   onClick={handleBuyNow}
//                   disabled={!inStock}
//                   className="w-full py-4 bg-foreground text-background rounded-full font-semibold text-lg hover:bg-primary transition-colors disabled:opacity-50"
//                 >
//                   Buy Now
//                 </button>
//               </div>

//               <div className="grid grid-cols-3 gap-4 pt-6">
//                 <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-2xl">
//                   <Truck className="w-6 h-6 text-primary mb-2" />
//                   <span className="text-sm font-medium">Free Shipping</span>
//                   <span className="text-xs text-muted-foreground">Above ₹999</span>
//                 </div>
//                 <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-2xl">
//                   <Shield className="w-6 h-6 text-primary mb-2" />
//                   <span className="text-sm font-medium">Secure Pay</span>
//                   <span className="text-xs text-muted-foreground">100% Safe</span>
//                 </div>
//                 <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-2xl">
//                   <RotateCcw className="w-6 h-6 text-primary mb-2" />
//                   <span className="text-sm font-medium">Easy Returns</span>
//                   <span className="text-xs text-muted-foreground">7 Days</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Product Info Tabs */}
//           <div className="mt-16">
//             <ProductInfoTabs 
//               description={product.description || ''}
//               careInstructions={product.care_instructions}
//               materials={product.materials}
//               dimensions={product.dimensions}
//               weight={product.weight}
//             />
//           </div>

//           {/* Reviews Section */}
//           <div className="mt-16">
//             <ProductReviews productId={product.id} productName={product.name} />
//           </div>

//           {/* Related Products */}
//           {relatedProducts.length > 0 && (
//             <div className="mt-20">
//               <div className="text-center mb-10">
//                 <h2 className="font-display text-3xl font-semibold text-foreground mb-3">
//                   You May Also Like
//                 </h2>
//                 <p className="text-muted-foreground">
//                   Similar products you might enjoy
//                 </p>
//               </div>
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//                 {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map(relatedProduct => (
//                   <ProductCard key={relatedProduct.id} product={relatedProduct} />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//     </Layout>
//   );
// }
