"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  contactService,
  HELP_TOPICS,
  type HelpTopic,
} from "@/services/contact.service";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 15 } },
};

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [topic, setTopic] = useState<HelpTopic>(HELP_TOPICS[0].value);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const field = (name: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      await contactService.submit({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        help_topic: topic,
      });
      setStatus("sent");
      setForm(EMPTY_FORM);
      setTopic(HELP_TOPICS[0].value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message.");
      setStatus("idle");
    }
  };

  return (
    <section className="container pt-10 md:pt-12 lg:pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left: visual */}
        <div className="relative overflow-hidden">
          <div className="absolute -left-4 -top-4 w-[250px] h-[120%] -z-10 pointer-events-none opacity-90">
            <Image
              src="/images/branding/element-1.svg"
              alt="Background Element"
              fill
              className="object-contain object-left"
            />
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-primary font-bold uppercase tracking-wider text-sm">Send a Message</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black tracking-tight">
              Tell us what you&apos;re printing
            </h2>
            <p className="text-[#666] text-base md:text-lg leading-relaxed max-w-lg">
              Drop the details below — sizes, quantities, deadlines, anything we should know.
              We&apos;ll come back with a quote and a recommended product the same day.
            </p>

            <div className="relative w-full h-[260px] md:h-[340px] rounded-[24px] overflow-hidden shadow-md mt-2">
              <Image
                src="/images/branding/girl-with-phone.jpg"
                alt="Customer chatting with Modfirst"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/922112345678"
                className="flex items-center gap-2 text-black hover:text-primary transition-colors"
              >
                <Image src="/images/icons/phone.svg" alt="Phone" width={20} height={20} />
                <span className="font-medium">+92 21 12345678</span>
              </a>
              <a
                href="mailto:hello@modfirst.com"
                className="flex items-center gap-2 text-black hover:text-primary transition-colors"
              >
                <Image src="/images/icons/mail.svg" alt="Email" width={20} height={20} />
                <span className="font-medium">hello@modfirst.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          onSubmit={handleSubmit}
          className="bg-white border border-[#E5E5E5] rounded-[24px] md:rounded-[32px] p-6 md:p-8 lg:p-10 shadow-sm flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">First name</label>
              <input
                type="text"
                placeholder="Jane"
                value={form.first_name}
                onChange={field("first_name")}
                required
                autoComplete="given-name"
                className="h-12 px-4 rounded-xl border border-[#E5E5E5] bg-white focus:outline-none focus:border-primary transition-colors text-base"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">Last name</label>
              <input
                type="text"
                placeholder="Cooper"
                value={form.last_name}
                onChange={field("last_name")}
                required
                autoComplete="family-name"
                className="h-12 px-4 rounded-xl border border-[#E5E5E5] bg-white focus:outline-none focus:border-primary transition-colors text-base"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={field("email")}
                required
                autoComplete="email"
                className="h-12 px-4 rounded-xl border border-[#E5E5E5] bg-white focus:outline-none focus:border-primary transition-colors text-base"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">Phone</label>
              <input
                type="tel"
                placeholder="+92 312 1234567"
                value={form.phone}
                onChange={field("phone")}
                required
                autoComplete="tel"
                className="h-12 px-4 rounded-xl border border-[#E5E5E5] bg-white focus:outline-none focus:border-primary transition-colors text-base"
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-black">What can we help with?</label>
            <div className="flex flex-wrap gap-2">
              {HELP_TOPICS.map((t) => (
                <label
                  key={t.value}
                  className="cursor-pointer px-4 py-2 rounded-full border border-[#E5E5E5] bg-white text-sm text-[#464545] hover:border-primary has-checked:bg-primary has-checked:text-black has-checked:border-primary transition-colors"
                >
                  <input
                    type="radio"
                    name="topic"
                    value={t.value}
                    checked={topic === t.value}
                    onChange={() => setTopic(t.value)}
                    className="sr-only"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Message</label>
            <textarea
              rows={5}
              placeholder="Tell us a little about your project — size, quantity, deadline…"
              value={form.message}
              onChange={field("message")}
              required
              className="px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white focus:outline-none focus:border-primary transition-colors text-base resize-none"
            />
          </motion.div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {status === "sent" && (
            <p className="text-sm text-green-700" role="status">
              Thanks — your message is with us. We reply within a few hours.
            </p>
          )}

          <motion.div variants={itemVariants} className="flex items-center gap-3 mt-2">
            <Button type="submit" variant="default" size="xl" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send Message"}
            </Button>
            <span className="text-sm text-[#666] hidden sm:block">We reply within a few hours.</span>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}
