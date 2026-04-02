import { Shield, BrainCircuit, LineChart, Receipt } from "lucide-react";
import type { ElementType } from "react";

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  bgColor: string;
  icon: ElementType;
  quickQuestions: string[];
}

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  strategist: {
    id: "strategist",
    name: "The Strategist",
    role: "Growth & Forecasting",
    description: "Build 'what-if' scenarios, optimize runway, and model business growth paths.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    icon: BrainCircuit,
    quickQuestions: [
      "Simulate a 20% increase in R&D spend.",
      "What is our projected runway?",
      "Model hiring 5 new engineers next quarter.",
      "Identify areas to accelerate revenue growth.",
    ]
  },
  auditor: {
    id: "auditor",
    name: "The Auditor",
    role: "Accuracy & Compliance",
    description: "Reconcile P&L, analyze audit trails, and ensure strict data integrity.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    icon: Shield,
    quickQuestions: [
      "Verify the latest P&L report accuracy.",
      "Show recent permission changes in Audit Trail.",
      "Are there any undocumented expenses?",
      "Check our vendor payments for compliance.",
    ]
  },
  guardian: {
    id: "guardian",
    name: "The Guardian",
    role: "Risk & Anomalies",
    description: "Proactive monitoring for financial anomalies and burn rate spikes.",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: Shield,
    quickQuestions: [
      "Are there any active anomalies?",
      "Analyze recent spikes in expenses.",
      "What are the top 3 financial risks currently?",
      "Review the Anomaly Hub for pending alerts.",
    ]
  },
  analyst: {
    id: "analyst",
    name: "The Analyst",
    role: "Analytics & Benchmarks",
    description: "Track goals, compare performance against industry benchmarks, and measure KPIs.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    icon: LineChart,
    quickQuestions: [
      "How do our margins compare to industry benchmarks?",
      "What is our MoM revenue growth?",
      "Are we on track to meet our Q3 profit goals?",
      "Generate a performance summary.",
    ]
  }
};

export const DEFAULT_AGENT_ID = "strategist";
