import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · Quickbots",
  description:
    "Learn how Quickbots collects, uses, and safeguards your data across the platform.",
};

const sections = [
  {
    title: "1. Data We Collect",
    items: [
      "Account information such as name, email address, and authentication metadata provided via Clerk.",
      "Bot configuration data (persona, prompts, runtime settings) that you store inside the dashboard.",
      "Usage analytics that help us monitor performance (request counts, latency, and aggregate statistics).",
      "Optional content you upload to personalize responses (knowledge base files, FAQs, manual inputs).",
    ],
  },
  {
    title: "2. How We Use Your Data",
    items: [
      "To authenticate you, render the dashboard, and keep your workspace synchronized across devices.",
      "To generate chatbot configurations using AI helpers when you explicitly trigger those workflows.",
      "To improve reliability, detect abuse, and provide support when you contact us.",
      "To send essential product updates or security notifications (never unsolicited marketing without opt-in).",
    ],
  },
  {
    title: "3. Sharing & Retention",
    items: [
      "We do not sell customer data. Limited subprocessors (Supabase, Clerk, Vercel, OpenAI/Google) only receive the minimum data required to provide their respective infrastructure services.",
      "Analytics is aggregated and anonymized whenever possible. Raw chat transcripts stay inside your Supabase project scope.",
      "Configuration data persists until you delete a bot. Support-related backups are purged within 90 days.",
    ],
  },
  {
    title: "4. Your Controls",
    items: [
      "Export or delete bot data directly inside the dashboard. Removing a bot removes its configs, runtime settings, and API keys.",
      "Contact support at any time if you need to access, correct, or erase personal information tied to your account.",
      "Disable analytics collection for specific environments by configuring environment variables documented in the README.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="px-4 py-12 md:py-16 lg:py-20 bg-background">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4 text-center">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase">
            Privacy Policy
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Protecting Your Data at Quickbots
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            This policy explains what data we collect, why we collect it, and
            the controls you have while building with Quickbots. It applies to
            the dashboard, public APIs, and any hosted chatbot widgets.
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-border/60 bg-card/30 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {section.title}
              </h2>
              <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <footer className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-sm md:text-base text-foreground space-y-2">
          <p className="font-semibold text-primary mb-2">Questions?</p>
          <p className="text-muted-foreground">
            We are committed to transparent and responsible AI tooling. If you
            have privacy concerns, need to report an incident, or require a DPA,
            email our team and we will respond promptly.
          </p>
          <p className="text-muted-foreground">
            For platform rules and acceptable use guidelines please review our{" "}
            <Link
              href="/terms"
              className="text-primary underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
            .
          </p>
        </footer>
      </div>
    </section>
  );
}

