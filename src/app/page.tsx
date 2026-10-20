import { Hero } from "@/components/home/hero";
import {
  CompanyBand,
  ContactSection,
  EducationSection,
  ExperienceSection,
  OpenSourceSection,
  Principles,
  ProofStrip,
  SelectedWork,
  StackSection,
} from "@/components/home/sections";
import { liveMetrics } from "@/lib/github";

// Home, in the order of §8.2.
export default async function Home() {
  const live = await liveMetrics();
  return (
    <>
      <Hero live={live} />
      <ProofStrip />
      <SelectedWork live={live} />
      <CompanyBand />
      <ExperienceSection />
      <OpenSourceSection />
      <Principles />
      <StackSection />
      <EducationSection />
      <ContactSection />
    </>
  );
}
