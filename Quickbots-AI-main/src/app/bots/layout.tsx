import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Quickbots Dashboard",
  description:
    "Manage all your AI-powered personalized chatbots from one dashboard.",
};

export default function BotsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
