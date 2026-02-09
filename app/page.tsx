import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { JobSection } from "@/components/home/JobSection";
import { ContractorSection } from "@/components/home/ContractorSection";
import { CTA } from "@/components/home/CTA";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <JobSection />
      <ContractorSection />
      <CTA />
    </div>
  );
}
