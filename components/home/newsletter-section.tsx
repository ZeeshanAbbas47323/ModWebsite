"use client";

import { useState, type FormEventHandler } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useHomeSection } from "@/hooks/use-home-section";
import { mapHomeNewsletter } from "@/lib/map-home-newsletter";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 15 },
  },
};

export function NewsletterSection() {
  const { data: section, isLoading } = useHomeSection("home_newsletter");
  const newsletter = mapHomeNewsletter(section);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!email.trim() || !newsletter) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletters/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "footer",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        setStatus("error");
        setMessage(data?.message || "Subscription failed. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data?.message || "Subscribed successfully!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <section className="container py-10 md:py-12 lg:py-16">
        <div className="w-full rounded-[24px] md:rounded-[32px] min-h-[280px] bg-gray-100 animate-pulse" />
      </section>
    );
  }

  if (!newsletter) return null;

  return (
    <section className="container py-10 md:py-12 lg:py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="w-full rounded-[24px] md:rounded-[32px] p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center"
        style={{ background: newsletter.gradient }}
      >
        {newsletter.title ? (
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-[40px] font-bold mb-4 text-center tracking-tight"
            style={{ color: newsletter.titleColor }}
          >
            {newsletter.title}
          </motion.h2>
        ) : null}

        {newsletter.description ? (
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-center max-w-[775px] mb-8 leading-[1.6]"
            style={{ color: newsletter.descriptionColor }}
          >
            {newsletter.description}
          </motion.p>
        ) : null}

        <motion.form
          variants={itemVariants}
          className="flex flex-row items-center gap-3 w-full max-w-lg mx-auto"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder={newsletter.inputPlaceholder}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="flex-1 px-5 py-3 h-14 rounded-xl border border-[#848383] bg-white focus:outline-none focus:border-primary transition-all text-md text-muted-foreground disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-xl transition-colors shrink-0 disabled:opacity-60"
            aria-label="Subscribe"
          >
            <Image
              src={newsletter.submitIconUrl}
              alt="Send"
              width={24}
              height={24}
            />
          </button>
        </motion.form>

        {message ? (
          <p
            className={`mt-4 text-sm text-center ${
              status === "success" ? "text-black" : "text-red-600"
            }`}
          >
            {message}
          </p>
        ) : null}
      </motion.div>
    </section>
  );
}
