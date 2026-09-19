import { Contact } from "@/components/landing/Contact";
import { Hero } from "@/components/landing/Hero";
import { ImpactStats } from "@/components/landing/ImpactStats";
import { Mission } from "@/components/landing/Mission";
import { Participation } from "@/components/landing/Participation";
import { Projects } from "@/components/landing/Projects";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { StorySection } from "@/components/landing/StorySection";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main id="conteudo">
        <Hero />
        <Mission />
        <ImpactStats />
        <Projects />
        <StorySection />
        <Participation />
        <Contact />
      </main>

      <SiteFooter />
    </>
  );
}