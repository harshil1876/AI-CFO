import type React from "react";
import type { Metadata } from "next";

import BotLayoutClient from "@/components/bot-layout-client";

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({}: DashboardLayoutProps): Promise<Metadata> {
  return {
    title: "Bot · Quickbots",
    description: "AI chatbot dashboard",
  };
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const bot_id = (await params).slug;

  return <BotLayoutClient botId={bot_id}>{children}</BotLayoutClient>;
}
