"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton, useOrganization } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  FolderKanban,
  Users,
  Blocks,
  Activity,
  CreditCard,
  Settings,
} from "lucide-react";

export default function WorkspacesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { organization } = useOrganization();

  const NAV_LINKS = [
    { label: "Projects", icon: FolderKanban, href: "/workspaces" },
    { label: "Team", icon: Users, href: "/workspaces/team" },
    { label: "Integrations", icon: Blocks, href: "/workspaces/integrations" },
    { label: "Usage", icon: Activity, href: "/workspaces/usage" },
    { label: "Billing", icon: CreditCard, href: "/workspaces/billing" },
    { label: "Organization Settings", icon: Settings, href: "/workspaces/settings" },
  ];

  return (
    <div className="flex bg-[#0a0d14] text-white overflow-hidden min-h-screen">
      {/* ── Organization Sidebar ── */}
      <aside className="w-[240px] flex-shrink-0 border-r border-[#1e2637] bg-[#0c0f17] flex flex-col hidden md:flex">
        {/* Sidebar Header (Org Switcher) */}
        <div className="h-14 flex items-center px-4 border-b border-[#1e2637]">
          <OrganizationSwitcher
            hidePersonal
            appearance={{
              baseTheme: dark,
              elements: {
                organizationSwitcherTrigger: "flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-[#2a3448] hover:bg-white/5 transition-all w-full justify-start text-white text-sm",
                organizationPreviewMainIdentifier: "text-white text-sm font-semibold",
                organizationPreviewSecondaryIdentifier: "hidden",
                organizationSwitcherTriggerIcon: "text-slate-500 ml-auto",
              }
            }}
          />
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            // Precise exact match for /workspaces vs startsWith for the rest
            const isActive = link.href === "/workspaces" 
              ? pathname === "/workspaces"
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon
                  size={16}
                  className={isActive ? "text-emerald-400" : "text-slate-500"}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Button Footer */}
        <div className="p-4 border-t border-[#1e2637] flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Secured by <span className="font-semibold text-slate-400">clerk</span>
          </div>
          <UserButton
            appearance={{
              baseTheme: dark,
              elements: {
                userButtonAvatarBox: "w-7 h-7 hover:ring-2 hover:ring-blue-500/50 transition-all"
              }
            }}
          />
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Hidden on MD+) */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-[#1e2637] bg-[#0c0f17]">
          <OrganizationSwitcher
            hidePersonal
            appearance={{
              baseTheme: dark,
              elements: {
                organizationSwitcherTrigger: "flex items-center gap-1.5 px-2 py-1 rounded-md text-white text-sm",
                organizationPreviewMainIdentifier: "text-white text-sm font-semibold",
                organizationPreviewSecondaryIdentifier: "hidden",
                organizationSwitcherTriggerIcon: "text-slate-500",
              }
            }}
          />
          <UserButton appearance={{ baseTheme: dark, elements: { avatarBox: "h-7 w-7" } }} />
        </header>

        <div className="flex-1 overflow-auto bg-[#0a0d14]">
          {children}
        </div>
      </main>
    </div>
  );
}
