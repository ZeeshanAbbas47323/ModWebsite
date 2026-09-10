import apiClient from "@/lib/axios";
import { omitEmpty } from "@/lib/utils";

export interface ApparelQuoteInput {
  full_name: string;
  business_name?: string;
  email: string;
  phone: string;
  phone_country_code?: string;

  order_types?: string[];
  garment_types?: string[];
  print_locations?: string[];
  artwork_status?: string[];

  garment_colors?: string;
  quantity?: string;
  size_breakdown?: string;
  personalization?: string;
  artwork_url?: string;

  /** YYYY-MM-DD, assembled from the three-part date input. */
  date_needed?: string;
  delivery_method?: string;
  project_details?: string;
}

export const apparelQuoteService = {
  submit: async (input: ApparelQuoteInput): Promise<void> => {
    await apiClient.post("/apparel-quote-requests", omitEmpty(input));
  },
};
