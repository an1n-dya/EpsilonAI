import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Lightbulb, Shield, Activity } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold">About Epsilon</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <p>
              Epsilon is an AI assistant designed for truth and objectivity. 
              Epsilon represents a milestone in the journey toward AI systems
              that can reason accurately and provide reliable information.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8">Our mission</h2>
            <p>
              Our mission is to create AI that maximizes truth, minimizes bias, and 
              helps humans access and understand information more effectively. We 
              believe AI should be a reliable tool for enhancing human knowledge 
              and decision-making.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <ValueCard 
                icon={<Lightbulb />}
                title="Truth"
                description="We prioritize factual accuracy and clear reasoning in all interactions."
              />
              <ValueCard 
                icon={<Shield />}
                title="Objectivity"
                description="We strive to minimize bias and present balanced perspectives."
              />
              <ValueCard 
                icon={<Activity />}
                title="Utility"
                description="We build technology that genuinely helps people achieve their goals."
              />
            </div>
            
            <h2 className="text-2xl font-semibold mt-8">How Epsilon works</h2>
            <p>
              Epsilon is powered by a large language model trained on diverse datasets 
              to understand and generate human language. The model has been fine-tuned 
              for reasoning, factual accuracy, and objective analysis.
            </p>
            <p>
              Unlike many AI systems, Epsilon is designed to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Express uncertainty when it doesn't know something</li>
              <li>Consider multiple perspectives on complex topics</li>
              <li>Provide sources and reasoning for its conclusions when possible</li>
              <li>Minimize harmful outputs while maximizing helpful ones</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8">Our team</h2>
            <p>
              The team behind Epsilon brings together expertise in machine learning, 
              cognitive science, philosophy, and user experience design. We're united 
              by a commitment to creating AI that aligns with human values and serves 
              as a positive force in society.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="rounded-full text-base font-medium px-8"
                asChild
              >
                <Link href="/chat">
                  Try Epsilon <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="border-t border-border/50 py-8 px-4 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="bg-black flex items-center justify-center rounded w-8 h-8">
              ε
            </div>
            <span className="logo font-medium">Epsilon</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="#" className="hover:text-foreground">Blog</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card border border-border/50 rounded-xl shadow-sm">
      <div className="bg-secondary h-12 w-12 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
