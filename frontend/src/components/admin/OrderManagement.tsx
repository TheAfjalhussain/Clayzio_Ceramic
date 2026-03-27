import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Order, OrderItem } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Eye, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminApi.getOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    },
  });

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
  };

  const ordersList: Order[] = Array.isArray(orders) ? orders : [];
  const filteredOrders = ordersList.filter((order) => {
    const orderId = order.id || '';
    const matchesSearch = orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "processing":
        return "bg-primary/20 text-primary";
      case "shipped":
        return "bg-primary/30 text-primary";
      case "delivered":
        return "bg-primary text-primary-foreground";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Helper to get order properties with snake_case fallback
  const getOrderProp = (order: Order, prop: string) => {
    const snakeCase = prop.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    return (order as any)[prop] ?? (order as any)[snakeCase];
  };

  // Helper to get item properties with snake_case fallback
  const getItemProp = (item: OrderItem, prop: string) => {
    const snakeCase = prop.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    return (item as any)[prop] ?? (item as any)[snakeCase];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-semibold text-foreground">
          Orders
        </h2>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredOrders.map((order) => {
                    const orderId = order.id || '';
                    const createdAt = order.created_at || '';
                    const totalAmount = order.total_amount || 0;
                    const paymentStatus = order.payment_status || 'pending';
                    
                    return (
                      <TableRow key={orderId}>
                        <TableCell className="font-medium text-foreground">
                          #{orderId.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-foreground">
                          ₹{Number(totalAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateStatusMutation.mutate({ id: orderId, status: value })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              paymentStatus === "paid"
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {paymentStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No orders found
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Order Details #{(selectedOrder?.id || '').slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium text-foreground">
                    {selectedOrder.created_at 
                      ? new Date(selectedOrder.created_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground capitalize">
                    {selectedOrder.payment_method || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="font-medium text-foreground capitalize">
                    {selectedOrder.payment_status || "pending"}
                  </p>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                  <div className="p-3 bg-muted rounded-lg text-foreground">
                    {(() => {
                      const addr = selectedOrder.shipping_address;
                      if (typeof addr === "object" && addr) {
                        const addrObj = addr as any;
                        return (
                          <>
                            <p>{addrObj.fullName || addrObj.full_name}</p>
                            <p>{addrObj.address}</p>
                            <p>
                              {addrObj.city}, {addrObj.postalCode || addrObj.postal_code}
                            </p>
                            <p>{addrObj.phone}</p>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => {
                    const itemId = getItemProp(item, 'id') || index;
                    const productName = item.product_name || 'Unknown Product';
                    const productImage = item.product_image;
                    const unitPrice = item.unit_price || 0;
                    const totalPrice = item.total_price || 0;
                    
                    return (
                      <div
                        key={itemId}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {productImage && (
                            <img
                              src={productImage}
                              alt={productName}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{productName}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{Number(unitPrice).toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-foreground">
                          ₹{Number(totalPrice).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {selectedOrder.discount && Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-₹{Number(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.shipping_cost && Number(selectedOrder.shipping_cost) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>₹{Number(selectedOrder.shipping_cost).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span>₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};







// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminApi } from "@/lib/api/admin";
// import { Order } from "@/lib/api/orders";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
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
// import { Eye, Loader2, Search } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// const ORDER_STATUSES = [
//   { value: "pending", label: "Pending" },
//   { value: "processing", label: "Processing" },
//   { value: "shipped", label: "Shipped" },
//   { value: "delivered", label: "Delivered" },
//   { value: "cancelled", label: "Cancelled" },
// ];

// export const OrderManagement = () => {
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: orders, isLoading } = useQuery({
//     queryKey: ["admin-orders"],
//     queryFn: () => adminApi.getOrders(),
//   });

//   const updateStatusMutation = useMutation({
//     mutationFn: ({ id, status }: { id: string; status: string }) => 
//       adminApi.updateOrderStatus(id, status),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
//       toast({ title: "Order status updated" });
//     },
//     onError: (error: any) => {
//       toast({ title: "Error updating status", description: error.message, variant: "destructive" });
//     },
//   });

//   const handleViewOrder = async (order: Order) => {
//     setSelectedOrder(order);
//   };

//   const ordersList: Order[] = Array.isArray(orders) ? orders : [];
//   const filteredOrders = ordersList.filter((order) => {
//     const orderId = order.id || '';
//     const matchesSearch = orderId.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === "all" || order.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending":
//         return "bg-secondary text-secondary-foreground";
//       case "processing":
//         return "bg-primary/20 text-primary";
//       case "shipped":
//         return "bg-primary/30 text-primary";
//       case "delivered":
//         return "bg-primary text-primary-foreground";
//       case "cancelled":
//         return "bg-destructive/20 text-destructive";
//       default:
//         return "bg-muted text-muted-foreground";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="font-display text-3xl font-semibold text-foreground">
//           Orders
//         </h2>
//         <p className="text-muted-foreground">View and manage customer orders</p>
//       </div>

//       <Card className="border-border">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search by order ID..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-9"
//               />
//             </div>
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-40">
//                 <SelectValue placeholder="Filter status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Statuses</SelectItem>
//                 {ORDER_STATUSES.map((status) => (
//                   <SelectItem key={status.value} value={status.value}>
//                     {status.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="flex items-center justify-center h-32">
//               <Loader2 className="h-6 w-6 animate-spin text-primary" />
//             </div>
//           ) : filteredOrders.length > 0 ? (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Order ID</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Total</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Payment</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                 {filteredOrders.map((order) => {
//                     const orderId = order.id || '';
//                     const createdAt = order.created_at || '';
//                     const totalAmount = order.total_amount || 0;
//                     const paymentStatus = order.payment_status || 'pending';
                    
//                     return (
//                       <TableRow key={orderId}>
//                         <TableCell className="font-medium text-foreground">
//                           #{orderId.slice(0, 8)}
//                         </TableCell>
//                         <TableCell className="text-muted-foreground">
//                           {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
//                         </TableCell>
//                         <TableCell className="text-foreground">
//                           ₹{Number(totalAmount).toFixed(2)}
//                         </TableCell>
//                         <TableCell>
//                           <Select
//                             value={order.status}
//                             onValueChange={(value) =>
//                               updateStatusMutation.mutate({ id: orderId, status: value })
//                             }
//                           >
//                             <SelectTrigger className="w-32">
//                               <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
//                                 {order.status}
//                               </span>
//                             </SelectTrigger>
//                             <SelectContent>
//                               {ORDER_STATUSES.map((status) => (
//                                 <SelectItem key={status.value} value={status.value}>
//                                   {status.label}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </TableCell>
//                         <TableCell>
//                           <span
//                             className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
//                               paymentStatus === "paid"
//                                 ? "bg-primary/20 text-primary"
//                                 : "bg-secondary text-secondary-foreground"
//                             }`}
//                           >
//                             {paymentStatus}
//                           </span>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => handleViewOrder(order)}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </div>
//           ) : (
//             <p className="text-muted-foreground text-center py-8">
//               No orders found
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle className="font-display">
//               Order Details #{(selectedOrder?._id || selectedOrder?.id || '').slice(0, 8)}
//             </DialogTitle>
//           </DialogHeader>
//           {selectedOrder && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Order Date</p>
//                   <p className="font-medium text-foreground">
//                     {(selectedOrder.createdAt || selectedOrder.created_at) 
//                       ? new Date(selectedOrder.createdAt || selectedOrder.created_at || '').toLocaleString()
//                       : 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Status</p>
//                   <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
//                     {selectedOrder.status}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Payment Method</p>
//                   <p className="font-medium text-foreground capitalize">
//                     {selectedOrder.paymentMethod || selectedOrder.payment_method || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Payment Status</p>
//                   <p className="font-medium text-foreground capitalize">
//                     {selectedOrder.paymentStatus || selectedOrder.payment_status || "pending"}
//                   </p>
//                 </div>
//               </div>

//               {(selectedOrder.shippingAddress || selectedOrder.shipping_address) && (
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
//                   <div className="p-3 bg-muted rounded-lg text-foreground">
//                     {(() => {
//                       const addr = selectedOrder.shippingAddress || selectedOrder.shipping_address;
//                       if (typeof addr === "object" && addr) {
//                         return (
//                           <>
//                             <p>{addr.fullName || addr.full_name}</p>
//                             <p>{addr.address}</p>
//                             <p>
//                               {addr.city}, {addr.postalCode || addr.postal_code}
//                             </p>
//                             <p>{addr.phone}</p>
//                           </>
//                         );
//                       }
//                       return null;
//                     })()}
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <p className="text-sm text-muted-foreground mb-2">Order Items</p>
//                 <div className="space-y-2">
//                   {selectedOrder.items?.map((item, index) => {
//                     const itemId = item._id || item.id || index;
//                     const productName = item.productName || item.product_name || 'Unknown Product';
//                     const productImage = item.productImage || item.product_image;
//                     const unitPrice = item.unitPrice || item.unit_price || 0;
//                     const totalPrice = item.totalPrice || item.total_price || 0;
                    
//                     return (
//                       <div
//                         key={itemId}
//                         className="flex items-center justify-between p-3 bg-muted rounded-lg"
//                       >
//                         <div className="flex items-center gap-3">
//                           {productImage && (
//                             <img
//                               src={productImage}
//                               alt={productName}
//                               className="h-12 w-12 rounded-lg object-cover"
//                             />
//                           )}
//                           <div>
//                             <p className="font-medium text-foreground">{productName}</p>
//                             <p className="text-sm text-muted-foreground">
//                               ₹{Number(unitPrice).toFixed(2)} × {item.quantity}
//                             </p>
//                           </div>
//                         </div>
//                         <p className="font-semibold text-foreground">
//                           ₹{Number(totalPrice).toFixed(2)}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div className="border-t border-border pt-4 space-y-2">
//                 <div className="flex justify-between text-muted-foreground">
//                   <span>Subtotal</span>
//                   <span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
//                 </div>
//                 {selectedOrder.discount && Number(selectedOrder.discount) > 0 && (
//                   <div className="flex justify-between text-primary">
//                     <span>Discount</span>
//                     <span>-₹{Number(selectedOrder.discount).toFixed(2)}</span>
//                   </div>
//                 )}
//                 {(selectedOrder.shippingCost || selectedOrder.shipping_cost) && 
//                   Number(selectedOrder.shippingCost || selectedOrder.shipping_cost) > 0 && (
//                   <div className="flex justify-between text-muted-foreground">
//                     <span>Shipping</span>
//                     <span>₹{Number(selectedOrder.shippingCost || selectedOrder.shipping_cost).toFixed(2)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between text-lg font-semibold text-foreground pt-2 border-t border-border">
//                   <span>Total</span>
//                   <span>₹{Number(selectedOrder.totalAmount || selectedOrder.total_amount).toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };









// // import { useState } from "react";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
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
// // import { Eye, Loader2, Search } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { Tables } from "@/integrations/supabase/types";

// // type Order = Tables<"orders">;
// // type OrderItem = Tables<"order_items">;

// // const ORDER_STATUSES = [
// //   { value: "pending", label: "Pending" },
// //   { value: "processing", label: "Processing" },
// //   { value: "shipped", label: "Shipped" },
// //   { value: "delivered", label: "Delivered" },
// //   { value: "cancelled", label: "Cancelled" },
// // ];

// // export const OrderManagement = () => {
// //   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
// //   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [statusFilter, setStatusFilter] = useState<string>("all");
// //   const { toast } = useToast();
// //   const queryClient = useQueryClient();

// //   const { data: orders, isLoading } = useQuery({
// //     queryKey: ["admin-orders"],
// //     queryFn: async () => {
// //       const { data, error } = await supabase
// //         .from("orders")
// //         .select("*")
// //         .order("created_at", { ascending: false });
// //       if (error) throw error;
// //       return data;
// //     },
// //   });

// //   const updateStatusMutation = useMutation({
// //     mutationFn: async ({ id, status }: { id: string; status: string }) => {
// //       const { error } = await supabase
// //         .from("orders")
// //         .update({ status })
// //         .eq("id", id);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
// //       toast({ title: "Order status updated" });
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error updating status", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const handleViewOrder = async (order: Order) => {
// //     setSelectedOrder(order);
// //     const { data } = await supabase
// //       .from("order_items")
// //       .select("*")
// //       .eq("order_id", order.id);
// //     setOrderItems(data || []);
// //   };

// //   const filteredOrders = orders?.filter((order) => {
// //     const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
// //     const matchesStatus = statusFilter === "all" || order.status === statusFilter;
// //     return matchesSearch && matchesStatus;
// //   });

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case "pending":
// //         return "bg-secondary text-secondary-foreground";
// //       case "processing":
// //         return "bg-primary/20 text-primary";
// //       case "shipped":
// //         return "bg-primary/30 text-primary";
// //       case "delivered":
// //         return "bg-primary text-primary-foreground";
// //       case "cancelled":
// //         return "bg-destructive/20 text-destructive";
// //       default:
// //         return "bg-muted text-muted-foreground";
// //     }
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h2 className="font-display text-3xl font-semibold text-foreground">
// //           Orders
// //         </h2>
// //         <p className="text-muted-foreground">View and manage customer orders</p>
// //       </div>

// //       <Card className="border-border">
// //         <CardHeader>
// //           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
// //             <div className="relative flex-1 max-w-sm">
// //               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //               <Input
// //                 placeholder="Search by order ID..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="pl-9"
// //               />
// //             </div>
// //             <Select value={statusFilter} onValueChange={setStatusFilter}>
// //               <SelectTrigger className="w-40">
// //                 <SelectValue placeholder="Filter status" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="all">All Statuses</SelectItem>
// //                 {ORDER_STATUSES.map((status) => (
// //                   <SelectItem key={status.value} value={status.value}>
// //                     {status.label}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>
// //         </CardHeader>
// //         <CardContent>
// //           {isLoading ? (
// //             <div className="flex items-center justify-center h-32">
// //               <Loader2 className="h-6 w-6 animate-spin text-primary" />
// //             </div>
// //           ) : filteredOrders && filteredOrders.length > 0 ? (
// //             <div className="overflow-x-auto">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow>
// //                     <TableHead>Order ID</TableHead>
// //                     <TableHead>Date</TableHead>
// //                     <TableHead>Total</TableHead>
// //                     <TableHead>Status</TableHead>
// //                     <TableHead>Payment</TableHead>
// //                     <TableHead className="text-right">Actions</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {filteredOrders.map((order) => (
// //                     <TableRow key={order.id}>
// //                       <TableCell className="font-medium text-foreground">
// //                         #{order.id.slice(0, 8)}
// //                       </TableCell>
// //                       <TableCell className="text-muted-foreground">
// //                         {new Date(order.created_at).toLocaleDateString()}
// //                       </TableCell>
// //                       <TableCell className="text-foreground">
// //                         ${Number(order.total_amount).toFixed(2)}
// //                       </TableCell>
// //                       <TableCell>
// //                         <Select
// //                           value={order.status}
// //                           onValueChange={(value) =>
// //                             updateStatusMutation.mutate({ id: order.id, status: value })
// //                           }
// //                         >
// //                           <SelectTrigger className="w-32">
// //                             <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
// //                               {order.status}
// //                             </span>
// //                           </SelectTrigger>
// //                           <SelectContent>
// //                             {ORDER_STATUSES.map((status) => (
// //                               <SelectItem key={status.value} value={status.value}>
// //                                 {status.label}
// //                               </SelectItem>
// //                             ))}
// //                           </SelectContent>
// //                         </Select>
// //                       </TableCell>
// //                       <TableCell>
// //                         <span
// //                           className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
// //                             order.payment_status === "paid"
// //                               ? "bg-primary/20 text-primary"
// //                               : "bg-secondary text-secondary-foreground"
// //                           }`}
// //                         >
// //                           {order.payment_status || "pending"}
// //                         </span>
// //                       </TableCell>
// //                       <TableCell className="text-right">
// //                         <Button
// //                           variant="ghost"
// //                           size="icon"
// //                           onClick={() => handleViewOrder(order)}
// //                         >
// //                           <Eye className="h-4 w-4" />
// //                         </Button>
// //                       </TableCell>
// //                     </TableRow>
// //                   ))}
// //                 </TableBody>
// //               </Table>
// //             </div>
// //           ) : (
// //             <p className="text-muted-foreground text-center py-8">
// //               No orders found
// //             </p>
// //           )}
// //         </CardContent>
// //       </Card>

// //       <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
// //         <DialogContent className="max-w-2xl">
// //           <DialogHeader>
// //             <DialogTitle className="font-display">
// //               Order Details #{selectedOrder?.id.slice(0, 8)}
// //             </DialogTitle>
// //           </DialogHeader>
// //           {selectedOrder && (
// //             <div className="space-y-6">
// //               <div className="grid grid-cols-2 gap-4">
// //                 <div>
// //                   <p className="text-sm text-muted-foreground">Order Date</p>
// //                   <p className="font-medium text-foreground">
// //                     {new Date(selectedOrder.created_at).toLocaleString()}
// //                   </p>
// //                 </div>
// //                 <div>
// //                   <p className="text-sm text-muted-foreground">Status</p>
// //                   <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
// //                     {selectedOrder.status}
// //                   </span>
// //                 </div>
// //                 <div>
// //                   <p className="text-sm text-muted-foreground">Payment Method</p>
// //                   <p className="font-medium text-foreground capitalize">
// //                     {selectedOrder.payment_method || "N/A"}
// //                   </p>
// //                 </div>
// //                 <div>
// //                   <p className="text-sm text-muted-foreground">Payment Status</p>
// //                   <p className="font-medium text-foreground capitalize">
// //                     {selectedOrder.payment_status || "pending"}
// //                   </p>
// //                 </div>
// //               </div>

// //               {selectedOrder.shipping_address && (
// //                 <div>
// //                   <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
// //                   <div className="p-3 bg-muted rounded-lg text-foreground">
// //                     {typeof selectedOrder.shipping_address === "object" && (
// //                       <>
// //                         <p>{(selectedOrder.shipping_address as any).full_name}</p>
// //                         <p>{(selectedOrder.shipping_address as any).address}</p>
// //                         <p>
// //                           {(selectedOrder.shipping_address as any).city},{" "}
// //                           {(selectedOrder.shipping_address as any).postal_code}
// //                         </p>
// //                         <p>{(selectedOrder.shipping_address as any).phone}</p>
// //                       </>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               <div>
// //                 <p className="text-sm text-muted-foreground mb-2">Order Items</p>
// //                 <div className="space-y-2">
// //                   {orderItems.map((item) => (
// //                     <div
// //                       key={item.id}
// //                       className="flex items-center justify-between p-3 bg-muted rounded-lg"
// //                     >
// //                       <div className="flex items-center gap-3">
// //                         {item.product_image && (
// //                           <img
// //                             src={item.product_image}
// //                             alt={item.product_name}
// //                             className="h-12 w-12 rounded-lg object-cover"
// //                           />
// //                         )}
// //                         <div>
// //                           <p className="font-medium text-foreground">{item.product_name}</p>
// //                           <p className="text-sm text-muted-foreground">
// //                             ${Number(item.unit_price).toFixed(2)} × {item.quantity}
// //                           </p>
// //                         </div>
// //                       </div>
// //                       <p className="font-semibold text-foreground">
// //                         ${Number(item.total_price).toFixed(2)}
// //                       </p>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="border-t border-border pt-4 space-y-2">
// //                 <div className="flex justify-between text-muted-foreground">
// //                   <span>Subtotal</span>
// //                   <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
// //                 </div>
// //                 {selectedOrder.discount && Number(selectedOrder.discount) > 0 && (
// //                   <div className="flex justify-between text-primary">
// //                     <span>Discount</span>
// //                     <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
// //                   </div>
// //                 )}
// //                 {selectedOrder.shipping_cost && Number(selectedOrder.shipping_cost) > 0 && (
// //                   <div className="flex justify-between text-muted-foreground">
// //                     <span>Shipping</span>
// //                     <span>${Number(selectedOrder.shipping_cost).toFixed(2)}</span>
// //                   </div>
// //                 )}
// //                 <div className="flex justify-between text-lg font-semibold text-foreground pt-2 border-t border-border">
// //                   <span>Total</span>
// //                   <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
// //                 </div>
// //               </div>
// //             </div>
// //           )}
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   );
// // };
