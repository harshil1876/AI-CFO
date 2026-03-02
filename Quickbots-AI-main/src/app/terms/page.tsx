import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · Quickbots",
  description:
    "Understand the rules, responsibilities, and acceptable use guidelines for the Quickbots platform.",
};

const sections = [
  {
    title: "1. Using Quickbots",
    items: [
      "You must provide accurate account information and keep credentials secure. Accounts are tied to Clerk authentication and subject to Clerk's acceptable use policies.",
      "You may not reverse engineer, resell, or misrepresent Quickbots as your own hosted service without written consent.",
      "Beta or experimental features may change or be discontinued without prior notice.",
    ],
  },
  {
    title: "2. Customer Content",
    items: [
      "You retain ownership of bot configurations, uploaded files, prompts, and chat transcripts. Quickbots only processes this data to deliver platform functionality.",
      "You are responsible for ensuring your data and prompts comply with applicable laws, third‑party rights, and your own privacy commitments.",
      "Do not upload content that is illegal, hateful, defamatory, or otherwise prohibited by platform and infrastructure providers.",
    ],
  },
  {
    title: "3. Service Commitments",
    items: [
      "We strive for high availability but do not guarantee uninterrupted service. Scheduled maintenance windows will be communicated whenever possible.",
      "Quickbots may throttle or suspend accounts that negatively impact platform stability or violate the acceptable use policy.",
      "Support is provided on a best-effort basis via email or the in-app support channel.",
    ],
  },
  {
    title: "4. Liability & Termination",
    items: [
      "Quickbots is provided 'as is'. To the fullest extent permitted by law, we disclaim warranties and limit liability to the fees you paid in the preceding 12 months.",
      "Either party may terminate access at any time. Upon termination you should export your bot data; we will retain it only as required for backups and legal compliance.",
      "These terms are governed by the laws of the jurisdiction where Quickbots is registered. Disputes will be handled in that jurisdiction's courts.",
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="px-4 py-12 md:py-16 lg:py-20 bg-background">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4 text-center">
          <p className="text-sm font-semibold text-primary tracking-wide uppercase">
            Terms of Service
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Quickbots Platform Agreement
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            By accessing Quickbots you agree to the responsibilities below. If
            you are entering into this agreement on behalf of an organization,
            you confirm that you have authority to bind that entity.
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

        <footer className="rounded-2xl border border-border/60 bg-muted/20 p-6 text-sm md:text-base space-y-2">
          <p className="font-semibold text-foreground mb-2">
            Need a custom addendum?
          </p>
          <p className="text-muted-foreground">
            Contact us if your legal team requires a data processing agreement,
            enterprise SLA, or other custom clauses. We are happy to review
            reasonable requests for paid plans.
          </p>
          <p className="text-muted-foreground">
            For details on how we handle personal data, visit our{" "}
            <Link
              href="/privacy"
              className="text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </section>
  );
}
