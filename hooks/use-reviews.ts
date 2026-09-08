import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  reviewService,
  type CreateReviewInput,
  type ReviewListParams,
} from "@/services/review.service";

export function useReviews(params: ReviewListParams = {}) {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: () => reviewService.list(params),
    enabled: !!params.filters?.product_id,
  });
}

/** Submitting refreshes the product's review list so the new entry shows up. */
export function useCreateReview(productId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.create(input),
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
    },
  });
}

export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) => reviewService.markHelpful(reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
