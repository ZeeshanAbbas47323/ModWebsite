import apiClient from "@/lib/axios";
import { omitEmpty } from "@/lib/utils";

export interface Net30ApplicationInput {
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  company_tax_id: string;
  phone: string;
  phone_country_code?: string;
  /** Whole number of years. */
  years_in_business: number;
  requested_credit_amount: number;
  resale_certificate_url?: string;
  business_license_url?: string;
}

export const net30Service = {
  submit: async (input: Net30ApplicationInput): Promise<void> => {
    await apiClient.post("/net30-applications", omitEmpty(input));
  },
};
