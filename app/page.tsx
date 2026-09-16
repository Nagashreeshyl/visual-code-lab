import { Bento } from "@/components/landing/Bento";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <ProblemSolution />
        <Bento />
        <HowItWorks />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
