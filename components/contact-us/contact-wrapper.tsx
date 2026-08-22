"use client";

import { ContactHero } from "@/components/contact-us/contact-hero";
import { ContactInfo } from "@/components/contact-us/contact-info";
import { ContactForm } from "@/components/contact-us/contact-form";
import { ContactFaq } from "@/components/contact-us/contact-faq";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const ContactWrapper = () => {
  return (
    <>
      <ContactHero />
      <ScrollReveal><ContactInfo /></ScrollReveal>
      <ScrollReveal><ContactForm /></ScrollReveal>
      <ScrollReveal><ContactFaq /></ScrollReveal>
      <ScrollReveal><NewsletterSection /></ScrollReveal>
    </>
  );
};

export default ContactWrapper;
