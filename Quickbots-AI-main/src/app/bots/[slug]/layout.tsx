import type React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BotsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({}: BotsLayoutProps): Promise<Metadata> {
  return {
    title: "Bot · Quickbots",
    description: "AI chatbot dashboard",
  };
}

// Base layout - no BotLayoutClient wrapper
// Dashboard routes have their own layout with BotLayoutClient
// Onboarding route doesn't need BotLayoutClient
export default async function BotsLayout({ children }: BotsLayoutProps) {
  return <>{children}</>;
}
