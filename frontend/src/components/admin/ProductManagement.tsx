import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Product } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search, 
  ImageIcon,
  Package,
  TrendingUp,
  AlertCircle,
  Star,
  Palette,
  X
} from "lucide-react";
import { VariantManagement } from "./VariantManagement";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  price: string;
  original_price: string;
  category: string;
  images: string[];
  stock_quantity: string;
  is_bestseller: boolean;
  is_new: boolean;
  care_instructions: string;
  materials: string;
  dimensions: string;
  weight: string;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  short_description: "",
  price: "",
  original_price: "",
  category: "",
  images: [],
  stock_quantity: "0",
  is_bestseller: false,
  is_new: false,
  care_instructions: "",
  materials: "",
  dimensions: "",
  weight: "",
};

const categories = [
  { value: "dinnerware", label: "Dinnerware" },
  { value: "serveware", label: "Serveware" },
  { value: "drinkware", label: "Drinkware" },
  { value: "decor", label: "Décor" },
  { value: "planters", label: "Planters" },
  { value: "sets", label: "Sets" },
  { value: "gifting", label: "Gifting" },
];

export const ProductManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [variantProductId, setVariantProductId] = useState<string | null>(null);
  const [variantProductName, setVariantProductName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => adminApi.getProducts(),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('images', file));
      const uploadedUrls = await adminApi.uploadImages(formData);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      toast({ title: "Images uploaded successfully" });
    } catch (error: any) {
      toast({ 
        title: "Error uploading images", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => adminApi.createProduct({
      name: data.name,
      description: data.description,
      short_description: data.short_description,
      price: parseFloat(data.price),
      original_price: data.original_price ? parseFloat(data.original_price) : undefined,
      category: data.category,
      images: data.images,
      stock_quantity: parseInt(data.stock_quantity),
      is_bestseller: data.is_bestseller,
      is_new: data.is_new,
      care_instructions: data.care_instructions || undefined,
      materials: data.materials || undefined,
      dimensions: data.dimensions || undefined,
      weight: data.weight || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created successfully" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error creating product", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) => adminApi.updateProduct(id, {
      name: data.name,
      description: data.description,
      short_description: data.short_description,
      price: parseFloat(data.price),
      original_price: data.original_price ? parseFloat(data.original_price) : undefined,
      category: data.category,
      images: data.images,
      stock_quantity: parseInt(data.stock_quantity),
      is_bestseller: data.is_bestseller,
      is_new: data.is_new,
      care_instructions: data.care_instructions || undefined,
      materials: data.materials || undefined,
      dimensions: data.dimensions || undefined,
      weight: data.weight || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated successfully" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted successfully" });
      setDeleteProductId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      short_description: product.short_description || product.shortDescription || "",
      price: product.price.toString(),
      original_price: (product.original_price || product.originalPrice)?.toString() || "",
      category: product.category,
      images: product.images || [],
      stock_quantity: (product.stock_quantity || product.stockQuantity)?.toString() || "0",
      is_bestseller: product.is_bestseller || product.isBestseller || false,
      is_new: product.is_new || product.isNew || false,
      care_instructions: product.care_instructions || product.careInstructions || "",
      materials: product.materials || "",
      dimensions: product.dimensions || "",
      weight: product.weight || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productId = editingProduct?._id || editingProduct?.id;
    if (productId) {
      updateMutation.mutate({ id: productId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenVariants = (product: Product) => {
    const productId = product._id || product.id || '';
    setVariantProductId(productId);
    setVariantProductName(product.name);
  };

  const productsList = Array.isArray(products) ? products : [];
  const filteredProducts = productsList.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculations
  const totalProducts = productsList.length;
  const inStockProducts = productsList.filter(p => p.in_stock || p.inStock).length;
  const bestsellers = productsList.filter(p => p.is_bestseller || p.isBestseller).length;
  const lowStock = productsList.filter(p => {
    const qty = p.stock_quantity ?? p.stockQuantity ?? 0;
    return qty < 10 && qty > 0;
  }).length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-display font-semibold text-foreground">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-sage/20">
                <TrendingUp className="h-6 w-6 text-sage" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-display font-semibold text-foreground">{inStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-secondary/50">
                <Star className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bestsellers</p>
                <p className="text-2xl font-display font-semibold text-foreground">{bestsellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-display font-semibold text-foreground">{lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Products
          </h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-hover transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-hover">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-border focus:ring-primary"
                    placeholder="Calm Clay Mug"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground font-medium">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description" className="text-foreground font-medium">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="border-border"
                  placeholder="Hand-glazed stoneware mug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-border min-h-[100px]"
                  placeholder="A beautifully hand-glazed ceramic mug..."
                  rows={4}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground font-medium">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="border-border"
                    placeholder="29.99"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price" className="text-foreground font-medium">Original Price</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="border-border"
                    placeholder="39.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity" className="text-foreground font-medium">Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="border-border"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Product Images</Label>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    {uploadingImages ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </label>
                </div>
              </div>

              {/* Flags */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_bestseller: checked })}
                  />
                  <Label>Bestseller</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                  />
                  <Label>New Arrival</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-soft">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const productId = product._id || product.id || '';
                return (
                  <TableRow key={productId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {(product.is_bestseller || product.isBestseller) && (
                            <span className="text-xs text-primary">Bestseller</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{product.category.replace('-', ' ')}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.stock_quantity ?? product.stockQuantity ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenVariants(product)}>
                          <Palette className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteProductId(productId)}
                          className="text-destructive"
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
        )}
      </Card>

      {/* Variant Management Dialog */}
      <VariantManagement
        productId={variantProductId || ''}
        productName={variantProductName}
        open={!!variantProductId}
        onOpenChange={(open) => {
          if (!open) {
            setVariantProductId(null);
            setVariantProductName("");
          }
        }}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};












// import { useState, useRef } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminApi } from "@/lib/api/admin";
// import { Product } from "@/lib/api/products";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
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
// import { 
//   Plus, 
//   Pencil, 
//   Trash2, 
//   Loader2, 
//   Search, 
//   ImageIcon,
//   Package,
//   TrendingUp,
//   AlertCircle,
//   Star,
//   Palette,
//   X
// } from "lucide-react";
// import { VariantManagement } from "./VariantManagement";
// import { useToast } from "@/hooks/use-toast";

// interface ProductFormData {
//   name: string;
//   description: string;
//   short_description: string;
//   price: string;
//   original_price: string;
//   category: string;
//   images: string[];
//   stock_quantity: string;
//   is_bestseller: boolean;
//   is_new: boolean;
//   care_instructions: string;
//   materials: string;
//   dimensions: string;
//   weight: string;
// }

// const initialFormData: ProductFormData = {
//   name: "",
//   description: "",
//   short_description: "",
//   price: "",
//   original_price: "",
//   category: "",
//   images: [],
//   stock_quantity: "0",
//   is_bestseller: false,
//   is_new: false,
//   care_instructions: "",
//   materials: "",
//   dimensions: "",
//   weight: "",
// };

// const categories = [
//   { value: "mugs-cups", label: "Mugs & Cups" },
//   { value: "bowls-plates", label: "Bowls & Plates" },
//   { value: "vases-decor", label: "Vases & Décor" },
//   { value: "aroma-diffusers", label: "Aroma & Diffusers" },
//   { value: "planters", label: "Planters" },
//   { value: "gift-sets", label: "Gift Sets" },
// ];

// export const ProductManagement = () => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [formData, setFormData] = useState<ProductFormData>(initialFormData);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
//   const [uploadingImages, setUploadingImages] = useState(false);
//   const [variantProductId, setVariantProductId] = useState<string | null>(null);
//   const [variantProductName, setVariantProductName] = useState<string>("");
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: products, isLoading } = useQuery({
//     queryKey: ["admin-products"],
//     queryFn: () => adminApi.getProducts(),
//   });

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     setUploadingImages(true);
//     try {
//       const formData = new FormData();
//       Array.from(files).forEach(file => formData.append('images', file));
//       const uploadedUrls = await adminApi.uploadImages(formData);
//       setFormData(prev => ({
//         ...prev,
//         images: [...prev.images, ...uploadedUrls],
//       }));
//       toast({ title: "Images uploaded successfully" });
//     } catch (error: any) {
//       toast({ 
//         title: "Error uploading images", 
//         description: error.message, 
//         variant: "destructive" 
//       });
//     } finally {
//       setUploadingImages(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const removeImage = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index),
//     }));
//   };

//   const createMutation = useMutation({
//     mutationFn: (data: ProductFormData) => adminApi.createProduct({
//       name: data.name,
//       description: data.description,
//       short_description: data.short_description,
//       price: parseFloat(data.price),
//       original_price: data.original_price ? parseFloat(data.original_price) : undefined,
//       category: data.category,
//       images: data.images,
//       stock_quantity: parseInt(data.stock_quantity),
//       is_bestseller: data.is_bestseller,
//       is_new: data.is_new,
//       care_instructions: data.care_instructions || undefined,
//       materials: data.materials || undefined,
//       dimensions: data.dimensions || undefined,
//       weight: data.weight || undefined,
//     }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-products"] });
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//       toast({ title: "Product created successfully" });
//       handleCloseDialog();
//     },
//     onError: (error: any) => {
//       toast({ title: "Error creating product", description: error.message, variant: "destructive" });
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: ProductFormData }) => adminApi.updateProduct(id, {
//       name: data.name,
//       description: data.description,
//       short_description: data.short_description,
//       price: parseFloat(data.price),
//       original_price: data.original_price ? parseFloat(data.original_price) : undefined,
//       category: data.category,
//       images: data.images,
//       stock_quantity: parseInt(data.stock_quantity),
//       is_bestseller: data.is_bestseller,
//       is_new: data.is_new,
//       care_instructions: data.care_instructions || undefined,
//       materials: data.materials || undefined,
//       dimensions: data.dimensions || undefined,
//       weight: data.weight || undefined,
//     }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-products"] });
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//       toast({ title: "Product updated successfully" });
//       handleCloseDialog();
//     },
//     onError: (error: any) => {
//       toast({ title: "Error updating product", description: error.message, variant: "destructive" });
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => adminApi.deleteProduct(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-products"] });
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//       toast({ title: "Product deleted successfully" });
//       setDeleteProductId(null);
//     },
//     onError: (error: any) => {
//       toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
//     },
//   });

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     setEditingProduct(null);
//     setFormData(initialFormData);
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);
//     setFormData({
//       name: product.name,
//       description: product.description || "",
//       short_description: product.short_description || product.shortDescription || "",
//       price: product.price.toString(),
//       original_price: (product.original_price || product.originalPrice)?.toString() || "",
//       category: product.category,
//       images: product.images || [],
//       stock_quantity: (product.stock_quantity || product.stockQuantity)?.toString() || "0",
//       is_bestseller: product.is_bestseller || product.isBestseller || false,
//       is_new: product.is_new || product.isNew || false,
//       care_instructions: product.care_instructions || product.careInstructions || "",
//       materials: product.materials || "",
//       dimensions: product.dimensions || "",
//       weight: product.weight || "",
//     });
//     setIsDialogOpen(true);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const productId = editingProduct?._id || editingProduct?.id;
//     if (productId) {
//       updateMutation.mutate({ id: productId, data: formData });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   const handleOpenVariants = (product: Product) => {
//     const productId = product._id || product.id || '';
//     setVariantProductId(productId);
//     setVariantProductName(product.name);
//   };

//   const productsList = Array.isArray(products) ? products : [];
//   const filteredProducts = productsList.filter((product) =>
//     product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     product.category.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Stats calculations
//   const totalProducts = productsList.length;
//   const inStockProducts = productsList.filter(p => p.in_stock || p.inStock).length;
//   const bestsellers = productsList.filter(p => p.is_bestseller || p.isBestseller).length;
//   const lowStock = productsList.filter(p => {
//     const qty = p.stock_quantity ?? p.stockQuantity ?? 0;
//     return qty < 10 && qty > 0;
//   }).length;

//   return (
//     <div className="space-y-8">
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-primary/10">
//                 <Package className="h-6 w-6 text-primary" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Products</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{totalProducts}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-sage/20">
//                 <TrendingUp className="h-6 w-6 text-sage" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">In Stock</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{inStockProducts}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-secondary/50">
//                 <Star className="h-6 w-6 text-secondary-foreground" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Bestsellers</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{bestsellers}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-destructive/10">
//                 <AlertCircle className="h-6 w-6 text-destructive" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Low Stock</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{lowStock}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="font-display text-3xl font-semibold text-foreground">
//             Products
//           </h2>
//           <p className="text-muted-foreground">Manage your product catalog</p>
//         </div>
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-hover transition-all">
//               <Plus className="mr-2 h-4 w-4" />
//               Add Product
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-hover">
//             <DialogHeader>
//               <DialogTitle className="font-display text-2xl">
//                 {editingProduct ? "Edit Product" : "Add New Product"}
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name" className="text-foreground font-medium">Product Name *</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="border-border focus:ring-primary"
//                     placeholder="Calm Clay Mug"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="category" className="text-foreground font-medium">Category *</Label>
//                   <Select 
//                     value={formData.category} 
//                     onValueChange={(value) => setFormData({ ...formData, category: value })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {categories.map(cat => (
//                         <SelectItem key={cat.value} value={cat.value}>
//                           {cat.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="short_description" className="text-foreground font-medium">Short Description</Label>
//                 <Input
//                   id="short_description"
//                   value={formData.short_description}
//                   onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
//                   className="border-border"
//                   placeholder="Hand-glazed stoneware mug"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="description" className="text-foreground font-medium">Full Description</Label>
//                 <Textarea
//                   id="description"
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   className="border-border min-h-[100px]"
//                   placeholder="A beautifully hand-glazed ceramic mug..."
//                   rows={4}
//                 />
//               </div>

//               {/* Pricing */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="price" className="text-foreground font-medium">Price *</Label>
//                   <Input
//                     id="price"
//                     type="number"
//                     step="0.01"
//                     value={formData.price}
//                     onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                     className="border-border"
//                     placeholder="29.99"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="original_price" className="text-foreground font-medium">Original Price</Label>
//                   <Input
//                     id="original_price"
//                     type="number"
//                     step="0.01"
//                     value={formData.original_price}
//                     onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
//                     className="border-border"
//                     placeholder="39.99"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="stock_quantity" className="text-foreground font-medium">Stock</Label>
//                   <Input
//                     id="stock_quantity"
//                     type="number"
//                     value={formData.stock_quantity}
//                     onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
//                     className="border-border"
//                     placeholder="50"
//                   />
//                 </div>
//               </div>

//               {/* Images */}
//               <div className="space-y-2">
//                 <Label className="text-foreground font-medium">Product Images</Label>
//                 <div className="flex flex-wrap gap-3">
//                   {formData.images.map((url, index) => (
//                     <div key={index} className="relative group">
//                       <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl" />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </div>
//                   ))}
//                   <label className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={handleImageUpload}
//                       className="hidden"
//                       disabled={uploadingImages}
//                     />
//                     {uploadingImages ? (
//                       <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
//                     ) : (
//                       <ImageIcon className="w-5 h-5 text-muted-foreground" />
//                     )}
//                   </label>
//                 </div>
//               </div>

//               {/* Flags */}
//               <div className="flex gap-6">
//                 <div className="flex items-center gap-2">
//                   <Switch
//                     checked={formData.is_bestseller}
//                     onCheckedChange={(checked) => setFormData({ ...formData, is_bestseller: checked })}
//                   />
//                   <Label>Bestseller</Label>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Switch
//                     checked={formData.is_new}
//                     onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
//                   />
//                   <Label>New Arrival</Label>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 pt-4">
//                 <Button type="button" variant="outline" onClick={handleCloseDialog}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
//                   {(createMutation.isPending || updateMutation.isPending) && (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   )}
//                   {editingProduct ? "Update Product" : "Create Product"}
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Search */}
//       <div className="relative max-w-md">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           placeholder="Search products..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="pl-10"
//         />
//       </div>

//       {/* Products Table */}
//       <Card className="border-0 shadow-soft">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-32">
//             <Loader2 className="h-6 w-6 animate-spin text-primary" />
//           </div>
//         ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead>Price</TableHead>
//                 <TableHead>Stock</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredProducts.map((product) => {
//                 const productId = product._id || product.id || '';
//                 return (
//                   <TableRow key={productId}>
//                     <TableCell>
//                       <div className="flex items-center gap-3">
//                         {product.images?.[0] && (
//                           <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
//                         )}
//                         <div>
//                           <p className="font-medium">{product.name}</p>
//                           {(product.is_bestseller || product.isBestseller) && (
//                             <span className="text-xs text-primary">Bestseller</span>
//                           )}
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell className="capitalize">{product.category.replace('-', ' ')}</TableCell>
//                     <TableCell>₹{product.price}</TableCell>
//                     <TableCell>{product.stock_quantity ?? product.stockQuantity ?? 0}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2">
//                         <Button variant="ghost" size="icon" onClick={() => handleOpenVariants(product)}>
//                           <Palette className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button 
//                           variant="ghost" 
//                           size="icon" 
//                           onClick={() => setDeleteProductId(productId)}
//                           className="text-destructive"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         )}
//       </Card>

//       {/* Variant Management Dialog */}
//       <VariantManagement
//         productId={variantProductId || ''}
//         productName={variantProductName}
//         open={!!variantProductId}
//         onOpenChange={(open) => {
//           if (!open) {
//             setVariantProductId(null);
//             setVariantProductName("");
//           }
//         }}
//       />

//       {/* Delete Dialog */}
//       <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Product</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this product? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };












// // import { useState, useRef } from "react";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Card, CardContent, CardHeader } from "@/components/ui/card";
// // import { Switch } from "@/components/ui/switch";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogTrigger,
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
// // import { 
// //   Plus, 
// //   Pencil, 
// //   Trash2, 
// //   Loader2, 
// //   Search, 
// //   Upload, 
// //   X, 
// //   ImageIcon,
// //   Package,
// //   TrendingUp,
// //   AlertCircle,
// //   Star,
// //   Palette
// // } from "lucide-react";
// // import { VariantManagement } from "./VariantManagement";
// // import { useToast } from "@/hooks/use-toast";
// // import { Tables } from "@/integrations/supabase/types";

// // type Product = Tables<"products">;

// // interface ProductFormData {
// //   name: string;
// //   description: string;
// //   short_description: string;
// //   price: string;
// //   original_price: string;
// //   category: string;
// //   images: string[];
// //   stock_quantity: string;
// //   is_bestseller: boolean;
// //   is_new: boolean;
// //   care_instructions: string;
// //   materials: string;
// //   dimensions: string;
// //   weight: string;
// // }

// // const initialFormData: ProductFormData = {
// //   name: "",
// //   description: "",
// //   short_description: "",
// //   price: "",
// //   original_price: "",
// //   category: "",
// //   images: [],
// //   stock_quantity: "0",
// //   is_bestseller: false,
// //   is_new: false,
// //   care_instructions: "",
// //   materials: "",
// //   dimensions: "",
// //   weight: "",
// // };

// // const categories = [
// //   { value: "mugs-cups", label: "Mugs & Cups" },
// //   { value: "bowls-plates", label: "Bowls & Plates" },
// //   { value: "vases-decor", label: "Vases & Décor" },
// //   { value: "aroma-diffusers", label: "Aroma & Diffusers" },
// //   { value: "planters", label: "Planters" },
// //   { value: "gift-sets", label: "Gift Sets" },
// // ];

// // export const ProductManagement = () => {
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);
// //   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
// //   const [formData, setFormData] = useState<ProductFormData>(initialFormData);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
// //   const [uploadingImages, setUploadingImages] = useState(false);
// //   const [variantProduct, setVariantProduct] = useState<Product | null>(null);
// //   const fileInputRef = useRef<HTMLInputElement>(null);
// //   const { toast } = useToast();
// //   const queryClient = useQueryClient();

// //   const { data: products, isLoading } = useQuery({
// //     queryKey: ["admin-products"],
// //     queryFn: async () => {
// //       const { data, error } = await supabase
// //         .from("products")
// //         .select("*")
// //         .order("created_at", { ascending: false });
// //       if (error) throw error;
// //       return data;
// //     },
// //   });

// //   const uploadImage = async (file: File): Promise<string> => {
// //     const fileExt = file.name.split(".").pop();
// //     const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
// //     const filePath = `products/${fileName}`;

// //     const { error: uploadError } = await supabase.storage
// //       .from("product-images")
// //       .upload(filePath, file);

// //     if (uploadError) throw uploadError;

// //     const { data: urlData } = supabase.storage
// //       .from("product-images")
// //       .getPublicUrl(filePath);

// //     return urlData.publicUrl;
// //   };

// //   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const files = e.target.files;
// //     if (!files || files.length === 0) return;

// //     setUploadingImages(true);
// //     try {
// //       const uploadPromises = Array.from(files).map(uploadImage);
// //       const uploadedUrls = await Promise.all(uploadPromises);
// //       setFormData(prev => ({
// //         ...prev,
// //         images: [...prev.images, ...uploadedUrls],
// //       }));
// //       toast({ title: "Images uploaded successfully" });
// //     } catch (error: any) {
// //       toast({ 
// //         title: "Error uploading images", 
// //         description: error.message, 
// //         variant: "destructive" 
// //       });
// //     } finally {
// //       setUploadingImages(false);
// //       if (fileInputRef.current) fileInputRef.current.value = "";
// //     }
// //   };

// //   const removeImage = (index: number) => {
// //     setFormData(prev => ({
// //       ...prev,
// //       images: prev.images.filter((_, i) => i !== index),
// //     }));
// //   };

// //   const createMutation = useMutation({
// //     mutationFn: async (data: ProductFormData) => {
// //       const { error } = await supabase.from("products").insert({
// //         name: data.name,
// //         description: data.description,
// //         short_description: data.short_description,
// //         price: parseFloat(data.price),
// //         original_price: data.original_price ? parseFloat(data.original_price) : null,
// //         category: data.category,
// //         images: data.images,
// //         stock_quantity: parseInt(data.stock_quantity),
// //         is_bestseller: data.is_bestseller,
// //         is_new: data.is_new,
// //         in_stock: parseInt(data.stock_quantity) > 0,
// //         care_instructions: data.care_instructions || null,
// //         materials: data.materials || null,
// //         dimensions: data.dimensions || null,
// //         weight: data.weight || null,
// //       });
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["admin-products"] });
// //       queryClient.invalidateQueries({ queryKey: ["products"] });
// //       toast({ title: "Product created successfully" });
// //       handleCloseDialog();
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error creating product", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const updateMutation = useMutation({
// //     mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
// //       const { error } = await supabase
// //         .from("products")
// //         .update({
// //           name: data.name,
// //           description: data.description,
// //           short_description: data.short_description,
// //           price: parseFloat(data.price),
// //           original_price: data.original_price ? parseFloat(data.original_price) : null,
// //           category: data.category,
// //           images: data.images,
// //           stock_quantity: parseInt(data.stock_quantity),
// //           is_bestseller: data.is_bestseller,
// //           is_new: data.is_new,
// //           in_stock: parseInt(data.stock_quantity) > 0,
// //           care_instructions: data.care_instructions || null,
// //           materials: data.materials || null,
// //           dimensions: data.dimensions || null,
// //           weight: data.weight || null,
// //         })
// //         .eq("id", id);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["admin-products"] });
// //       queryClient.invalidateQueries({ queryKey: ["products"] });
// //       toast({ title: "Product updated successfully" });
// //       handleCloseDialog();
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error updating product", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const deleteMutation = useMutation({
// //     mutationFn: async (id: string) => {
// //       const { error } = await supabase.from("products").delete().eq("id", id);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["admin-products"] });
// //       queryClient.invalidateQueries({ queryKey: ["products"] });
// //       toast({ title: "Product deleted successfully" });
// //       setDeleteProductId(null);
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const handleCloseDialog = () => {
// //     setIsDialogOpen(false);
// //     setEditingProduct(null);
// //     setFormData(initialFormData);
// //   };

// //   const handleEdit = (product: Product) => {
// //     setEditingProduct(product);
// //     setFormData({
// //       name: product.name,
// //       description: product.description || "",
// //       short_description: product.short_description || "",
// //       price: product.price.toString(),
// //       original_price: product.original_price?.toString() || "",
// //       category: product.category,
// //       images: product.images || [],
// //       stock_quantity: product.stock_quantity?.toString() || "0",
// //       is_bestseller: product.is_bestseller || false,
// //       is_new: product.is_new || false,
// //       care_instructions: product.care_instructions || "",
// //       materials: product.materials || "",
// //       dimensions: product.dimensions || "",
// //       weight: product.weight || "",
// //     });
// //     setIsDialogOpen(true);
// //   };

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (editingProduct) {
// //       updateMutation.mutate({ id: editingProduct.id, data: formData });
// //     } else {
// //       createMutation.mutate(formData);
// //     }
// //   };

// //   const filteredProducts = products?.filter((product) =>
// //     product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //     product.category.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   // Stats calculations
// //   const totalProducts = products?.length || 0;
// //   const inStockProducts = products?.filter(p => p.in_stock)?.length || 0;
// //   const bestsellers = products?.filter(p => p.is_bestseller)?.length || 0;
// //   const lowStock = products?.filter(p => (p.stock_quantity || 0) < 10 && (p.stock_quantity || 0) > 0)?.length || 0;

// //   return (
// //     <div className="space-y-8">
// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
// //         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
// //           <CardContent className="p-6">
// //             <div className="flex items-center gap-4">
// //               <div className="p-3 rounded-2xl bg-primary/10">
// //                 <Package className="h-6 w-6 text-primary" />
// //               </div>
// //               <div>
// //                 <p className="text-sm text-muted-foreground">Total Products</p>
// //                 <p className="text-2xl font-display font-semibold text-foreground">{totalProducts}</p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
        
// //         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
// //           <CardContent className="p-6">
// //             <div className="flex items-center gap-4">
// //               <div className="p-3 rounded-2xl bg-sage/20">
// //                 <TrendingUp className="h-6 w-6 text-sage" />
// //               </div>
// //               <div>
// //                 <p className="text-sm text-muted-foreground">In Stock</p>
// //                 <p className="text-2xl font-display font-semibold text-foreground">{inStockProducts}</p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
        
// //         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
// //           <CardContent className="p-6">
// //             <div className="flex items-center gap-4">
// //               <div className="p-3 rounded-2xl bg-secondary/50">
// //                 <Star className="h-6 w-6 text-secondary-foreground" />
// //               </div>
// //               <div>
// //                 <p className="text-sm text-muted-foreground">Bestsellers</p>
// //                 <p className="text-2xl font-display font-semibold text-foreground">{bestsellers}</p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
        
// //         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
// //           <CardContent className="p-6">
// //             <div className="flex items-center gap-4">
// //               <div className="p-3 rounded-2xl bg-destructive/10">
// //                 <AlertCircle className="h-6 w-6 text-destructive" />
// //               </div>
// //               <div>
// //                 <p className="text-sm text-muted-foreground">Low Stock</p>
// //                 <p className="text-2xl font-display font-semibold text-foreground">{lowStock}</p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* Header */}
// //       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
// //         <div>
// //           <h2 className="font-display text-3xl font-semibold text-foreground">
// //             Products
// //           </h2>
// //           <p className="text-muted-foreground">Manage your product catalog</p>
// //         </div>
// //         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
// //           <DialogTrigger asChild>
// //             <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-hover transition-all">
// //               <Plus className="mr-2 h-4 w-4" />
// //               Add Product
// //             </Button>
// //           </DialogTrigger>
// //           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-hover">
// //             <DialogHeader>
// //               <DialogTitle className="font-display text-2xl">
// //                 {editingProduct ? "Edit Product" : "Add New Product"}
// //               </DialogTitle>
// //             </DialogHeader>
// //             <form onSubmit={handleSubmit} className="space-y-6">
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="name" className="text-foreground font-medium">Product Name *</Label>
// //                   <Input
// //                     id="name"
// //                     value={formData.name}
// //                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //                     className="border-border focus:ring-primary"
// //                     placeholder="Calm Clay Mug"
// //                     required
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="category" className="text-foreground font-medium">Category *</Label>
// //                   <Select 
// //                     value={formData.category} 
// //                     onValueChange={(value) => setFormData({ ...formData, category: value })}
// //                   >
// //                     <SelectTrigger>
// //                       <SelectValue placeholder="Select category" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {categories.map(cat => (
// //                         <SelectItem key={cat.value} value={cat.value}>
// //                           {cat.label}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="short_description" className="text-foreground font-medium">Short Description</Label>
// //                 <Input
// //                   id="short_description"
// //                   value={formData.short_description}
// //                   onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
// //                   className="border-border"
// //                   placeholder="Hand-glazed stoneware mug"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="description" className="text-foreground font-medium">Full Description</Label>
// //                 <Textarea
// //                   id="description"
// //                   value={formData.description}
// //                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
// //                   className="border-border min-h-[100px]"
// //                   placeholder="A beautifully hand-glazed ceramic mug..."
// //                   rows={4}
// //                 />
// //               </div>

// //               {/* Product Details Section */}
// //               <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
// //                 <h4 className="font-medium text-foreground">Product Details</h4>
// //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                   <div className="space-y-2">
// //                     <Label htmlFor="materials" className="text-foreground font-medium">Materials</Label>
// //                     <Input
// //                       id="materials"
// //                       value={formData.materials}
// //                       onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
// //                       className="border-border"
// //                       placeholder="Ceramic, Stoneware"
// //                     />
// //                   </div>
// //                   <div className="space-y-2">
// //                     <Label htmlFor="dimensions" className="text-foreground font-medium">Dimensions</Label>
// //                     <Input
// //                       id="dimensions"
// //                       value={formData.dimensions}
// //                       onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
// //                       className="border-border"
// //                       placeholder="10cm x 8cm x 8cm"
// //                     />
// //                   </div>
// //                   <div className="space-y-2">
// //                     <Label htmlFor="weight" className="text-foreground font-medium">Weight</Label>
// //                     <Input
// //                       id="weight"
// //                       value={formData.weight}
// //                       onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
// //                       className="border-border"
// //                       placeholder="350g"
// //                     />
// //                   </div>
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="care_instructions" className="text-foreground font-medium">Care Instructions</Label>
// //                   <Textarea
// //                     id="care_instructions"
// //                     value={formData.care_instructions}
// //                     onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
// //                     className="border-border"
// //                     placeholder="Hand wash recommended. Microwave safe..."
// //                     rows={3}
// //                   />
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="price" className="text-foreground font-medium">Price (₹) *</Label>
// //                   <Input
// //                     id="price"
// //                     type="number"
// //                     step="0.01"
// //                     value={formData.price}
// //                     onChange={(e) => setFormData({ ...formData, price: e.target.value })}
// //                     className="border-border"
// //                     placeholder="699"
// //                     required
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="original_price" className="text-foreground font-medium">Original Price (₹)</Label>
// //                   <Input
// //                     id="original_price"
// //                     type="number"
// //                     step="0.01"
// //                     value={formData.original_price}
// //                     onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
// //                     className="border-border"
// //                     placeholder="899"
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <Label htmlFor="stock_quantity" className="text-foreground font-medium">Stock Quantity</Label>
// //                   <Input
// //                     id="stock_quantity"
// //                     type="number"
// //                     value={formData.stock_quantity}
// //                     onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
// //                     className="border-border"
// //                     placeholder="50"
// //                   />
// //                 </div>
// //               </div>

// //               {/* Image Upload Section */}
// //               <div className="space-y-4">
// //                 <Label className="text-foreground font-medium">Product Images</Label>
                
// //                 {/* Upload Area */}
// //                 <div 
// //                   className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
// //                   onClick={() => fileInputRef.current?.click()}
// //                 >
// //                   <input
// //                     ref={fileInputRef}
// //                     type="file"
// //                     accept="image/*"
// //                     multiple
// //                     onChange={handleImageUpload}
// //                     className="hidden"
// //                   />
// //                   <div className="flex flex-col items-center gap-3">
// //                     {uploadingImages ? (
// //                       <Loader2 className="h-10 w-10 text-primary animate-spin" />
// //                     ) : (
// //                       <Upload className="h-10 w-10 text-muted-foreground" />
// //                     )}
// //                     <div>
// //                       <p className="font-medium text-foreground">
// //                         {uploadingImages ? "Uploading..." : "Click to upload images"}
// //                       </p>
// //                       <p className="text-sm text-muted-foreground">
// //                         PNG, JPG, WEBP up to 10MB
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Image Preview Grid */}
// //                 {formData.images.length > 0 && (
// //                   <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
// //                     {formData.images.map((url, index) => (
// //                       <div key={index} className="relative group aspect-square">
// //                         <img
// //                           src={url}
// //                           alt={`Product ${index + 1}`}
// //                           className="w-full h-full object-cover rounded-xl border border-border"
// //                         />
// //                         <button
// //                           type="button"
// //                           onClick={() => removeImage(index)}
// //                           className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-soft"
// //                         >
// //                           <X className="h-3 w-3" />
// //                         </button>
// //                         {index === 0 && (
// //                           <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
// //                             Main
// //                           </span>
// //                         )}
// //                       </div>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Status Toggles */}
// //               <div className="flex flex-wrap items-center gap-6 p-4 bg-muted/30 rounded-xl">
// //                 <div className="flex items-center gap-3">
// //                   <Switch
// //                     id="is_bestseller"
// //                     checked={formData.is_bestseller}
// //                     onCheckedChange={(checked) => setFormData({ ...formData, is_bestseller: checked })}
// //                   />
// //                   <Label htmlFor="is_bestseller" className="cursor-pointer text-foreground">
// //                     Bestseller
// //                   </Label>
// //                 </div>
// //                 <div className="flex items-center gap-3">
// //                   <Switch
// //                     id="is_new"
// //                     checked={formData.is_new}
// //                     onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
// //                   />
// //                   <Label htmlFor="is_new" className="cursor-pointer text-foreground">
// //                     New Arrival
// //                   </Label>
// //                 </div>
// //               </div>

// //               <div className="flex justify-end gap-3 pt-4 border-t border-border">
// //                 <Button type="button" variant="outline" onClick={handleCloseDialog}>
// //                   Cancel
// //                 </Button>
// //                 <Button
// //                   type="submit"
// //                   className="bg-primary text-primary-foreground shadow-soft"
// //                   disabled={createMutation.isPending || updateMutation.isPending || !formData.name || !formData.price || !formData.category}
// //                 >
// //                   {(createMutation.isPending || updateMutation.isPending) && (
// //                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                   )}
// //                   {editingProduct ? "Update Product" : "Create Product"}
// //                 </Button>
// //               </div>
// //             </form>
// //           </DialogContent>
// //         </Dialog>
// //       </div>

// //       {/* Products Table */}
// //       <Card className="border-0 shadow-soft overflow-hidden">
// //         <CardHeader className="bg-muted/30 border-b border-border">
// //           <div className="flex items-center gap-4">
// //             <div className="relative flex-1 max-w-sm">
// //               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //               <Input
// //                 placeholder="Search products..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="pl-9 border-border bg-card"
// //               />
// //             </div>
// //           </div>
// //         </CardHeader>
// //         <CardContent className="p-0">
// //           {isLoading ? (
// //             <div className="flex items-center justify-center h-48">
// //               <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //             </div>
// //           ) : filteredProducts && filteredProducts.length > 0 ? (
// //             <div className="overflow-x-auto">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow className="bg-muted/30 hover:bg-muted/30">
// //                     <TableHead className="font-semibold">Product</TableHead>
// //                     <TableHead className="font-semibold">Category</TableHead>
// //                     <TableHead className="font-semibold">Price</TableHead>
// //                     <TableHead className="font-semibold">Stock</TableHead>
// //                     <TableHead className="font-semibold">Status</TableHead>
// //                     <TableHead className="font-semibold text-right">Actions</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {filteredProducts.map((product) => (
// //                     <TableRow key={product.id} className="group">
// //                       <TableCell>
// //                         <div className="flex items-center gap-4">
// //                           <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
// //                             {product.images && product.images[0] ? (
// //                               <img
// //                                 src={product.images[0]}
// //                                 alt={product.name}
// //                                 className="h-full w-full object-cover"
// //                               />
// //                             ) : (
// //                               <ImageIcon className="h-6 w-6 text-muted-foreground" />
// //                             )}
// //                           </div>
// //                           <div>
// //                             <p className="font-medium text-foreground">{product.name}</p>
// //                             <p className="text-sm text-muted-foreground line-clamp-1">
// //                               {product.short_description}
// //                             </p>
// //                           </div>
// //                         </div>
// //                       </TableCell>
// //                       <TableCell>
// //                         <span className="px-3 py-1 rounded-full bg-muted text-sm text-foreground">
// //                           {categories.find(c => c.value === product.category)?.label || product.category}
// //                         </span>
// //                       </TableCell>
// //                       <TableCell>
// //                         <div className="flex flex-col">
// //                           <span className="font-semibold text-foreground">₹{Number(product.price).toLocaleString()}</span>
// //                           {product.original_price && (
// //                             <span className="text-sm text-muted-foreground line-through">
// //                               ₹{Number(product.original_price).toLocaleString()}
// //                             </span>
// //                           )}
// //                         </div>
// //                       </TableCell>
// //                       <TableCell>
// //                         <span className={`font-medium ${(product.stock_quantity || 0) < 10 ? 'text-destructive' : 'text-foreground'}`}>
// //                           {product.stock_quantity}
// //                         </span>
// //                       </TableCell>
// //                       <TableCell>
// //                         <div className="flex flex-wrap gap-1">
// //                           <span
// //                             className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
// //                               product.in_stock
// //                                 ? "bg-primary/20 text-primary"
// //                                 : "bg-destructive/20 text-destructive"
// //                             }`}
// //                           >
// //                             {product.in_stock ? "In Stock" : "Out of Stock"}
// //                           </span>
// //                           {product.is_bestseller && (
// //                             <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
// //                               Bestseller
// //                             </span>
// //                           )}
// //                           {product.is_new && (
// //                             <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-sage/20 text-foreground">
// //                               New
// //                             </span>
// //                           )}
// //                         </div>
// //                       </TableCell>
// //                       <TableCell className="text-right">
// //                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
// //                           <Button
// //                             variant="ghost"
// //                             size="icon"
// //                             onClick={() => setVariantProduct(product)}
// //                             className="hover:bg-secondary/50 hover:text-secondary-foreground"
// //                             title="Manage Variants"
// //                           >
// //                             <Palette className="h-4 w-4" />
// //                           </Button>
// //                           <Button
// //                             variant="ghost"
// //                             size="icon"
// //                             onClick={() => handleEdit(product)}
// //                             className="hover:bg-primary/10 hover:text-primary"
// //                           >
// //                             <Pencil className="h-4 w-4" />
// //                           </Button>
// //                           <Button
// //                             variant="ghost"
// //                             size="icon"
// //                             className="hover:bg-destructive/10 text-destructive hover:text-destructive"
// //                             onClick={() => setDeleteProductId(product.id)}
// //                           >
// //                             <Trash2 className="h-4 w-4" />
// //                           </Button>
// //                         </div>
// //                       </TableCell>
// //                     </TableRow>
// //                   ))}
// //                 </TableBody>
// //               </Table>
// //             </div>
// //           ) : (
// //             <div className="flex flex-col items-center justify-center py-16 text-center">
// //               <div className="p-4 rounded-full bg-muted mb-4">
// //                 <Package className="h-8 w-8 text-muted-foreground" />
// //               </div>
// //               <p className="text-lg font-medium text-foreground mb-1">No products found</p>
// //               <p className="text-muted-foreground">
// //                 Add your first product to get started.
// //               </p>
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       {/* Delete Confirmation Dialog */}
// //       <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
// //         <AlertDialogContent className="border-0 shadow-hover">
// //           <AlertDialogHeader>
// //             <AlertDialogTitle className="font-display">Delete Product</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               Are you sure you want to delete this product? This action cannot be undone.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel>Cancel</AlertDialogCancel>
// //             <AlertDialogAction
// //               onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
// //               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
// //             >
// //               {deleteMutation.isPending ? (
// //                 <Loader2 className="h-4 w-4 animate-spin" />
// //               ) : (
// //                 "Delete"
// //               )}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>

// //       {/* Variant Management Dialog */}
// //       {variantProduct && (
// //         <VariantManagement
// //           productId={variantProduct.id}
// //           productName={variantProduct.name}
// //           open={!!variantProduct}
// //           onOpenChange={(open) => !open && setVariantProduct(null)}
// //         />
// //       )}
// //     </div>
// //   );
// // };