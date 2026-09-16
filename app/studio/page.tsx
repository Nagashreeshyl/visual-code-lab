import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StudioApp } from "@/components/studio/StudioApp";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ example?: string; lesson?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <Header />
      <main id="main">
        <StudioApp
          key={`${params.example ?? ""}-${params.lesson ?? ""}`}
          exampleId={params.example}
          lessonId={params.lesson}
        />
      </main>
      <Footer />
    </>
  );
}
