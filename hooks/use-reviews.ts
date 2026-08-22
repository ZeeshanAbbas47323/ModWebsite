import { useQuery } from "@tanstack/react-query";
import { reviewService, type ReviewListParams } from "@/services/review.service";

export function useReviews(params: ReviewListParams = {}) {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: () => reviewService.list(params),
    enabled: !!params.filters?.product_id,
  });
}
