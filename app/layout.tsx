import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visual Code Lab",
  description: "See complex code. Then make it short.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-charcoal">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[11000] focus:bg-accent focus:px-4 focus:py-2 focus:text-charcoal"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
