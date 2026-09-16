const STEPS = [
  {
    n: "01",
    title: "Paste the mess",
    body: "Drop JavaScript, TypeScript, or Python. Other languages still get a picture and a rewrite.",
  },
  {
    n: "02",
    title: "Explain visually",
    body: "Three calls run in parallel: analyze, shorten, trace. Groq if it is up. OpenRouter free if it is not.",
  },
  {
    n: "03",
    title: "Play beside the code",
    body: "The walkthrough sits next to your paste. Memory boxes update, output appears, and you can save the lesson on this device.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-paper px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[1fr_2fr]">
        <h2 className="font-display text-5xl md:sticky md:top-28 md:self-start md:text-7xl">
          How it works
        </h2>
        <ol className="space-y-4">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="group relative overflow-hidden rounded-2xl border border-charcoal/10 bg-white p-8 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(23,30,25,0.12)]"
            >
              <span className="font-display pointer-events-none absolute top-2 right-4 text-8xl text-accent/20 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-accent">
                {step.n}
              </span>
              <p className="font-display relative text-3xl">{step.title}</p>
              <p className="relative mt-3 max-w-md text-charcoal/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
