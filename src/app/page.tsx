import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ArrowRight, Sparkles, Shield, Zap, Code, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Meet <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Epsilon</span>, your AI assistant
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Built for maximizing truth and objectivity
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              className="rounded-full text-base font-medium px-8"
              asChild
            >
              <Link href="/chat">
                Start chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full text-base font-medium px-8"
              asChild
            >
              <Link href="/about">
                Learn more
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-blue-50/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles />}
              title="Advanced reasoning"
              description="Epsilon processes information with critical thinking to reach accurate and logical conclusions."
              index={0}
            />
            <FeatureCard 
              icon={<Shield />}
              title="Objective and truthful"
              description="Designed to maximize factual accuracy and minimize bias in all responses."
              index={1}
            />
            <FeatureCard 
              icon={<Zap />}
              title="Fast and responsive"
              description="Get clear, concise answers to your questions without unnecessary delay."
              index={2}
            />
            <FeatureCard 
              icon={<Code />}
              title="Coding assistance"
              description="Help with programming tasks across multiple languages with detailed explanations."
              index={3}
            />
            <FeatureCard 
              icon={<Users />}
              title="Research collaborator"
              description="Assist with research by analyzing data, generating insights, and suggesting approaches."
              index={4}
            />
            <FeatureCard 
              icon={<ArrowRight />}
              title="Continuous learning"
              description="Epsilon is constantly improving to provide better, more accurate responses."
              index={5}
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users already enhancing their productivity with Epsilon
          </p>
          <Button 
            size="lg" 
            className="rounded-full text-base font-medium px-8"
            asChild
          >
            <Link href="/signup">
              Create free account
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="bg-gradient-to-r from-primary to-accent flex items-center justify-center rounded w-8 h-8 text-white">
              ε
            </div>
            <span className="logo font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Epsilon</span>
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

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps & { index?: number }) {
  // Array of frost card classes to cycle through
  const frostClasses = [
    "card-frost-blue",
    "card-frost-purple", 
    "card-frost-teal",
    "card-frost-indigo",
    "card-frost-sky",
    "card-frost-pink"
  ];
  
  // Select a class based on the index or random if not provided
  const cardClass = frostClasses[index % frostClasses.length];
  
  return (
    <div className={`flex flex-col p-6 ${cardClass} rounded-xl shadow-sm backdrop-blur-md`}>
      <div className="bg-white/60 backdrop-blur-sm h-12 w-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
