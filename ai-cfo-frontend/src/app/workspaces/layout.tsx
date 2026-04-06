"use client";
import { useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { OrganizationSwitcher, UserButton, useOrganization, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  FolderKanban, Users, Blocks, Activity, CreditCard, Settings,
  PanelLeft, PanelLeftClose, ChevronRight, Search, Bell, Plus
} from "lucide-react";

type SidebarMode = "expanded" | "collapsed" | "hover";

const NAV_LINKS = [
  { label: "Projects", icon: FolderKanban, href: "/workspaces", exact: true },
  { label: "Team", icon: Users, href: "/workspaces/team" },
  { label: "Integrations", icon: Blocks, href: "/workspaces/integrations" },
  { label: "Usage", icon: Activity, href: "/workspaces/usage" },
  { label: "Billing", icon: CreditCard, href: "/workspaces/billing" },
  { label: "Organization Settings", icon: Settings, href: "/workspaces/settings" },
];

function OrgSidebar({ mode, setMode }: { mode: SidebarMode; setMode: (m: SidebarMode) => void }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  const isExpanded = mode === "expanded" || (mode === "hover" && hovered);
  const sidebarWidth = mode === "collapsed" || (mode === "hover" && !hovered) ? "w-[52px]" : "w-56";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`relative flex flex-col flex-shrink-0 border-r border-[#1e2637] bg-[#0c0f17] transition-all duration-200 overflow-hidden ${sidebarWidth} z-30 hidden md:flex`}
      onMouseEnter={() => mode === "hover" && setHovered(true)}
      onMouseLeave={() => mode === "hover" && setHovered(false)}
      style={{ minHeight: "100vh" }}
    >
      {/* Sidebar Header (Logo) */}
      <div className="h-12 flex items-center px-3 border-b border-[#1e2637] flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img src="/Logo.png" alt="CFOlytics" className="h-6 w-6 object-contain flex-shrink-0" />
          {isExpanded && (
            <span className="text-sm font-bold text-white whitespace-nowrap tracking-tight">CFOlytics</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <div className="mb-1">
          {isExpanded && (
            <p className="px-3 py-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
              Organization
            </p>
          )}
          {NAV_LINKS.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={`flex items-center gap-2.5 mx-1.5 px-2 py-1.5 rounded-md text-sm transition-colors group ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon size={16} className={`flex-shrink-0 ${active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {isExpanded && (
                  <span className="whitespace-nowrap text-[13px]">{item.label}</span>
                )}
                {active && isExpanded && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer: Sidebar Mode Switcher */}
      <div className="border-t border-[#1e2637] py-2 px-1.5 flex-shrink-0">
        {isExpanded && <div className="text-[10px] text-slate-600 px-2 mb-1 uppercase tracking-widest font-semibold">Sidebar</div>}
        <div className={`flex ${isExpanded ? "flex-col gap-0.5" : "flex-col items-center gap-0.5"}`}>
          {(["expanded", "collapsed", "hover"] as SidebarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); localStorage.setItem("org-sidebar-mode", m); }}
              title={!isExpanded ? m : undefined}
              className={`flex items-center gap-2 px-2 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-md transition-colors ${
                mode === m ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              {m === "expanded" && <PanelLeft size={12} className="flex-shrink-0" />}
              {m === "collapsed" && <PanelLeftClose size={12} className="flex-shrink-0" />}
              {m === "hover" && <PanelLeft size={12} className="flex-shrink-0" />}
              {isExpanded && m}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function WorkspacesLayout({ children }: { children: ReactNode }) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("expanded");
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  
  useEffect(() => {
    const savedMode = localStorage.getItem("org-sidebar-mode") as SidebarMode | null;
    if (savedMode) setSidebarMode(savedMode);
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0d14] text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <OrgSidebar mode={sidebarMode} setMode={setSidebarMode} />

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* ── Header mirroring the inner Dashboard ── */}
        <header className="h-12 flex-shrink-0 flex items-center justify-between border-b border-[#1e2637] bg-[#0a0d14] px-4 z-20">
          {/* Left: Component & Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-sm">
            <OrganizationSwitcher
              hidePersonal
              appearance={{
                baseTheme: dark,
                elements: {
                  organizationSwitcherTrigger: "flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-[#2a3448] hover:bg-white/5 transition-all text-white",
                  organizationPreviewMainIdentifier: "text-white !text-white text-xs font-semibold",
                  organizationPreviewSecondaryIdentifier: "hidden",
                  organizationSwitcherTriggerIcon: "text-slate-500",
                }
              }}
            />
            
            <div className="hidden md:flex items-center gap-1.5 text-xs px-1">
              <ChevronRight size={12} className="text-slate-600" />
              <span className="font-medium text-slate-300">Organization</span>
              <ChevronRight size={12} className="text-slate-600" />
              <span className="text-slate-500 font-medium">Workspaces</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-sm mx-6 hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
              <input
                type="text"
                placeholder="Search or ask AI…"
                className="w-full bg-[#131929] border border-[#1e2637] rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:bg-[#0f1626] transition-all"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end leading-none gap-0.5">
              <span className="text-xs font-medium text-white">{user?.fullName || user?.firstName || "User"}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{organization?.name || "Member"}</span>
            </div>
            <UserButton appearance={{ baseTheme: dark, elements: { avatarBox: "h-7 w-7 hover:ring-2 hover:ring-blue-500/50 transition-all font-sans" } }} />
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto bg-[#0a0d14]">
          {children}
        </div>
      </main>
    </div>
  );
}
