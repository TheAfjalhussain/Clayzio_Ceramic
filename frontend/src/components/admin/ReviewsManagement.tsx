import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Check, 
  X, 
  Trash2, 
  Loader2, 
  Search,
  MessageSquare,
  ThumbsUp,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  products?: { name: string } | null;
}

export const ReviewsManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => adminApi.getReviews(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      adminApi.updateReviewStatus(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Review status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating review", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Review deleted" });
      setDeleteReviewId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error deleting review", description: error.message, variant: "destructive" });
    },
  });

  const reviewsList = Array.isArray(reviews) ? reviews : [];
  
  const filteredReviews = reviewsList.filter((review) =>
    review.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingReviews = reviewsList.filter(r => !r.is_approved)?.length || 0;
  const approvedReviews = reviewsList.filter(r => r.is_approved)?.length || 0;
  const avgRating = reviewsList.length 
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1) 
    : "0.0";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-100">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-display font-semibold text-foreground">{avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-100">
                <ThumbsUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-display font-semibold text-foreground">{approvedReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-display font-semibold text-foreground">{pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-foreground">Reviews</h2>
          <p className="text-muted-foreground">Manage customer reviews</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden md:table-cell">Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium max-w-[150px] truncate">
                    {review.products?.name || "Unknown Product"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.reviewer_name}</p>
                      <p className="text-xs text-muted-foreground">{review.reviewer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[250px]">
                    <p className="truncate text-muted-foreground">{review.comment}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.is_approved ? "default" : "secondary"}>
                      {review.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {!review.is_approved ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => approveMutation.mutate({ id: review.id, approved: true })}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => approveMutation.mutate({ id: review.id, approved: false })}
                          className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteReviewId(review.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReviewId && deleteMutation.mutate(deleteReviewId)}
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







// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
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
// import { Badge } from "@/components/ui/badge";
// import { 
//   Star, 
//   Check, 
//   X, 
//   Trash2, 
//   Loader2, 
//   Search,
//   MessageSquare,
//   ThumbsUp,
//   Clock
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Input } from "@/components/ui/input";
// import { format } from "date-fns";

// interface Review {
//   id: string;
//   product_id: string;
//   user_id: string | null;
//   reviewer_name: string;
//   reviewer_email: string | null;
//   rating: number;
//   title: string | null;
//   comment: string;
//   is_verified_purchase: boolean;
//   is_approved: boolean;
//   created_at: string;
//   products?: { name: string } | null;
// }

// export const ReviewsManagement = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: reviews, isLoading } = useQuery({
//     queryKey: ["admin-reviews"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("reviews")
//         .select(`*, products:product_id(name)`)
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       return data as Review[];
//     },
//   });

//   const approveMutation = useMutation({
//     mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
//       const { error } = await supabase
//         .from("reviews")
//         .update({ is_approved: approved })
//         .eq("id", id);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
//       toast({ title: "Review status updated" });
//     },
//     onError: (error) => {
//       toast({ title: "Error updating review", description: error.message, variant: "destructive" });
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const { error } = await supabase.from("reviews").delete().eq("id", id);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
//       toast({ title: "Review deleted" });
//       setDeleteReviewId(null);
//     },
//     onError: (error) => {
//       toast({ title: "Error deleting review", description: error.message, variant: "destructive" });
//     },
//   });

//   const filteredReviews = reviews?.filter((review) =>
//     review.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     review.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const pendingReviews = reviews?.filter(r => !r.is_approved)?.length || 0;
//   const approvedReviews = reviews?.filter(r => r.is_approved)?.length || 0;
//   const avgRating = reviews?.length 
//     ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
//     : "0.0";

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-amber-100">
//                 <Star className="h-6 w-6 text-amber-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Avg. Rating</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{avgRating}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-green-100">
//                 <ThumbsUp className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Approved</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{approvedReviews}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-orange-100">
//                 <Clock className="h-6 w-6 text-orange-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Pending</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{pendingReviews}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="font-display text-3xl font-semibold text-foreground">Reviews</h2>
//           <p className="text-muted-foreground">Manage customer reviews</p>
//         </div>
//         <div className="relative w-full sm:w-80">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search reviews..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <Card className="border-0 shadow-soft overflow-hidden">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/50">
//                 <TableHead>Product</TableHead>
//                 <TableHead>Reviewer</TableHead>
//                 <TableHead>Rating</TableHead>
//                 <TableHead className="hidden md:table-cell">Comment</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="hidden sm:table-cell">Date</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredReviews?.map((review) => (
//                 <TableRow key={review.id} className="hover:bg-muted/30">
//                   <TableCell className="font-medium max-w-[150px] truncate">
//                     {review.products?.name || "Unknown Product"}
//                   </TableCell>
//                   <TableCell>
//                     <div>
//                       <p className="font-medium">{review.reviewer_name}</p>
//                       <p className="text-xs text-muted-foreground">{review.reviewer_email}</p>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center gap-1">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
//                         />
//                       ))}
//                     </div>
//                   </TableCell>
//                   <TableCell className="hidden md:table-cell max-w-[250px]">
//                     <p className="truncate text-muted-foreground">{review.comment}</p>
//                   </TableCell>
//                   <TableCell>
//                     <Badge variant={review.is_approved ? "default" : "secondary"}>
//                       {review.is_approved ? "Approved" : "Pending"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="hidden sm:table-cell text-muted-foreground">
//                     {format(new Date(review.created_at), "MMM d, yyyy")}
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center justify-end gap-2">
//                       {!review.is_approved ? (
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => approveMutation.mutate({ id: review.id, approved: true })}
//                           className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
//                         >
//                           <Check className="h-4 w-4" />
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => approveMutation.mutate({ id: review.id, approved: false })}
//                           className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       )}
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => setDeleteReviewId(review.id)}
//                         className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {filteredReviews?.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-12">
//                     <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
//                     <p className="text-muted-foreground">No reviews found</p>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </Card>

//       {/* Delete Dialog */}
//       <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Review</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this review? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => deleteReviewId && deleteMutation.mutate(deleteReviewId)}
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
