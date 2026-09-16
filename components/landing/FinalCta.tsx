import { WaitlistForm } from "@/components/landing/WaitlistForm";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-accent px-6 py-28">
      <p
        aria-hidden
        className="font-display pointer-events-none absolute -top-8 left-0 text-[20vw] leading-none text-charcoal/10"
      >
        SHORT
      </p>
      <p
        aria-hidden
        className="font-display pointer-events-none absolute -bottom-10 right-0 text-[18vw] leading-none text-charcoal/10"
      >
        CODE
      </p>
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="font-display text-6xl leading-[0.9] text-charcoal md:text-8xl">
          Stop staring. Start seeing.
        </h2>
        <p className="mt-8 max-w-2xl text-2xl text-charcoal/80">
          Open the studio, paste a function, and get the picture in one click.
        </p>
        <div className="mt-12 w-full">
          <WaitlistForm variant="cta" />
        </div>
      </div>
    </section>
  );
}
