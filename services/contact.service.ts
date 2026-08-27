import apiClient from "@/lib/axios";
import { omitEmpty } from "@/lib/utils";

/** The topics the API accepts, paired with what the form shows. */
export const HELP_TOPICS = [
  { value: "custom_order", label: "Custom Order" },
  { value: "dtf_transfer", label: "DTF Transfer" },
  { value: "bulk_quote", label: "Bulk Quote" },
  { value: "artwork_help", label: "Artwork Help" },
  { value: "shipping", label: "Shipping" },
  { value: "other", label: "Other" },
] as const;

export type HelpTopic = (typeof HELP_TOPICS)[number]["value"];

export interface ContactSubmissionInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  help_topic?: HelpTopic;
}

export const contactService = {
  submit: async (input: ContactSubmissionInput): Promise<void> => {
    await apiClient.post("/contact-submissions", omitEmpty(input));
  },
};
