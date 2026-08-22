import Image from "next/image";

const stats = [
  { value: "8+", label: "Years Printing" },
  { value: "27M+", label: "Printing Media" },
  { value: "50k+", label: "Projects Done" },
  { value: "1k+", label: "Daily Customers" },
];

export function OurStory() {
  return (
    <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
      {/* Decorative element — mirrors WhyModfirst */}
      <div className="absolute right-[-5%] md:right-0 top-1/2 -translate-y-1/2 -z-10 w-[250px] md:w-[450px] h-[120%] opacity-90 pointer-events-none">
        <Image
          src="/images/branding/element-2.svg"
          alt="Background Element"
          fill
          className="object-contain object-right"
        />
      </div>

      <div className="container flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
        {/* Left images */}
        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
          <div className="col-span-2 relative h-40 md:h-64 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-md">
            <Image src="/images/branding/banner.jpg" alt="Modfirst studio" fill className="object-cover" />
          </div>
          <div className="relative h-40 md:h-64 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-md">
            <Image src="/images/branding/t-shirts.png" alt="Custom t-shirts" fill className="object-cover" />
          </div>
          <div className="relative h-40 md:h-64 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-md">
            <Image src="/images/branding/coffee-mugs.png" alt="Custom merchandise" fill className="object-cover" />
          </div>
        </div>

        {/* Right text */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <span className="text-primary font-bold uppercase tracking-wider text-sm">Our Story</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black tracking-tight">
            Built for makers who refuse to wait
          </h2>
          <p className="text-[#666] text-base md:text-lg leading-relaxed max-w-lg">
            Modfirst started in a small Karachi workshop with one DTF printer and a single rule:
            no minimums, no shortcuts, no missed deadlines. Today we print for thousands of brands across
            apparel, signage, packaging and promotional events — and we still answer every order ourselves.
          </p>
          <p className="text-[#666] text-base md:text-lg leading-relaxed max-w-lg">
            From a single sheet to ten thousand pieces, every job moves through the same line, the same eyes,
            and the same quality bar. That&apos;s the Modfirst difference.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-extrabold text-black mb-1">{s.value}</div>
                <div className="text-sm text-[#666]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
