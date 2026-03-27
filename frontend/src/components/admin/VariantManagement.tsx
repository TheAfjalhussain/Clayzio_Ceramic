import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Palette, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductVariant } from "@/lib/api/products";

interface VariantManagementProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VariantFormData {
  variant_type: string;
  variant_value: string;
  price_adjustment: string;
  stock_quantity: string;
  is_available: boolean;
}

const initialFormData: VariantFormData = {
  variant_type: "",
  variant_value: "",
  price_adjustment: "0",
  stock_quantity: "0",
  is_available: true,
};

const variantTypes = [
  { value: "size", label: "Size", icon: Ruler },
  { value: "color", label: "Color", icon: Palette },
];

const commonSizes = ["Small", "Medium", "Large", "XL", "XXL"];
const commonColors = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Terracotta", hex: "#E2725B" },
  { name: "Sage Green", hex: "#9CAF88" },
  { name: "Navy Blue", hex: "#000080" },
  { name: "Dusty Rose", hex: "#DCAE96" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Charcoal", hex: "#36454F" },
];

export const VariantManagement = ({
  productId,
  productName,
  open,
  onOpenChange,
}: VariantManagementProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>(initialFormData);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: variants, isLoading } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: () => adminApi.getProductVariants(productId),
    enabled: open && !!productId,
  });

  const createMutation = useMutation({
    mutationFn: (data: VariantFormData) => adminApi.createVariant({
      product_id: productId,
      variant_type: data.variant_type,
      variant_value: data.variant_value,
      price_adjustment: parseFloat(data.price_adjustment) || 0,
      stock_quantity: parseInt(data.stock_quantity) || 0,
      is_available: data.is_available,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      toast({ title: "Variant created successfully" });
      handleCloseForm();
    },
    onError: (error: any) => {
      toast({ title: "Error creating variant", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VariantFormData }) => adminApi.updateVariant(id, {
      product_id: productId,
      variant_type: data.variant_type,
      variant_value: data.variant_value,
      price_adjustment: parseFloat(data.price_adjustment) || 0,
      stock_quantity: parseInt(data.stock_quantity) || 0,
      is_available: data.is_available,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      toast({ title: "Variant updated successfully" });
      handleCloseForm();
    },
    onError: (error: any) => {
      toast({ title: "Error updating variant", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteVariant(id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      toast({ title: "Variant deleted successfully" });
      setDeleteVariantId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error deleting variant", description: error.message, variant: "destructive" });
    },
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVariant(null);
    setFormData(initialFormData);
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    const variantType = variant.variant_type || variant.variantType || '';
    const variantValue = variant.variant_value || variant.variantValue || '';
    const priceAdj = variant.price_adjustment ?? variant.priceAdjustment ?? 0;
    const stockQty = variant.stock_quantity ?? variant.stockQuantity ?? 0;
    const isAvailable = variant.is_available ?? variant.isAvailable ?? true;
    
    setFormData({
      variant_type: variantType,
      variant_value: variantValue,
      price_adjustment: priceAdj.toString(),
      stock_quantity: stockQty.toString(),
      is_available: isAvailable,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const variantId = editingVariant?._id || editingVariant?.id;
    if (variantId) {
      updateMutation.mutate({ id: variantId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const variantsList = Array.isArray(variants) ? variants : [];
  const groupedVariants = variantsList.reduce((acc, variant) => {
    const type = variant.variant_type || variant.variantType || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-hover">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              Manage Variants - {productName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add Variant Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </div>

            {/* Variants List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : variantsList.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedVariants).map(([type, typeVariants]) => (
                  <div key={type} className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 capitalize">
                      {type === "color" ? (
                        <Palette className="h-4 w-4" />
                      ) : (
                        <Ruler className="h-4 w-4" />
                      )}
                      {type} Variants
                    </h3>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Value</TableHead>
                            <TableHead>Price Adjustment</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {typeVariants.map((variant) => {
                            const variantId = variant._id || variant.id || '';
                            const variantValue = variant.variant_value || variant.variantValue || '';
                            const priceAdj = variant.price_adjustment ?? variant.priceAdjustment ?? 0;
                            const stockQty = variant.stock_quantity ?? variant.stockQuantity ?? 0;
                            const isAvailable = variant.is_available ?? variant.isAvailable ?? true;
                            
                            return (
                              <TableRow key={variantId} className="group">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {type === "color" && (
                                      <span
                                        className="w-5 h-5 rounded-full border border-border"
                                        style={{
                                          backgroundColor:
                                            commonColors.find((c) => c.name === variantValue)?.hex ||
                                            "#ccc",
                                        }}
                                      />
                                    )}
                                    <span className="font-medium">{variantValue}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className={priceAdj > 0 ? "text-primary" : "text-muted-foreground"}>
                                    {priceAdj > 0 ? `+₹${priceAdj}` : "No change"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={stockQty < 5 ? "text-destructive font-medium" : ""}>
                                    {stockQty}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      isAvailable
                                        ? "bg-primary/20 text-primary"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {isAvailable ? "Yes" : "No"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(variant)}
                                      className="hover:bg-primary/10 hover:text-primary"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-destructive/10 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteVariantId(variantId)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">No variants yet</p>
                <p className="text-muted-foreground mb-4">
                  Add size or color variants for this product.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Variant Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md border-0 shadow-hover">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingVariant ? "Edit Variant" : "Add New Variant"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Variant Type *</Label>
              <Select
                value={formData.variant_type}
                onValueChange={(value) => setFormData({ ...formData, variant_type: value, variant_value: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {variantTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Value *</Label>
              {formData.variant_type === "size" ? (
                <Select
                  value={formData.variant_value}
                  onValueChange={(value) => setFormData({ ...formData, variant_value: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : formData.variant_type === "color" ? (
                <Select
                  value={formData.variant_value}
                  onValueChange={(value) => setFormData({ ...formData, variant_value: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonColors.map((color) => (
                      <SelectItem key={color.name} value={color.name}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={formData.variant_value}
                  onChange={(e) => setFormData({ ...formData, variant_value: e.target.value })}
                  placeholder="Enter value"
                  disabled={!formData.variant_type}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Price Adjustment (₹)</Label>
                <Input
                  type="number"
                  value={formData.price_adjustment}
                  onChange={(e) => setFormData({ ...formData, price_adjustment: e.target.value })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Added to base price</p>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <Switch
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
              <div>
                <Label className="font-medium">Available for Sale</Label>
                <p className="text-xs text-muted-foreground">Enable to show this variant to customers</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingVariant ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteVariantId} onOpenChange={() => setDeleteVariantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVariantId && deleteMutation.mutate(deleteVariantId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};















// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminApi } from "@/lib/api/admin";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Plus, Pencil, Trash2, Loader2, Palette, Ruler } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { ProductVariant } from "@/lib/api/products";

// interface VariantManagementProps {
//   productId: string;
//   productName: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// interface VariantFormData {
//   variant_type: string;
//   variant_value: string;
//   price_adjustment: string;
//   stock_quantity: string;
//   is_available: boolean;
// }

// const initialFormData: VariantFormData = {
//   variant_type: "",
//   variant_value: "",
//   price_adjustment: "0",
//   stock_quantity: "0",
//   is_available: true,
// };

// const variantTypes = [
//   { value: "size", label: "Size", icon: Ruler },
//   { value: "color", label: "Color", icon: Palette },
// ];

// const commonSizes = ["Small", "Medium", "Large", "XL", "XXL"];
// const commonColors = [
//   { name: "White", hex: "#FFFFFF" },
//   { name: "Black", hex: "#000000" },
//   { name: "Beige", hex: "#F5F5DC" },
//   { name: "Brown", hex: "#8B4513" },
//   { name: "Terracotta", hex: "#E2725B" },
//   { name: "Sage Green", hex: "#9CAF88" },
//   { name: "Navy Blue", hex: "#000080" },
//   { name: "Dusty Rose", hex: "#DCAE96" },
//   { name: "Cream", hex: "#FFFDD0" },
//   { name: "Charcoal", hex: "#36454F" },
// ];

// export const VariantManagement = ({
//   productId,
//   productName,
//   open,
//   onOpenChange,
// }: VariantManagementProps) => {
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
//   const [formData, setFormData] = useState<VariantFormData>(initialFormData);
//   const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: variants, isLoading } = useQuery({
//     queryKey: ["product-variants", productId],
//     queryFn: () => adminApi.getProductVariants(productId),
//     enabled: open && !!productId,
//   });

//   const createMutation = useMutation({
//     mutationFn: (data: VariantFormData) => adminApi.createVariant({
//       product_id: productId,
//       variant_type: data.variant_type,
//       variant_value: data.variant_value,
//       price_adjustment: parseFloat(data.price_adjustment) || 0,
//       stock_quantity: parseInt(data.stock_quantity) || 0,
//       is_available: data.is_available,
//     }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
//       toast({ title: "Variant created successfully" });
//       handleCloseForm();
//     },
//     onError: (error: any) => {
//       toast({ title: "Error creating variant", description: error.message, variant: "destructive" });
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: VariantFormData }) => adminApi.updateVariant(id, {
//       variant_type: data.variant_type,
//       variant_value: data.variant_value,
//       price_adjustment: parseFloat(data.price_adjustment) || 0,
//       stock_quantity: parseInt(data.stock_quantity) || 0,
//       is_available: data.is_available,
//     }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
//       toast({ title: "Variant updated successfully" });
//       handleCloseForm();
//     },
//     onError: (error: any) => {
//       toast({ title: "Error updating variant", description: error.message, variant: "destructive" });
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => adminApi.deleteVariant(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
//       toast({ title: "Variant deleted successfully" });
//       setDeleteVariantId(null);
//     },
//     onError: (error: any) => {
//       toast({ title: "Error deleting variant", description: error.message, variant: "destructive" });
//     },
//   });

//   const handleCloseForm = () => {
//     setIsFormOpen(false);
//     setEditingVariant(null);
//     setFormData(initialFormData);
//   };

//   const handleEdit = (variant: ProductVariant) => {
//     setEditingVariant(variant);
//     const variantType = variant.variant_type || variant.variantType || '';
//     const variantValue = variant.variant_value || variant.variantValue || '';
//     const priceAdj = variant.price_adjustment ?? variant.priceAdjustment ?? 0;
//     const stockQty = variant.stock_quantity ?? variant.stockQuantity ?? 0;
//     const isAvailable = variant.is_available ?? variant.isAvailable ?? true;
    
//     setFormData({
//       variant_type: variantType,
//       variant_value: variantValue,
//       price_adjustment: priceAdj.toString(),
//       stock_quantity: stockQty.toString(),
//       is_available: isAvailable,
//     });
//     setIsFormOpen(true);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const variantId = editingVariant?._id || editingVariant?.id;
//     if (variantId) {
//       updateMutation.mutate({ id: variantId, data: formData });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   const variantsList = Array.isArray(variants) ? variants : [];
//   const groupedVariants = variantsList.reduce((acc, variant) => {
//     const type = variant.variant_type || variant.variantType || 'other';
//     if (!acc[type]) {
//       acc[type] = [];
//     }
//     acc[type].push(variant);
//     return acc;
//   }, {} as Record<string, ProductVariant[]>);

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-hover">
//           <DialogHeader>
//             <DialogTitle className="font-display text-2xl flex items-center gap-2">
//               <Palette className="h-6 w-6 text-primary" />
//               Manage Variants - {productName}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-6">
//             {/* Add Variant Button */}
//             <div className="flex justify-end">
//               <Button
//                 onClick={() => setIsFormOpen(true)}
//                 className="bg-primary text-primary-foreground hover:bg-primary/90"
//               >
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Variant
//               </Button>
//             </div>

//             {/* Variants List */}
//             {isLoading ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//               </div>
//             ) : variantsList.length > 0 ? (
//               <div className="space-y-6">
//                 {Object.entries(groupedVariants).map(([type, typeVariants]) => (
//                   <div key={type} className="space-y-3">
//                     <h3 className="font-semibold text-foreground flex items-center gap-2 capitalize">
//                       {type === "color" ? (
//                         <Palette className="h-4 w-4" />
//                       ) : (
//                         <Ruler className="h-4 w-4" />
//                       )}
//                       {type} Variants
//                     </h3>
//                     <div className="border border-border rounded-xl overflow-hidden">
//                       <Table>
//                         <TableHeader>
//                           <TableRow className="bg-muted/30">
//                             <TableHead>Value</TableHead>
//                             <TableHead>Price Adjustment</TableHead>
//                             <TableHead>Stock</TableHead>
//                             <TableHead>Available</TableHead>
//                             <TableHead className="text-right">Actions</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {typeVariants.map((variant) => {
//                             const variantId = variant._id || variant.id || '';
//                             const variantValue = variant.variant_value || variant.variantValue || '';
//                             const priceAdj = variant.price_adjustment ?? variant.priceAdjustment ?? 0;
//                             const stockQty = variant.stock_quantity ?? variant.stockQuantity ?? 0;
//                             const isAvailable = variant.is_available ?? variant.isAvailable ?? true;
                            
//                             return (
//                               <TableRow key={variantId} className="group">
//                                 <TableCell>
//                                   <div className="flex items-center gap-2">
//                                     {type === "color" && (
//                                       <span
//                                         className="w-5 h-5 rounded-full border border-border"
//                                         style={{
//                                           backgroundColor:
//                                             commonColors.find((c) => c.name === variantValue)?.hex ||
//                                             "#ccc",
//                                         }}
//                                       />
//                                     )}
//                                     <span className="font-medium">{variantValue}</span>
//                                   </div>
//                                 </TableCell>
//                                 <TableCell>
//                                   <span className={priceAdj > 0 ? "text-primary" : "text-muted-foreground"}>
//                                     {priceAdj > 0 ? `+₹${priceAdj}` : "No change"}
//                                   </span>
//                                 </TableCell>
//                                 <TableCell>
//                                   <span className={stockQty < 5 ? "text-destructive font-medium" : ""}>
//                                     {stockQty}
//                                   </span>
//                                 </TableCell>
//                                 <TableCell>
//                                   <span
//                                     className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                       isAvailable
//                                         ? "bg-primary/20 text-primary"
//                                         : "bg-muted text-muted-foreground"
//                                     }`}
//                                   >
//                                     {isAvailable ? "Yes" : "No"}
//                                   </span>
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                   <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       onClick={() => handleEdit(variant)}
//                                       className="hover:bg-primary/10 hover:text-primary"
//                                     >
//                                       <Pencil className="h-4 w-4" />
//                                     </Button>
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       className="hover:bg-destructive/10 text-destructive hover:text-destructive"
//                                       onClick={() => setDeleteVariantId(variantId)}
//                                     >
//                                       <Trash2 className="h-4 w-4" />
//                                     </Button>
//                                   </div>
//                                 </TableCell>
//                               </TableRow>
//                             );
//                           })}
//                         </TableBody>
//                       </Table>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <div className="p-4 rounded-full bg-muted mb-4">
//                   <Palette className="h-8 w-8 text-muted-foreground" />
//                 </div>
//                 <p className="text-lg font-medium text-foreground mb-1">No variants yet</p>
//                 <p className="text-muted-foreground mb-4">
//                   Add size or color variants for this product.
//                 </p>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Add/Edit Variant Dialog */}
//       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
//         <DialogContent className="max-w-md border-0 shadow-hover">
//           <DialogHeader>
//             <DialogTitle className="font-display text-xl">
//               {editingVariant ? "Edit Variant" : "Add New Variant"}
//             </DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="space-y-2">
//               <Label className="text-foreground font-medium">Variant Type *</Label>
//               <Select
//                 value={formData.variant_type}
//                 onValueChange={(value) => setFormData({ ...formData, variant_type: value, variant_value: "" })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {variantTypes.map((type) => (
//                     <SelectItem key={type.value} value={type.value}>
//                       <span className="flex items-center gap-2">
//                         <type.icon className="h-4 w-4" />
//                         {type.label}
//                       </span>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label className="text-foreground font-medium">Value *</Label>
//               {formData.variant_type === "size" ? (
//                 <Select
//                   value={formData.variant_value}
//                   onValueChange={(value) => setFormData({ ...formData, variant_value: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select size" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {commonSizes.map((size) => (
//                       <SelectItem key={size} value={size}>
//                         {size}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : formData.variant_type === "color" ? (
//                 <Select
//                   value={formData.variant_value}
//                   onValueChange={(value) => setFormData({ ...formData, variant_value: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select color" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {commonColors.map((color) => (
//                       <SelectItem key={color.name} value={color.name}>
//                         <span className="flex items-center gap-2">
//                           <span
//                             className="w-4 h-4 rounded-full border border-border"
//                             style={{ backgroundColor: color.hex }}
//                           />
//                           {color.name}
//                         </span>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <Input
//                   value={formData.variant_value}
//                   onChange={(e) => setFormData({ ...formData, variant_value: e.target.value })}
//                   placeholder="Enter value"
//                   disabled={!formData.variant_type}
//                 />
//               )}
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label className="text-foreground font-medium">Price Adjustment (₹)</Label>
//                 <Input
//                   type="number"
//                   value={formData.price_adjustment}
//                   onChange={(e) => setFormData({ ...formData, price_adjustment: e.target.value })}
//                   placeholder="0"
//                 />
//                 <p className="text-xs text-muted-foreground">Added to base price</p>
//               </div>
//               <div className="space-y-2">
//                 <Label className="text-foreground font-medium">Stock Quantity</Label>
//                 <Input
//                   type="number"
//                   value={formData.stock_quantity}
//                   onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
//                   placeholder="0"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
//               <Switch
//                 checked={formData.is_available}
//                 onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
//               />
//               <div>
//                 <Label className="font-medium">Available for Sale</Label>
//                 <p className="text-xs text-muted-foreground">Enable to show this variant to customers</p>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 pt-2">
//               <Button type="button" variant="outline" onClick={handleCloseForm}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
//                 {(createMutation.isPending || updateMutation.isPending) && (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 )}
//                 {editingVariant ? "Update" : "Create"}
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation */}
//       <AlertDialog open={!!deleteVariantId} onOpenChange={() => setDeleteVariantId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Variant</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this variant? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => deleteVariantId && deleteMutation.mutate(deleteVariantId)}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// };








// // import { useState } from "react";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Switch } from "@/components/ui/switch";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Plus, Pencil, Trash2, Loader2, Palette, Ruler, X } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { Tables } from "@/integrations/supabase/types";

// // type ProductVariant = Tables<"product_variants">;

// // interface VariantManagementProps {
// //   productId: string;
// //   productName: string;
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// // }

// // interface VariantFormData {
// //   variant_type: string;
// //   variant_value: string;
// //   price_adjustment: string;
// //   stock_quantity: string;
// //   is_available: boolean;
// // }

// // const initialFormData: VariantFormData = {
// //   variant_type: "",
// //   variant_value: "",
// //   price_adjustment: "0",
// //   stock_quantity: "0",
// //   is_available: true,
// // };

// // const variantTypes = [
// //   { value: "size", label: "Size", icon: Ruler },
// //   { value: "color", label: "Color", icon: Palette },
// // ];

// // const commonSizes = ["Small", "Medium", "Large", "XL", "XXL"];
// // const commonColors = [
// //   { name: "White", hex: "#FFFFFF" },
// //   { name: "Black", hex: "#000000" },
// //   { name: "Beige", hex: "#F5F5DC" },
// //   { name: "Brown", hex: "#8B4513" },
// //   { name: "Terracotta", hex: "#E2725B" },
// //   { name: "Sage Green", hex: "#9CAF88" },
// //   { name: "Navy Blue", hex: "#000080" },
// //   { name: "Dusty Rose", hex: "#DCAE96" },
// //   { name: "Cream", hex: "#FFFDD0" },
// //   { name: "Charcoal", hex: "#36454F" },
// // ];

// // export const VariantManagement = ({
// //   productId,
// //   productName,
// //   open,
// //   onOpenChange,
// // }: VariantManagementProps) => {
// //   const [isFormOpen, setIsFormOpen] = useState(false);
// //   const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
// //   const [formData, setFormData] = useState<VariantFormData>(initialFormData);
// //   const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
// //   const { toast } = useToast();
// //   const queryClient = useQueryClient();

// //   const { data: variants, isLoading } = useQuery({
// //     queryKey: ["product-variants", productId],
// //     queryFn: async () => {
// //       const { data, error } = await supabase
// //         .from("product_variants")
// //         .select("*")
// //         .eq("product_id", productId)
// //         .order("variant_type", { ascending: true })
// //         .order("variant_value", { ascending: true });
// //       if (error) throw error;
// //       return data;
// //     },
// //     enabled: open,
// //   });

// //   const createMutation = useMutation({
// //     mutationFn: async (data: VariantFormData) => {
// //       const { error } = await supabase.from("product_variants").insert({
// //         product_id: productId,
// //         variant_type: data.variant_type,
// //         variant_value: data.variant_value,
// //         price_adjustment: parseFloat(data.price_adjustment) || 0,
// //         stock_quantity: parseInt(data.stock_quantity) || 0,
// //         is_available: data.is_available,
// //       });
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
// //       toast({ title: "Variant created successfully" });
// //       handleCloseForm();
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error creating variant", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const updateMutation = useMutation({
// //     mutationFn: async ({ id, data }: { id: string; data: VariantFormData }) => {
// //       const { error } = await supabase
// //         .from("product_variants")
// //         .update({
// //           variant_type: data.variant_type,
// //           variant_value: data.variant_value,
// //           price_adjustment: parseFloat(data.price_adjustment) || 0,
// //           stock_quantity: parseInt(data.stock_quantity) || 0,
// //           is_available: data.is_available,
// //         })
// //         .eq("id", id);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
// //       toast({ title: "Variant updated successfully" });
// //       handleCloseForm();
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error updating variant", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const deleteMutation = useMutation({
// //     mutationFn: async (id: string) => {
// //       const { error } = await supabase.from("product_variants").delete().eq("id", id);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
// //       toast({ title: "Variant deleted successfully" });
// //       setDeleteVariantId(null);
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error deleting variant", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const handleCloseForm = () => {
// //     setIsFormOpen(false);
// //     setEditingVariant(null);
// //     setFormData(initialFormData);
// //   };

// //   const handleEdit = (variant: ProductVariant) => {
// //     setEditingVariant(variant);
// //     setFormData({
// //       variant_type: variant.variant_type,
// //       variant_value: variant.variant_value,
// //       price_adjustment: variant.price_adjustment?.toString() || "0",
// //       stock_quantity: variant.stock_quantity?.toString() || "0",
// //       is_available: variant.is_available ?? true,
// //     });
// //     setIsFormOpen(true);
// //   };

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (editingVariant) {
// //       updateMutation.mutate({ id: editingVariant.id, data: formData });
// //     } else {
// //       createMutation.mutate(formData);
// //     }
// //   };

// //   const groupedVariants = variants?.reduce((acc, variant) => {
// //     if (!acc[variant.variant_type]) {
// //       acc[variant.variant_type] = [];
// //     }
// //     acc[variant.variant_type].push(variant);
// //     return acc;
// //   }, {} as Record<string, ProductVariant[]>);

// //   return (
// //     <>
// //       <Dialog open={open} onOpenChange={onOpenChange}>
// //         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-hover">
// //           <DialogHeader>
// //             <DialogTitle className="font-display text-2xl flex items-center gap-2">
// //               <Palette className="h-6 w-6 text-primary" />
// //               Manage Variants - {productName}
// //             </DialogTitle>
// //           </DialogHeader>

// //           <div className="space-y-6">
// //             {/* Add Variant Button */}
// //             <div className="flex justify-end">
// //               <Button
// //                 onClick={() => setIsFormOpen(true)}
// //                 className="bg-primary text-primary-foreground hover:bg-primary/90"
// //               >
// //                 <Plus className="mr-2 h-4 w-4" />
// //                 Add Variant
// //               </Button>
// //             </div>

// //             {/* Variants List */}
// //             {isLoading ? (
// //               <div className="flex items-center justify-center py-12">
// //                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //               </div>
// //             ) : variants && variants.length > 0 ? (
// //               <div className="space-y-6">
// //                 {Object.entries(groupedVariants || {}).map(([type, typeVariants]) => (
// //                   <div key={type} className="space-y-3">
// //                     <h3 className="font-semibold text-foreground flex items-center gap-2 capitalize">
// //                       {type === "color" ? (
// //                         <Palette className="h-4 w-4" />
// //                       ) : (
// //                         <Ruler className="h-4 w-4" />
// //                       )}
// //                       {type} Variants
// //                     </h3>
// //                     <div className="border border-border rounded-xl overflow-hidden">
// //                       <Table>
// //                         <TableHeader>
// //                           <TableRow className="bg-muted/30">
// //                             <TableHead>Value</TableHead>
// //                             <TableHead>Price Adjustment</TableHead>
// //                             <TableHead>Stock</TableHead>
// //                             <TableHead>Available</TableHead>
// //                             <TableHead className="text-right">Actions</TableHead>
// //                           </TableRow>
// //                         </TableHeader>
// //                         <TableBody>
// //                           {typeVariants.map((variant) => (
// //                             <TableRow key={variant.id} className="group">
// //                               <TableCell>
// //                                 <div className="flex items-center gap-2">
// //                                   {type === "color" && (
// //                                     <span
// //                                       className="w-5 h-5 rounded-full border border-border"
// //                                       style={{
// //                                         backgroundColor:
// //                                           commonColors.find((c) => c.name === variant.variant_value)?.hex ||
// //                                           "#ccc",
// //                                       }}
// //                                     />
// //                                   )}
// //                                   <span className="font-medium">{variant.variant_value}</span>
// //                                 </div>
// //                               </TableCell>
// //                               <TableCell>
// //                                 <span className={variant.price_adjustment && variant.price_adjustment > 0 ? "text-primary" : "text-muted-foreground"}>
// //                                   {variant.price_adjustment && variant.price_adjustment > 0
// //                                     ? `+₹${variant.price_adjustment}`
// //                                     : "No change"}
// //                                 </span>
// //                               </TableCell>
// //                               <TableCell>
// //                                 <span className={(variant.stock_quantity || 0) < 5 ? "text-destructive font-medium" : ""}>
// //                                   {variant.stock_quantity || 0}
// //                                 </span>
// //                               </TableCell>
// //                               <TableCell>
// //                                 <span
// //                                   className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                                     variant.is_available
// //                                       ? "bg-primary/20 text-primary"
// //                                       : "bg-muted text-muted-foreground"
// //                                   }`}
// //                                 >
// //                                   {variant.is_available ? "Yes" : "No"}
// //                                 </span>
// //                               </TableCell>
// //                               <TableCell className="text-right">
// //                                 <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
// //                                   <Button
// //                                     variant="ghost"
// //                                     size="icon"
// //                                     onClick={() => handleEdit(variant)}
// //                                     className="hover:bg-primary/10 hover:text-primary"
// //                                   >
// //                                     <Pencil className="h-4 w-4" />
// //                                   </Button>
// //                                   <Button
// //                                     variant="ghost"
// //                                     size="icon"
// //                                     className="hover:bg-destructive/10 text-destructive hover:text-destructive"
// //                                     onClick={() => setDeleteVariantId(variant.id)}
// //                                   >
// //                                     <Trash2 className="h-4 w-4" />
// //                                   </Button>
// //                                 </div>
// //                               </TableCell>
// //                             </TableRow>
// //                           ))}
// //                         </TableBody>
// //                       </Table>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             ) : (
// //               <div className="flex flex-col items-center justify-center py-12 text-center">
// //                 <div className="p-4 rounded-full bg-muted mb-4">
// //                   <Palette className="h-8 w-8 text-muted-foreground" />
// //                 </div>
// //                 <p className="text-lg font-medium text-foreground mb-1">No variants yet</p>
// //                 <p className="text-muted-foreground mb-4">
// //                   Add size or color variants for this product.
// //                 </p>
// //               </div>
// //             )}
// //           </div>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Add/Edit Variant Dialog */}
// //       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
// //         <DialogContent className="max-w-md border-0 shadow-hover">
// //           <DialogHeader>
// //             <DialogTitle className="font-display text-xl">
// //               {editingVariant ? "Edit Variant" : "Add New Variant"}
// //             </DialogTitle>
// //           </DialogHeader>
// //           <form onSubmit={handleSubmit} className="space-y-5">
// //             <div className="space-y-2">
// //               <Label className="text-foreground font-medium">Variant Type *</Label>
// //               <Select
// //                 value={formData.variant_type}
// //                 onValueChange={(value) => setFormData({ ...formData, variant_type: value, variant_value: "" })}
// //               >
// //                 <SelectTrigger>
// //                   <SelectValue placeholder="Select type" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   {variantTypes.map((type) => (
// //                     <SelectItem key={type.value} value={type.value}>
// //                       <span className="flex items-center gap-2">
// //                         <type.icon className="h-4 w-4" />
// //                         {type.label}
// //                       </span>
// //                     </SelectItem>
// //                   ))}
// //                 </SelectContent>
// //               </Select>
// //             </div>

// //             <div className="space-y-2">
// //               <Label className="text-foreground font-medium">Value *</Label>
// //               {formData.variant_type === "size" ? (
// //                 <Select
// //                   value={formData.variant_value}
// //                   onValueChange={(value) => setFormData({ ...formData, variant_value: value })}
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue placeholder="Select size" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {commonSizes.map((size) => (
// //                       <SelectItem key={size} value={size}>
// //                         {size}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               ) : formData.variant_type === "color" ? (
// //                 <Select
// //                   value={formData.variant_value}
// //                   onValueChange={(value) => setFormData({ ...formData, variant_value: value })}
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue placeholder="Select color" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {commonColors.map((color) => (
// //                       <SelectItem key={color.name} value={color.name}>
// //                         <span className="flex items-center gap-2">
// //                           <span
// //                             className="w-4 h-4 rounded-full border border-border"
// //                             style={{ backgroundColor: color.hex }}
// //                           />
// //                           {color.name}
// //                         </span>
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               ) : (
// //                 <Input
// //                   value={formData.variant_value}
// //                   onChange={(e) => setFormData({ ...formData, variant_value: e.target.value })}
// //                   placeholder="Enter value"
// //                   disabled={!formData.variant_type}
// //                 />
// //               )}
// //             </div>

// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label className="text-foreground font-medium">Price Adjustment (₹)</Label>
// //                 <Input
// //                   type="number"
// //                   value={formData.price_adjustment}
// //                   onChange={(e) => setFormData({ ...formData, price_adjustment: e.target.value })}
// //                   placeholder="0"
// //                 />
// //                 <p className="text-xs text-muted-foreground">Added to base price</p>
// //               </div>
// //               <div className="space-y-2">
// //                 <Label className="text-foreground font-medium">Stock Quantity</Label>
// //                 <Input
// //                   type="number"
// //                   value={formData.stock_quantity}
// //                   onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
// //                   placeholder="0"
// //                 />
// //               </div>
// //             </div>

// //             <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
// //               <Switch
// //                 id="is_available"
// //                 checked={formData.is_available}
// //                 onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
// //               />
// //               <Label htmlFor="is_available" className="cursor-pointer">
// //                 Available for purchase
// //               </Label>
// //             </div>

// //             <div className="flex justify-end gap-3 pt-4 border-t border-border">
// //               <Button type="button" variant="outline" onClick={handleCloseForm}>
// //                 Cancel
// //               </Button>
// //               <Button
// //                 type="submit"
// //                 className="bg-primary text-primary-foreground"
// //                 disabled={
// //                   createMutation.isPending ||
// //                   updateMutation.isPending ||
// //                   !formData.variant_type ||
// //                   !formData.variant_value
// //                 }
// //               >
// //                 {(createMutation.isPending || updateMutation.isPending) && (
// //                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                 )}
// //                 {editingVariant ? "Update" : "Create"}
// //               </Button>
// //             </div>
// //           </form>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Delete Confirmation */}
// //       <AlertDialog open={!!deleteVariantId} onOpenChange={() => setDeleteVariantId(null)}>
// //         <AlertDialogContent className="border-0 shadow-hover">
// //           <AlertDialogHeader>
// //             <AlertDialogTitle className="font-display">Delete Variant</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               Are you sure you want to delete this variant? This action cannot be undone.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel>Cancel</AlertDialogCancel>
// //             <AlertDialogAction
// //               onClick={() => deleteVariantId && deleteMutation.mutate(deleteVariantId)}
// //               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
// //             >
// //               {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </>
// //   );
// // };
