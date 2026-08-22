"use client";

import { AboutHero } from "@/components/about-us/about-hero";
import { OurStory } from "@/components/about-us/our-story";
import { OurValues } from "@/components/about-us/our-values";
import { TeamSection } from "@/components/about-us/team-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { CustomerFeedback } from "@/components/home/customer-feedback";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const AboutWrapper = () => {
  return (
    <>
      <AboutHero />
      <ScrollReveal><OurStory /></ScrollReveal>
      <ScrollReveal><OurValues /></ScrollReveal>
      <ScrollReveal><TeamSection /></ScrollReveal>
      <ScrollReveal><CustomerFeedback /></ScrollReveal>
      <ScrollReveal><NewsletterSection /></ScrollReveal>
    </>
  );
};

export default AboutWrapper;
