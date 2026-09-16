import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-5xl md:text-6xl">
            VCL<span className="text-accent">.</span>
          </p>
          <p className="mt-6 max-w-md text-lg text-sage">
            A local-first studio for seeing complex code, then making it short. Groq first.
            OpenRouter free as fallback.
          </p>
        </div>
        <div>
          <p className="meta mb-6 text-sage">Product</p>
          <ul className="space-y-3 text-lg">
            <li>
              <Link href="/studio" className="hover-link">
                Studio
              </Link>
            </li>
            <li>
              <Link href="/#features" className="hover-link">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover-link">
                How it works
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="meta mb-6 text-sage">Powered by</p>
          <ul className="space-y-3 text-lg">
            <li>
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="hover-link">
                Groq
              </a>
            </li>
            <li>
              <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="hover-link">
                OpenRouter
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sage/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-sm text-sage md:flex-row md:justify-between">
          <p>© 2026 Visual Code Lab</p>
          <p>Simulated walkthroughs. Not a debugger.</p>
        </div>
      </div>
    </footer>
  );
}
