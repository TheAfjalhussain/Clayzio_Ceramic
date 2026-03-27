import { useState } from 'react';
import { Star, User, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ProductReviewsProps {
  productId: string;
  productName: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    comment: '',
  });
  
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const data = await reviewsApi.getByProduct(productId);
      return data as Review[];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await reviewsApi.create({
        product_id: productId,
        reviewer_name: formData.name,
        reviewer_email: formData.email,
        rating,
        title: formData.title || undefined,
        comment: formData.comment,
      });
    },
    onSuccess: () => {
      toast.success('Thank you! Your review has been submitted for approval.');
      setShowForm(false);
      setRating(0);
      setFormData({ name: '', email: '', title: '', comment: '' });
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review. Please try again.');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!formData.name || !formData.comment) {
      toast.error('Please fill in all required fields');
      return;
    }
    submitMutation.mutate();
  };

  const avgRating = reviews?.length 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews?.filter(r => r.rating === rating).length || 0,
    percentage: reviews?.length 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="bg-muted/30 rounded-3xl p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <h3 className="font-display text-2xl font-semibold mb-4">Customer Reviews</h3>
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
              <span className="text-5xl font-display font-bold">{avgRating.toFixed(1)}</span>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(avgRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {reviews?.length || 0} reviews
                </p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="rounded-full">
              Write a Review
            </Button>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {ratingCounts.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium w-12">{rating} star</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-card rounded-3xl p-6 lg:p-8 shadow-soft border border-soft-line animate-fade-in">
          <h4 className="font-display text-xl font-semibold mb-6">Write Your Review</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium mb-3">Your Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        (hoverRating || rating) >= star
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                  </span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email (optional)</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Summarize your experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Review *</label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Tell us about your experience with this product..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitMutation.isPending} className="rounded-full">
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-2xl p-6 shadow-soft border border-soft-line">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{review.reviewer_name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              {review.title && (
                <h5 className="font-semibold mb-2">{review.title}</h5>
              )}
              <p className="text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this product!</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-full">
            Write a Review
          </Button>
        </div>
      )}
    </div>
  );
}
