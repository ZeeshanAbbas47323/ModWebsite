"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FaqEntry } from "@/lib/parse-faq-content";

interface FaqAccordionProps {
  entries: FaqEntry[];
  /** Shown instead of the accordion when the page has no headings to split. */
  fallbackHtml?: string;
}

export function FaqAccordion({ entries, fallbackHtml }: FaqAccordionProps) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter(
      (entry) =>
        entry.question.toLowerCase().includes(needle) ||
        entry.answer.replace(/<[^>]*>/g, " ").toLowerCase().includes(needle)
    );
  }, [entries, query]);

  if (entries.length === 0) {
    return fallbackHtml ? (
      <div className="cms-prose max-w-3xl" dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
    ) : (
      <p className="text-gray-500">No questions have been published yet.</p>
    );
  }

  return (
    <>
      <div className="max-w-xl mb-8 md:mb-10">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the FAQs…"
          aria-label="Search the FAQs"
          className="h-12 rounded-xl bg-[#F4F4F5] border-transparent"
        />
        {query.trim() && (
          <p className="text-sm text-gray-500 mt-3">
            {matches.length} of {entries.length} questions match
          </p>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="bg-[#F4F4F5] rounded-[24px] p-10 text-center">
          <p className="text-gray-600 mb-6">
            Nothing matched &ldquo;{query.trim()}&rdquo;. Try a different word, or ask us directly.
          </p>
          <Link href="/contact-us"><Button size="xl">Contact us</Button></Link>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {matches.map((entry, index) => (
            <AccordionItem
              key={entry.question}
              value={entry.question}
              className="border-b border-gray-200"
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-bold hover:no-underline py-5 text-black [&>svg]:text-black gap-4">
                <span className="flex gap-4">
                  <span className="text-primary tabular-nums shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {entry.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div
                  className="cms-prose pl-0 md:pl-10"
                  dangerouslySetInnerHTML={{ __html: entry.answer }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </>
  );
}
