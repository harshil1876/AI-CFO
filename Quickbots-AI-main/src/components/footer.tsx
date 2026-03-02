"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import quickbotsIcon from "@/assets/quickbots-logo.png";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url?: string;
    external?: boolean;
  }[];
}

interface FooterProps {
  logo?: {
    url: string;
    src?: string;
    alt?: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer = ({
  logo = {
    url: "/",
    title: "Quickbots",
    alt: "Quickbots Bot Platform",
  },
  tagline = "Create intelligent AI bots with ease. No coding required.",
  menuItems = [
    {
      title: "Features",
      links: [
        { text: "AI-assisted onboarding", url: undefined },
        { text: "Runtime controls & quotas", url: undefined },
        { text: "Embeddable Quickbots widget", url: undefined },
        { text: "Analytics & guardrails", url: undefined },
        { text: "Developer-friendly APIs", url: undefined },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Privacy Policy", url: "/privacy" },
        { text: "Terms of Service", url: "/terms" },
      ],
    },
  ],
}: FooterProps) => {
  return (
    <footer className="relative border-t border-border/30 bg-background w-full">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-8 sm:py-10 md:py-12">
          {/* Main footer content */}
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 md:gap-12 justify-between mb-6 sm:mb-8">
            {/* Brand section */}
            <div className="shrink-0 text-center sm:text-left">
              <Link
                href={logo.url}
                className="flex items-center justify-center sm:justify-start gap-2 mb-3 sm:mb-4 group"
              >
                <div className="relative">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden">
                    <Image
                      src={quickbotsIcon}
                      alt="Quickbots logo"
                      className="h-5 w-5"
                      width={32}
                      height={32}
                      priority
                    />
                  </div>
                </div>
                <span className="text-base sm:text-lg font-semibold text-foreground">
                  {logo.title}
                </span>
              </Link>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6 max-w-xs mx-auto sm:mx-0">
                {tagline}
              </p>
              <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                <p>© 2025 {logo.title}. All rights reserved.</p>
              </div>
            </div>

            {/* ASCII art / vibe block */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="rounded-2xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex items-center justify-center">
                <pre className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm leading-tight font-mono text-primary text-center whitespace-pre overflow-x-auto">
                  {`   ____        _      _    ____        _                  _____ 
  / __ \\      (_)    | |  |  _ \\      | |           /\\   |_   _|
 | |  | |_   _ _  ___| | _| |_) | ___ | |_ ___     /  \\    | |  
 | |  | | | | | |/ __| |/ /  _ < / _ \\| __/ __|   / /\\ \\   | |  
 | |__| | |_| | | (__|   <| |_) | (_) | |_\\__ \\  / ____ \\ _| |_ 
  \\___\\_\\\\__,_|_|\\___|_|\\_\\____/ \\___/ \\__|___/ /_/    \\_\\_____|
                                                                
                                                                 `}
                </pre>
              </div>
            </div>

            {/* Menu sections */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 md:gap-12">
              {menuItems.map((section, sectionIdx) => (
                <div key={sectionIdx} className="space-y-3 sm:space-y-4 text-center sm:text-left">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        {link.url ? (
                          link.external ? (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group"
                            >
                              {link.text}
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <Link
                              href={link.url}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                              {link.text}
                            </Link>
                          )
                        ) : (
                          <span
                            className="relative inline-block text-sm text-muted-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-primary/60 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100 focus-visible:outline-none focus-visible:text-foreground"
                            tabIndex={0}
                          >
                            {link.text}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
