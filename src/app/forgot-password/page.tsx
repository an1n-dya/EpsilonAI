"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      // Here you would typically integrate with your auth service
      console.log("Password reset requested for:", email);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email to receive a password reset link"
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full rounded-full font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-secondary p-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill="#000000"/>
                <path d="M27 12c-1.5 0-3.5 0.2-5.5 0.6-2 0.4-3.7 1-5 1.8-1.2 0.8-1.8 1.6-1.8 2.6 0 0.7 0.3 1.4 1 2 0.7 0.6 1.6 1 2.6 1.2-1.3 0.3-2.3 0.8-3 1.4-0.7 0.6-1 1.4-1 2.4 0 1 0.6 1.9 1.9 2.7 1.3 0.8 2.9 1.4 5 1.8 2 0.4 4 0.6 5.8 0.6 1 0 1.9-0.1 2.7-0.2l0.3-2.4c-0.8 0.1-1.6 0.1-2.5 0.1-1.6 0-3.2-0.2-4.8-0.5-1.6-0.3-2.9-0.8-3.8-1.3-0.9-0.5-1.4-1.1-1.4-1.7 0-0.5 0.3-0.9 1-1.3 0.7-0.4 1.6-0.7 2.7-0.9 1.1-0.2 2.3-0.3 3.5-0.3h3.8v-2h-3.8c-1.4 0-2.8-0.1-4-0.4-1.2-0.3-2.2-0.6-2.9-1.1-0.7-0.4-1-0.9-1-1.4 0-0.6 0.5-1.1 1.4-1.6 0.9-0.5 2.1-0.9 3.6-1.2 1.5-0.3 3-0.4 4.6-0.4 1.1 0 2.1 0.1 3 0.2L29 10c-0.6-0.1-1.3-0.1-2-0.1z" fill="white"/>
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full rounded-full mt-2"
          >
            Back to reset password
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
