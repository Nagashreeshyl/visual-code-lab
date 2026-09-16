import Link from "next/link";

export function WaitlistForm({ variant }: { variant: "hero" | "cta" }) {
  const isCta = variant === "cta";

  return (
    <div className={isCta ? "flex justify-center" : "flex justify-center"}>
      <Link
        href="/studio"
        className={
          isCta
            ? "font-display inline-flex h-14 items-center rounded-lg bg-charcoal px-10 text-xl text-white shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105"
            : "font-display inline-flex h-14 items-center rounded-lg bg-accent px-10 text-xl text-charcoal transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105"
        }
      >
        Open studio
      </Link>
    </div>
  );
}
