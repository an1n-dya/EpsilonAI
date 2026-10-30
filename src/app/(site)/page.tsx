import { AskCta } from "@/components/landing/ask-cta";
import { Hero } from "@/components/landing/hero";
import { HowItAnswers } from "@/components/landing/how-it-answers";
import { Models } from "@/components/landing/models";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItAnswers />
      <Models />
      <AskCta />
    </>
  );
}
