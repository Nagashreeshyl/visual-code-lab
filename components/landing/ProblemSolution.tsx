function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 shrink-0 stroke-[#ff5f57]" fill="none" aria-hidden>
      <path strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 shrink-0 stroke-accent" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <path strokeWidth="2" d="M8 12l3 3 5-6" />
    </svg>
  );
}

const OLD = [
  "Scroll a 400-line file hoping the shape appears.",
  "Rewrite by hand and accidentally change behavior.",
  "Treat a blog diagram as if it were your code.",
];

const NEXT = [
  "A one-look picture of the whole program, tied to your exact lines.",
  "A shorter rewrite that keeps the same language.",
  "A walkthrough beside the code that shows values moving.",
];

export function ProblemSolution() {
  return (
    <section className="grid md:grid-cols-2">
      <div className="flex items-start bg-charcoal px-8 py-20 text-white md:px-16">
        <div className="max-w-lg">
          <p className="font-display text-5xl md:text-7xl">The old way</p>
          <ul className="mt-10 space-y-5 text-lg text-sage">
            {OLD.map((item) => (
              <li key={item} className="flex gap-3">
                <XIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-start border-l-4 border-accent bg-ink px-8 py-20 text-white md:px-16">
        <div className="max-w-lg">
          <p className="font-display text-5xl md:text-7xl">The VCL way</p>
          <ul className="mt-10 space-y-5 text-lg text-white">
            {NEXT.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
