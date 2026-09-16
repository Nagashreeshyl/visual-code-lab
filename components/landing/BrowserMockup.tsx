export function BrowserMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-2xl">
      <div className="relative flex items-center border-b border-charcoal/10 px-4 py-3">
        <div className="flex gap-2" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-accent" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium text-charcoal/50">
          Visual Code Lab — studio
        </p>
      </div>
      <div className="grid min-h-[320px] grid-cols-1 md:grid-cols-2">
        <div className="border-b border-charcoal/10 p-6 md:border-r md:border-b-0">
          <p className="meta text-charcoal/40">Your code</p>
          <pre className="mt-4 font-mono text-sm leading-7 text-charcoal">
            <span className="block bg-accent/60 px-2">for name, subjects in students.items():</span>
            <span className="block px-2">    report(name, subjects)</span>
          </pre>
        </div>
        <div className="bg-paper p-6">
          <p className="meta text-charcoal/40">Now · step 3/6</p>
          <p className="font-display mt-3 text-3xl">name becomes Akash</p>
          <div className="mt-6 flex gap-3">
            <div className="rounded-xl bg-accent px-3 py-2">
              <p className="meta text-charcoal/50">name</p>
              <p className="font-mono text-sm">Akash</p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2">
              <p className="meta text-charcoal/50">total</p>
              <p className="font-mono text-sm">175</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
