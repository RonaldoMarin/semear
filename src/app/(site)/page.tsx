import { Contact } from "@/components/landing/Contact";
import { Fronts } from "@/components/landing/Fronts";
import { Hero } from "@/components/landing/Hero";
import { Mission } from "@/components/landing/Mission";
import { NextMission } from "@/components/landing/NextMission";
import { Participation } from "@/components/landing/Participation";
import { StorySection } from "@/components/landing/StorySection";
import { Upcoming } from "@/components/landing/Upcoming";

// a faixa "próxima missão" lê o banco: a home é refeita no máximo a cada minuto
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Hero />
      <NextMission />
      <Mission />
      <Fronts />
      <StorySection />
      <Participation />
      <Upcoming />
      <Contact />
    </>
  );
}
