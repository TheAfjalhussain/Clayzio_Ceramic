/**
 * Reviews API Service
 * 
 * Handles product reviews - fetch, create, and manage
 */

import { api, ApiResponse } from './client';

// ============ Types ============

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  reviewer_name: string;
  reviewer_email?: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase?: boolean;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReviewData {
  product_id: string;
  reviewer_name: string;
  reviewer_email?: string;
  rating: number;
  title?: string;
  comment: string;
}

// ============ API Methods ============

export const reviewsApi = {
  /**
   * Get reviews for a product (only approved ones)
   */
  getByProduct: async (productId: string): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Create a new review
   */
  create: async (data: CreateReviewData): Promise<Review> => {
    // Map frontend fields to backend expected format
    const payload = {
      product: data.product_id,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      reviewerName: data.reviewer_name,
      reviewerEmail: data.reviewer_email,
    };
    const response = await api.post<ApiResponse<Review>>('/reviews', payload);
    return response.data!;
  },

  /**
   * Update a review
   */
  update: async (id: string, data: Partial<CreateReviewData>): Promise<Review> => {
    const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
    return response.data!;
  },

  /**
   * Delete a review
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  /**
   * Get review statistics for a product
   */
  getStats: async (productId: string): Promise<{ average: number; count: number; distribution: Record<number, number> }> => {
    const response = await api.get<ApiResponse<{ average: number; count: number; distribution: Record<number, number> }>>(
      `/reviews/product/${productId}/stats`,
      { skipAuth: true }
    );
    return response.data || { average: 0, count: 0, distribution: {} };
  },

  /**
   * Mark a review as helpful
   */
  markHelpful: async (reviewId: string): Promise<void> => {
    await api.post(`/reviews/${reviewId}/helpful`, {}, { skipAuth: true });
  },

  /**
   * Get user's reviews
   */
  getMyReviews: async (): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>('/reviews/my-reviews');
    return response.data || [];
  },
};

export default reviewsApi;








// /**
//  * Reviews API Service
//  * 
//  * Handles product reviews - fetch, create, and manage
//  */

// import { api, ApiResponse } from './client';

// // ============ Types ============

// export interface Review {
//   id: string;
//   product_id: string;
//   user_id?: string;
//   reviewer_name: string;
//   reviewer_email?: string;
//   rating: number;
//   title?: string;
//   comment: string;
//   is_verified_purchase?: boolean;
//   is_approved?: boolean;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface CreateReviewData {
//   product_id: string;
//   reviewer_name: string;
//   reviewer_email?: string;
//   rating: number;
//   title?: string;
//   comment: string;
// }

// // ============ API Methods ============

// export const reviewsApi = {
//   /**
//    * Get reviews for a product (only approved ones)
//    */
//   getByProduct: async (productId: string): Promise<Review[]> => {
//     const response = await api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`, { skipAuth: true });
//     return response.data || [];
//   },

//   /**
//    * Create a new review
//    */
//   create: async (data: CreateReviewData): Promise<Review> => {
//     const response = await api.post<ApiResponse<Review>>('/reviews', data, { skipAuth: true });
//     return response.data!;
//   },

//   /**
//    * Update a review
//    */
//   update: async (id: string, data: Partial<CreateReviewData>): Promise<Review> => {
//     const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
//     return response.data!;
//   },

//   /**
//    * Delete a review
//    */
//   delete: async (id: string): Promise<void> => {
//     await api.delete(`/reviews/${id}`);
//   },

//   /**
//    * Get review statistics for a product
//    */
//   getStats: async (productId: string): Promise<{ average: number; count: number; distribution: Record<number, number> }> => {
//     const response = await api.get<ApiResponse<{ average: number; count: number; distribution: Record<number, number> }>>(
//       `/reviews/product/${productId}/stats`,
//       { skipAuth: true }
//     );
//     return response.data || { average: 0, count: 0, distribution: {} };
//   },

//   /**
//    * Mark a review as helpful
//    */
//   markHelpful: async (reviewId: string): Promise<void> => {
//     await api.post(`/reviews/${reviewId}/helpful`, {}, { skipAuth: true });
//   },

//   /**
//    * Get user's reviews
//    */
//   getMyReviews: async (): Promise<Review[]> => {
//     const response = await api.get<ApiResponse<Review[]>>('/reviews/my-reviews');
//     return response.data || [];
//   },
// };

// export default reviewsApi;
