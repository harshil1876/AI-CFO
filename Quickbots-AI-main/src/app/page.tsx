"use client";

import { memo, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SplitText from "@/components/SplitText";
import dashboardimage from "../assets/hero-dashboard-dark.png";
import dashboardimagewhite from "../assets/hero-dashboard-light.png";
import feature1 from "../assets/feature-personality.png";
import feature2 from "../assets/feature-multiplatform-integration.jpeg";
import feature3 from "../assets/feature-advanced-analytics.jpeg";
import quickbotsIcon from "../assets/quickbots-logo.png";

// This is a static marketing page - no dynamic data needed
export const dynamic = "force-static";

interface PowerFeature {
  id: string;
  title: string;
  description: string;
  image: StaticImageData;
  icon: ReactNode;
}

interface FeatureItem {
  id: number;
  title: string;
  description: string;
}

const powerFeatures: PowerFeature[] = [
  {
    id: "feature-1",
    title: "Guided Bot Creation",
    description:
      "Capture brand voice, product knowledge, and guardrails in minutes using Quickbots' onboarding flow and AI-assisted config generator.",
    image: feature1,
    icon: (
      <Image
        src={quickbotsIcon}
        alt="QuickBots icon"
        className="h-8 w-8"
        width={32}
        height={32}
        priority
      />
    ),
  },
  {
    id: "feature-2",
    title: "Embeddable Quickbots Widget",
    description:
      "Add a single script tag to embed a fully-featured chatbot widget. Works with any framework, automatically adapts to dark mode, and includes session history, file uploads, and seamless theming.",
    image: feature2,
    icon: <Bot className="h-5 w-5" />,
  },
  {
    id: "feature-3",
    title: "Ops & Analytics Control Room",
    description:
      "Monitor rate limits, quotas, and live conversations from the dashboard. Ship updates safely with runtime toggles, alerts, and audit trails.",
    image: feature3,
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

const featureItems: FeatureItem[] = [
  {
    id: 1,
    title: "AI-Assisted Onboarding",
    description:
      "Feed Quickbots a few prompts about your product and it auto-generates persona, thesis, greetings, runtime defaults, and UI settings that can be edited before publishing.",
  },
  {
    id: 2,
    title: "Bring Your Own Stack",
    description:
      "Use Supabase Auth + Postgres, plug in your preferred LLM provider, and access everything via RESTful APIs so Quickbots layers onto existing infrastructure instead of replacing it.",
  },
  {
    id: 3,
    title: "Quickbots Runtime Controls",
    description:
      "Ship safe updates with rate limits, token quotas, and environment-specific configs. Pause traffic instantly or switch models without redeploying your site.",
  },
  {
    id: 4,
    title: "Universal Web Component Widget",
    description:
      "Embed the Quickbots widget with a single script tag. Works with HTML, React, Next.js, Vue, Angular, or any framework. Automatically detects dark mode and provides a seamless chat experience with auto-scroll and session persistence.",
  },
  {
    id: 5,
    title: "Human-Ready Analytics",
    description:
      "Surface live conversation transcripts, user sentiment, and funnel drop-off points. Grant stakeholders read-only access while engineers keep edit control.",
  },
];

// ============ HERO SECTION ============

const Hero = memo(function Hero() {
  const { theme } = useTheme();
  return (
    <section className="relative overflow-hidden py-10 sm:py-12 md:py-16 lg:py-20 xl:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[500px] h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-40 sm:w-56 md:w-72 lg:w-80 xl:w-96 h-40 sm:h-56 md:h-72 lg:h-80 xl:h-96 bg-accent/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-36 sm:w-48 md:w-64 lg:w-80 xl:w-96 h-36 sm:h-48 md:h-64 lg:h-80 xl:h-96 bg-secondary/4 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="flex flex-col gap-10 sm:gap-12 md:gap-14 lg:gap-16 xl:gap-20">
          <div className="relative flex flex-col gap-6 sm:gap-7 md:gap-8 lg:gap-10 xl:gap-12">
            <div className="absolute top-1/2 left-1/2 -z-10 transform -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(at_top_left,hsl(var(--primary))_0deg,hsl(var(--accent))_90deg,hsl(var(--primary))_180deg,hsl(var(--accent))_270deg)] blur-[100px] opacity-15" />
              <div className="size-[400px] sm:size-[500px] md:size-[600px] lg:size-[700px] xl:size-[900px] rounded-full border border-border/10 mask-[radial-gradient(circle,white_45%,transparent_75%)] p-6 sm:p-7 md:p-8 lg:p-8">
                <div className="size-full rounded-full border border-border/8 p-6 sm:p-7 md:p-8 lg:p-8">
                  <div className="size-full rounded-full border border-border/5" />
                </div>
              </div>
            </div>

            <motion.div
              className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 items-center justify-center "
              animate={{ rotate: [0, 360, 350, 360, 355, 360] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
                repeatDelay: 0.4,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 0.98, 1.02, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="inline-flex h-full w-full items-center justify-center rounded-full"
              >
                <Image
                  src={quickbotsIcon}
                  alt="Quickbots"
                  className="h-full w-full object-contain drop-shadow-lg"
                  width={112}
                  height={112}
                  priority
                />
              </motion.div>
            </motion.div>

            <div className="text-center space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
              <div className="mx-auto max-w-5xl text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight tracking-tight text-primary px-2 sm:px-0">
                <SplitText
                  text="Launch customer-ready AI chatbots faster with Quickbots"
                  className="inline-block text-inherit"
                  delay={120}
                  duration={0.2}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 32 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.2}
                  rootMargin="-50px"
                  textAlign="center"
                  onLetterAnimationComplete={() => {}}
                />
              </div>
              <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground leading-relaxed">
                Onboard teams with AI-assist, manage runtime limits, and embed
                Quickbots widgets with a single script tag—works with any framework.
              </p>

              <p className="mx-auto max-w-4xl text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground leading-relaxed">
                Guided onboarding, a managed runtime, and a universal Web Component widget
                so product, support, and growth teams can ship AI experiences
                without rebuilding infrastructure.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center pt-2 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6">
              <Button
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-6 md:px-7 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 xl:py-6 text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
                asChild
              >
                <Link href="/bots" className="flex items-center justify-center">
                  Start Building Free
                  <ArrowRight className="ml-2 size-4 sm:size-4 md:size-5 lg:size-5 xl:size-6" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-6 sm:px-6 md:px-7 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 xl:py-6 text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold hover:scale-105 transition-transform duration-200"
                asChild
              >
                <Link href="/docs" className="flex items-center justify-center">
                  View Docs
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-0 sm:px-2 md:px-4 lg:px-6 xl:px-8 group">
            {/* Fade overlay gradient */}
            <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-2xl xl:rounded-3xl bg-linear-to-b from-transparent via-transparent to-background pointer-events-none z-20 " />

            {/* Image container with fade effect */}
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-2xl xl:rounded-3xl">
              <Image
                src={theme === "dark" ? dashboardimage : dashboardimagewhite}
                alt="Quickbots Bot Dashboard Preview"
                className="relative z-10 w-full object-cover border-4 border-border/20 shadow-lg sm:shadow-xl md:shadow-2xl lg:shadow-2xl xl:shadow-2xl transition-transform duration-500 group-hover:scale-105"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
                }}
                width={1400}
                height={700}
                priority
                unoptimized={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// ============ POWERFUL FEATURES SECTION ============

const PowerfulFeaturesSection = memo(function PowerfulFeaturesSection() {
  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 xl:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-56 sm:w-72 md:w-80 lg:w-96 xl:w-[500px] h-56 sm:h-72 md:h-80 lg:h-96 xl:h-[500px] bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 sm:w-80 md:w-96 lg:w-[500px] xl:w-[600px] h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-accent/4 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16">
          <div className="flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
            <Badge
              variant="secondary"
              className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg"
            >
              <Sparkles className="mr-1.5 sm:mr-2 h-3 sm:h-3.5 md:h-4 lg:h-4 xl:h-5 w-3 sm:w-3.5 md:w-4 lg:w-4 xl:w-5" />
              Powerful Features
            </Badge>

            <div className="max-w-3xl">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8 text-foreground">
                Built for the{" "}
                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Future
                </span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed">
                Discover the powerful features that make our platform the choice
                of industry leaders. Built with cutting-edge AI technology and
                designed for maximum impact.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5 pt-2 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6">
              {[
                "AI-assisted onboarding generates configs & personas automatically",
                "Live runtime controls for rate limits, quotas, and models",
                "Universal Web Component widget - works with any framework",
                "Auto dark mode detection, session history & file uploads",
                "Analytics, guardrails, and audit trails for every bot",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3 xl:gap-4"
                >
                  <CheckCircle className="h-4 sm:h-4 md:h-5 lg:h-5 xl:h-6 w-4 sm:w-4 md:w-5 lg:w-5 xl:w-6 text-primary shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full grid gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
              {powerFeatures.map((feature) => (
                <Card
                  key={feature.id}
                  className="overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-card border hover:border-primary/30 p-0"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      width={500}
                      height={280}
                      loading="lazy"
                      unoptimized={false}
                    />
                    <div className="absolute top-2 sm:top-2.5 md:top-3 lg:top-3 xl:top-4 left-2 sm:left-2.5 md:left-3 lg:left-3 xl:left-4 bg-background/90 backdrop-blur-sm rounded-lg p-1 sm:p-1.5 md:p-2 lg:p-2 xl:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-5 md:p-6 lg:p-6 xl:p-7">
                    <h3 className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-semibold mb-2 sm:mb-2.5 md:mb-3 lg:mb-3 xl:mb-4 transition-colors duration-200 group-hover:text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// ============ FEATURES SECTION (FAQ STYLE) ============

const FeaturesSection = memo(function FeaturesSection() {
  const [activeTabId, setActiveTabId] = useState<number>(1);
  const handleTabChange = (tabId: number) => setActiveTabId(tabId);

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 xl:py-28 relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-14">
          <Badge
            variant="secondary"
            className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg"
          >
            FAQs
          </Badge>
        </div>

        <div className="mx-auto max-w-4xl px-0 sm:px-2 md:px-4 lg:px-6 xl:px-8">
          <Accordion
            type="single"
            className="space-y-1.5 sm:space-y-2 md:space-y-2 lg:space-y-3 xl:space-y-3"
            defaultValue="item-1"
          >
            {featureItems.map((tab) => (
              <AccordionItem
                key={tab.id}
                value={`item-${tab.id}`}
                className="border rounded-lg sm:rounded-lg md:rounded-xl lg:rounded-xl xl:rounded-2xl px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <AccordionTrigger
                  onClick={() => handleTabChange(tab.id)}
                  className="cursor-pointer py-3.5 sm:py-4 md:py-5 lg:py-6 xl:py-7 text-left hover:no-underline"
                >
                  <h3
                    className={`text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-semibold transition-colors duration-200 ${
                      tab.id === activeTabId
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {tab.title}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="pb-3.5 sm:pb-4 md:pb-5 lg:pb-6 xl:pb-7">
                  <p className="text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed">
                    {tab.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
});

// ============ PAGE COMPONENT ============

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen flex-col relative overflow-hidden">
        {/* Global Background */}
        <div className="fixed inset-0 -z-20">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.05),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.05),transparent_50%)]" />
        </div>

        <Hero />
        <PowerfulFeaturesSection />
        <FeaturesSection />
      </div>
      <style jsx global>{`
        @keyframes quickbots-orbit {
          0% {
            transform: rotate(0deg) scale(1);
          }
          35% {
            transform: rotate(5deg) scale(1.04);
          }
          70% {
            transform: rotate(-4deg) scale(0.97);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes quickbots-icon-pulse {
          0% {
            transform: translateY(0) scale(1);
          }
          45% {
            transform: translateY(-6px) scale(1.08);
          }
          90% {
            transform: translateY(4px) scale(0.95);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        .quickbots-floating-icon {
          animation: quickbots-icon-pulse 8s ease-in-out infinite;
        }

        @keyframes quickbots-icon-shimmer {
          0% {
            transform: rotate(0deg);
            opacity: 0.1;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.1;
          }
        }

        @keyframes quickbots-icon-glow {
          0% {
            opacity: 0.2;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.2;
            transform: scale(0.95);
          }
        }

        .quickbots-icon-shell {
          position: relative;
          isolation: isolate;
        }

        .quickbots-icon-shell::before {
          content: "";
          position: absolute;
          inset: -12px;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(99, 102, 241, 0.45),
            transparent 65%
          );
          filter: blur(18px);
          animation: quickbots-icon-glow 7s ease-in-out infinite;
          z-index: 0;
        }

        .quickbots-icon-overlay {
          border-radius: 9999px;
          border: 1px solid rgba(99, 102, 241, 0.35);
          box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.25);
        }

        .quickbots-icon-overlay::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(255, 255, 255, 0.35) 120deg,
            transparent 300deg
          );
          mix-blend-mode: screen;
          animation: quickbots-icon-shimmer 5s linear infinite;
        }
      `}</style>
    </>
  );
}
