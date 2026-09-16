import { Highlight } from "@/components/landing/Highlight";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { BrowserMockup } from "@/components/landing/BrowserMockup";

export function Hero() {
  return (
    <section className="grid-hero px-4 pt-24 pb-16 md:px-6 md:pt-32 md:pb-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="meta inline-flex items-center gap-2 text-charcoal/70">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          Local-first visual studio
        </p>
        <h1 className="font-display mt-8 text-[2.6rem] leading-[0.95] text-charcoal sm:text-6xl md:text-8xl lg:text-9xl">
          See complex code. Then make it <Highlight>short.</Highlight>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-charcoal/70">
          Paste a messy program. Get a one-look picture of what it does, a shorter rewrite, and a
          walkthrough that plays beside your code.
        </p>
        <div className="mt-10 w-full">
          <WaitlistForm variant="hero" />
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-5xl">
        <BrowserMockup />
      </div>
    </section>
  );
}
