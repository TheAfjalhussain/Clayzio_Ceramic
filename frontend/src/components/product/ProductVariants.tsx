import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { Check } from 'lucide-react';

interface ProductVariantsProps {
  productId: string;
  onVariantChange: (variant: { type: string; value: string; priceAdjustment: number } | null) => void;
}

interface Variant {
  id: string;
  variant_type: string;
  variant_value: string;
  price_adjustment: number;
  stock_quantity: number;
  is_available: boolean;
}

const colorMap: Record<string, string> = {
  'white': '#FFFFFF',
  'cream': '#FFFDD0',
  'beige': '#D9C3A5',
  'sage': '#A8B8A2',
  'terracotta': '#E2725B',
  'charcoal': '#333333',
  'navy': '#000080',
  'blush': '#FFB6C1',
  'olive': '#808000',
  'sand': '#C2B280',
  'clay': '#B66A50',
  'forest': '#228B22',
};

export function ProductVariants({ productId, onVariantChange }: ProductVariantsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { data: variants } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      const data = await productsApi.getVariants(productId);
      return data.filter((v: Variant) => v.is_available) as Variant[];
    },
  });

  const sizes = variants?.filter(v => v.variant_type === 'size') || [];
  const colors = variants?.filter(v => v.variant_type === 'color') || [];

  useEffect(() => {
    if (selectedSize || selectedColor) {
      const selected = variants?.find(v => 
        (v.variant_type === 'size' && v.variant_value === selectedSize) ||
        (v.variant_type === 'color' && v.variant_value === selectedColor)
      );
      if (selected) {
        onVariantChange({
          type: selected.variant_type,
          value: selected.variant_value,
          priceAdjustment: selected.price_adjustment || 0,
        });
      }
    } else {
      onVariantChange(null);
    }
  }, [selectedSize, selectedColor, variants, onVariantChange]);

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Size</label>
            {selectedSize && (
              <span className="text-sm text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{selectedSize}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedSize(selectedSize === variant.variant_value ? null : variant.variant_value)}
                disabled={variant.stock_quantity === 0}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                  selectedSize === variant.variant_value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50",
                  variant.stock_quantity === 0 && "opacity-50 cursor-not-allowed line-through"
                )}
              >
                {variant.variant_value}
                {variant.price_adjustment > 0 && (
                  <span className="text-xs ml-1 opacity-70">+₹{variant.price_adjustment}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Color</label>
            {selectedColor && (
              <span className="text-sm text-muted-foreground">
                Selected: <span className="font-medium text-foreground capitalize">{selectedColor}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((variant) => {
              const colorValue = colorMap[variant.variant_value.toLowerCase()] || variant.variant_value;
              const isLight = ['white', 'cream', 'beige', 'blush', 'sand'].includes(variant.variant_value.toLowerCase());
              
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedColor(selectedColor === variant.variant_value ? null : variant.variant_value)}
                  disabled={variant.stock_quantity === 0}
                  className={cn(
                    "relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                    selectedColor === variant.variant_value
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-border hover:border-primary/50",
                    variant.stock_quantity === 0 && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: colorValue }}
                  title={variant.variant_value}
                >
                  {selectedColor === variant.variant_value && (
                    <Check className={cn("w-5 h-5", isLight ? "text-foreground" : "text-white")} />
                  )}
                  {variant.stock_quantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-destructive rotate-45" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}









// import { useState, useEffect } from 'react';
// import { cn } from '@/lib/utils';
// import { useQuery } from '@tanstack/react-query';
// import { supabase } from '@/integrations/supabase/client';
// import { Check } from 'lucide-react';

// interface ProductVariantsProps {
//   productId: string;
//   onVariantChange: (variant: { type: string; value: string; priceAdjustment: number } | null) => void;
// }

// interface Variant {
//   id: string;
//   variant_type: string;
//   variant_value: string;
//   price_adjustment: number;
//   stock_quantity: number;
//   is_available: boolean;
// }

// const colorMap: Record<string, string> = {
//   'white': '#FFFFFF',
//   'cream': '#FFFDD0',
//   'beige': '#D9C3A5',
//   'sage': '#A8B8A2',
//   'terracotta': '#E2725B',
//   'charcoal': '#333333',
//   'navy': '#000080',
//   'blush': '#FFB6C1',
//   'olive': '#808000',
//   'sand': '#C2B280',
//   'clay': '#B66A50',
//   'forest': '#228B22',
// };

// export function ProductVariants({ productId, onVariantChange }: ProductVariantsProps) {
//   const [selectedSize, setSelectedSize] = useState<string | null>(null);
//   const [selectedColor, setSelectedColor] = useState<string | null>(null);

//   const { data: variants } = useQuery({
//     queryKey: ['product-variants', productId],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from('product_variants')
//         .select('*')
//         .eq('product_id', productId)
//         .eq('is_available', true);
//       if (error) throw error;
//       return data as Variant[];
//     },
//   });

//   const sizes = variants?.filter(v => v.variant_type === 'size') || [];
//   const colors = variants?.filter(v => v.variant_type === 'color') || [];

//   useEffect(() => {
//     if (selectedSize || selectedColor) {
//       const selected = variants?.find(v => 
//         (v.variant_type === 'size' && v.variant_value === selectedSize) ||
//         (v.variant_type === 'color' && v.variant_value === selectedColor)
//       );
//       if (selected) {
//         onVariantChange({
//           type: selected.variant_type,
//           value: selected.variant_value,
//           priceAdjustment: selected.price_adjustment || 0,
//         });
//       }
//     } else {
//       onVariantChange(null);
//     }
//   }, [selectedSize, selectedColor, variants, onVariantChange]);

//   if (!variants || variants.length === 0) {
//     return null;
//   }

//   return (
//     <div className="space-y-6">
//       {/* Size Selection */}
//       {sizes.length > 0 && (
//         <div>
//           <div className="flex items-center justify-between mb-3">
//             <label className="text-sm font-medium">Size</label>
//             {selectedSize && (
//               <span className="text-sm text-muted-foreground">
//                 Selected: <span className="font-medium text-foreground">{selectedSize}</span>
//               </span>
//             )}
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {sizes.map((variant) => (
//               <button
//                 key={variant.id}
//                 onClick={() => setSelectedSize(selectedSize === variant.variant_value ? null : variant.variant_value)}
//                 disabled={variant.stock_quantity === 0}
//                 className={cn(
//                   "px-4 py-2 rounded-lg border-2 font-medium transition-all",
//                   selectedSize === variant.variant_value
//                     ? "border-primary bg-primary text-primary-foreground"
//                     : "border-soft-line hover:border-primary/50",
//                   variant.stock_quantity === 0 && "opacity-50 cursor-not-allowed line-through"
//                 )}
//               >
//                 {variant.variant_value}
//                 {variant.price_adjustment > 0 && (
//                   <span className="text-xs ml-1 opacity-70">+₹{variant.price_adjustment}</span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Color Selection */}
//       {colors.length > 0 && (
//         <div>
//           <div className="flex items-center justify-between mb-3">
//             <label className="text-sm font-medium">Color</label>
//             {selectedColor && (
//               <span className="text-sm text-muted-foreground">
//                 Selected: <span className="font-medium text-foreground capitalize">{selectedColor}</span>
//               </span>
//             )}
//           </div>
//           <div className="flex flex-wrap gap-3">
//             {colors.map((variant) => {
//               const colorValue = colorMap[variant.variant_value.toLowerCase()] || variant.variant_value;
//               const isLight = ['white', 'cream', 'beige', 'blush', 'sand'].includes(variant.variant_value.toLowerCase());
              
//               return (
//                 <button
//                   key={variant.id}
//                   onClick={() => setSelectedColor(selectedColor === variant.variant_value ? null : variant.variant_value)}
//                   disabled={variant.stock_quantity === 0}
//                   className={cn(
//                     "relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
//                     selectedColor === variant.variant_value
//                       ? "border-primary ring-2 ring-primary/30 scale-110"
//                       : "border-soft-line hover:border-primary/50",
//                     variant.stock_quantity === 0 && "opacity-50 cursor-not-allowed"
//                   )}
//                   style={{ backgroundColor: colorValue }}
//                   title={variant.variant_value}
//                 >
//                   {selectedColor === variant.variant_value && (
//                     <Check className={cn("w-5 h-5", isLight ? "text-charcoal" : "text-white")} />
//                   )}
//                   {variant.stock_quantity === 0 && (
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <div className="w-full h-0.5 bg-destructive rotate-45" />
//                     </div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
