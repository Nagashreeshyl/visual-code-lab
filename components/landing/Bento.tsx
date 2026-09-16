export function Bento() {
  return (
    <section id="features" className="scroll-mt-24 bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="meta text-charcoal/50">Features</p>
        <h2 className="font-display mt-4 max-w-3xl text-4xl md:text-7xl">
          Four surfaces. One paste.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-4 md:auto-rows-[400px] md:grid-cols-3">
          <article className="card-saas overflow-hidden rounded-2xl bg-paper p-8 md:col-span-2">
            <h3 className="font-display text-3xl">See the whole program</h3>
            <p className="mt-3 max-w-md text-charcoal/70">
              A playable picture of the program. Tap a station, watch values move, and the matching lines light up.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {["Starts with", "Repeats", "Changes", "Ends with"].map((label, index) => (
                <div
                  key={label}
                  className={`pulse-block rounded-xl px-4 py-6 text-sm ${
                    index === 1 ? "bg-charcoal text-accent" : "bg-white text-charcoal"
                  }`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  {label}
                </div>
              ))}
            </div>
          </article>

          <article className="card-saas rounded-2xl bg-charcoal p-8 text-white">
            <h3 className="font-display text-3xl">Walk it</h3>
            <p className="mt-3 text-sage">Beside the code. Watch memory boxes update as each line runs.</p>
            <div className="mt-10 space-y-3">
              {["line 2 · fetch user", "line 5 · parse json", "line 10 · callback"].map(
                (step, index) => (
                  <div
                    key={step}
                    className={`rounded-lg px-4 py-3 text-sm ${
                      index === 1 ? "bg-accent text-charcoal" : "bg-white/5"
                    }`}
                  >
                    {step}
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="card-saas rounded-2xl bg-paper p-8">
            <h3 className="font-display text-3xl">Keep it</h3>
            <p className="mt-3 text-charcoal/70">Lessons stay in IndexedDB. Reopen with zero API calls.</p>
            <div className="mt-10 flex -space-x-3">
              {["AK", "DR", "PS", "VCL"].map((initials) => (
                <div
                  key={initials}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-charcoal font-display text-xs text-accent grayscale"
                >
                  {initials}
                </div>
              ))}
            </div>
          </article>

          <article className="card-saas overflow-hidden rounded-2xl bg-ink p-8 text-white md:col-span-2">
            <h3 className="font-display text-3xl">Make it short</h3>
            <p className="mt-3 max-w-md text-sage">
              Side-by-side original vs rewrite, plus a list of what changed and why.
            </p>
            <pre className="mt-8 overflow-auto rounded-lg bg-charcoal p-5 font-mono text-sm leading-6 text-accent">
{`async function fetchUserData(id) {
  const user = await getUser(id);
  const posts = await getPosts(user.id);
  return { user, posts: posts.filter(p => p.published) };
}`}
            </pre>
          </article>
        </div>
      </div>
    </section>
  );
}
