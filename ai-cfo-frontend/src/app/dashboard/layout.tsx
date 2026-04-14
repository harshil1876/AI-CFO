"use client";
import { useState, ReactNode, useEffect, useRef } from "react";
import { useUser, useOrganization, UserButton, SignOutButton, OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  LayoutDashboard, MessageSquare, BarChart3, Receipt,
  UploadCloud, Zap, FlaskConical, Link2,
  Bell, Search, LogOut, Shield, AlertTriangle,
  History, BarChart, ChevronDown, Settings, Users,
  PanelLeft, PanelLeftClose, BrainCircuit, ChevronRight, Pause, Plus,
  Ruler, Database, FileSpreadsheet
} from "lucide-react";
import { getAuthHeaders } from "@/lib/api";
import { CurrencyProvider, useCurrency } from "@/context/CurrencyContext";
import { CustomDialog, DialogButton } from "@/components/CustomDialog";

// ─── Currency Switcher ──────────────────────────────────────────────────────
function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as any)}
      className="bg-transparent border border-[#2a3448] rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:border-white/20 transition-all outline-none cursor-pointer"
    >
      <option value="USD">USD ($)</option>
      <option value="INR">INR (₹)</option>
      <option value="EUR">EUR (€)</option>
      <option value="GBP">GBP (£)</option>
    </select>
  );
}

// ─── Nav Groups ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "CORE",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/reports", label: "Financial Reports", icon: BarChart },
      { href: "/dashboard/budget", label: "Budgeting", icon: BarChart3 },
      { href: "/dashboard/org-chat", label: "Org Chat", icon: MessageSquare },
    ],
  },
  {
    label: "AI & AUTOMATION",
    items: [
      { href: "/dashboard/chat", label: "AI CFO Chat", icon: BrainCircuit },
      { href: "/dashboard/pipeline", label: "Intelligence", icon: Zap },
      { href: "/dashboard/simulation", label: "Scenarios", icon: FlaskConical },
      { href: "/dashboard/ap", label: "Accounts Payable", icon: Receipt },
      { href: "/dashboard/kpi-builder", label: "KPI Builder", icon: Ruler },
    ],
  },
  {
    label: "DATA",
    items: [
      { href: "/dashboard/upload", label: "Upload Data", icon: UploadCloud },
      { href: "/dashboard/connectors", label: "Connectors", icon: Link2 },
      { href: "/dashboard/anomalies", label: "Anomaly Hub", icon: AlertTriangle },
      { href: "/dashboard/nl-query", label: "Data Query (AI)", icon: Database },
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      { href: "/dashboard/audit", label: "Audit Trail", icon: History },
      { href: "/dashboard/team", label: "Permissions", icon: Shield },
      { href: "/dashboard/team-status", label: "Team Directory", icon: Users },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { href: "/dashboard/settings/workspace", label: "Workspace Settings", icon: Settings },
      { href: "/dashboard/excel-setup", label: "Excel Add-in", icon: FileSpreadsheet },
    ],
  },
];

// ─── Sidebar Mode Type ───────────────────────────────────────────────────────
type SidebarMode = "expanded" | "collapsed" | "hover";

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ mode, setMode }: { mode: SidebarMode; setMode: (m: SidebarMode) => void }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  const isExpanded = mode === "expanded" || (mode === "hover" && hovered);
  const sidebarWidth = mode === "collapsed" || (mode === "hover" && !hovered) ? "w-[52px]" : "w-56";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`relative flex flex-col flex-shrink-0 border-r border-[#1e2637] bg-[#0c0f17] transition-all duration-200 overflow-hidden ${sidebarWidth} z-30`}
      onMouseEnter={() => mode === "hover" && setHovered(true)}
      onMouseLeave={() => mode === "hover" && setHovered(false)}
      style={{ minHeight: "100vh" }}
    >
      {/* Note: Logo moved to topbar */}

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="mb-1">
            {isExpanded && (
              <p className="px-3 py-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                {group.label}
              </p>
            )}
            {!isExpanded && gi > 0 && (
              <div className="mx-3 my-2 border-t border-[#1e2637]" />
            )}
            {group.items.map((item) => {
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
                  <Icon size={16} className={`flex-shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                  {isExpanded && (
                    <span className="whitespace-nowrap text-[13px]">{item.label}</span>
                  )}
                  {active && isExpanded && (
                    <span className="ml-auto w-1 h-1 rounded-full bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: Sidebar Mode Switcher */}
      <div className="border-t border-[#1e2637] py-2 px-1.5 flex-shrink-0">
        {isExpanded ? (
          <div className="text-[10px] text-slate-600 px-2 mb-1 uppercase tracking-widest font-semibold">Sidebar</div>
        ) : null}
        <div className={`flex ${isExpanded ? "flex-col gap-0.5" : "flex-col items-center gap-0.5"}`}>
          {(["expanded", "collapsed", "hover"] as SidebarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); localStorage.setItem("sidebar-mode", m); }}
              title={m.charAt(0).toUpperCase() + m.slice(1)}
              className={`flex items-center gap-2 px-2 py-1 rounded-md text-[11px] transition-colors w-full ${
                mode === m ? "text-white bg-white/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              {m === "expanded" && <PanelLeft size={13} />}
              {m === "collapsed" && <PanelLeftClose size={13} />}
              {m === "hover" && <PanelLeft size={13} className="opacity-50" />}
              {isExpanded && <span className="capitalize">{m === "hover" ? "Expand on hover" : m}</span>}
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <SignOutButton redirectUrl="/">
          <button className={`flex items-center gap-2 mt-2 w-full px-2 py-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors ${isExpanded ? "" : "justify-center"}`}>
            <LogOut size={14} />
            {isExpanded && <span className="text-[13px]">Log Out</span>}
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization } = useOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const { activeWorkspaceId, activeWorkspace, setActiveWorkspace, isWorkspaceLoaded } = useWorkspace();
  const isPaused = activeWorkspace?.status === 'paused';

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("expanded");
  const [notificationCount, setNotificationCount] = useState(0);
  const [customRole, setCustomRole] = useState("Corporate Treasury");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [roleInput, setRoleInput] = useState(customRole);

  const botId = organization?.id || "org_default";

  // Notification polling
  const fetchNotificationCount = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/count/?bot_id=${botId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNotificationCount(data.count);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (isWorkspaceLoaded && !activeWorkspaceId) {
      router.push('/workspaces');
    }
  }, [isWorkspaceLoaded, activeWorkspaceId, router]);

  // Fetch workspace metadata if we have an ID but no metadata in context
  useEffect(() => {
    if (activeWorkspaceId && !activeWorkspace) {
      getAuthHeaders().then(headers => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/`, { headers })
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Workspace not found');
          })
          .then(data => {
            setActiveWorkspace({
              id: String(data.id),
              name: data.name,
              status: data.status,
              currency: data.currency,
              region: data.region,
            });
          })
          .catch(() => {
            router.push('/workspaces');
          });
      });
    }
  }, [activeWorkspaceId, activeWorkspace, setActiveWorkspace, router]);

  useEffect(() => {
    if (!isUserLoaded) return;
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    const savedRole = localStorage.getItem("cfolytics_custom_role");
    if (savedRole) { setCustomRole(savedRole); setRoleInput(savedRole); }
    const savedMode = localStorage.getItem("sidebar-mode") as SidebarMode | null;
    if (savedMode) setSidebarMode(savedMode);
    return () => clearInterval(interval);
  }, [isUserLoaded, botId]);

  useEffect(() => {
    if (pathname === "/dashboard/notifications") setNotificationCount(0);
  }, [pathname]);

  const handleSaveRole = () => {
    const trimmed = roleInput.trim();
    if (trimmed) {
      setCustomRole(trimmed);
      localStorage.setItem("cfolytics_custom_role", trimmed);
    }
    setIsRoleDialogOpen(false);
  };

  if (!isUserLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0d14] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-xs text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  // Prevent flashing dashboard UI before redirect
  if (isWorkspaceLoaded && !activeWorkspaceId) {
    return null;
  }

  return (
    <CurrencyProvider>
      {/* Edit Designation Dialog */}
      <CustomDialog
        isOpen={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
        title="Edit Designation"
        description="Update the title displayed next to your name in the header."
        footer={
          <>
            <DialogButton variant="ghost" onClick={() => setIsRoleDialogOpen(false)}>Cancel</DialogButton>
            <DialogButton variant="primary" onClick={handleSaveRole}>Save</DialogButton>
          </>
        }
      >
        <input
          autoFocus
          type="text"
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSaveRole()}
          placeholder="e.g. Chief Financial Officer"
          className="w-full bg-[#0c0f17] border border-[#2a3448] focus:border-blue-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors"
        />
      </CustomDialog>

      <div className="flex flex-col h-screen bg-[#0a0d14] text-white overflow-hidden">
        {/* ── Full Width Top Header ── */}
        <header className="h-12 flex-shrink-0 flex items-center justify-between border-b border-[#1e2637] bg-[#0c0f17] px-4 z-20">
          {/* Left: Logo + Org Switcher + Workspace Breadcrumb */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/Logo.png" alt="CFOlytics" className="h-6 w-6 object-contain" />
              <span className="text-sm font-bold text-white tracking-tight">CFOlytics</span>
            </div>

            <div className="h-4 w-px bg-[#1e2637] hidden md:block" />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-sm">
              <OrganizationSwitcher
                hidePersonal
                appearance={{
                  baseTheme: dark,
                  elements: {
                    organizationSwitcherTrigger: "flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-[#2a3448] hover:bg-white/5 transition-all text-white",
                    organizationPreviewMainIdentifier: "text-white text-xs font-semibold",
                    organizationPreviewSecondaryIdentifier: "hidden",
                    organizationSwitcherTriggerIcon: "text-slate-500",
                  }
                }}
              />
              {activeWorkspace && (
                <>
                  <ChevronRight size={12} className="text-slate-600" />
                  <button
                    onClick={() => router.push('/workspaces')}
                    className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-1"
                  >
                    {activeWorkspace.name}
                  </button>
                  <ChevronRight size={12} className="text-slate-600" />
                  <span className="text-xs text-slate-500">main</span>
                </>
              )}
            </div>
          </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-sm mx-6 hidden md:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" size={13} />
                <input
                  type="text"
                  placeholder="Search or ask AI…"
                  className="w-full bg-[#131929] border border-[#1e2637] rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:bg-[#0f1626] transition-all"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">


              <CurrencySwitcher />

              <Link href="/dashboard/notifications" className="relative group p-1.5 rounded-md hover:bg-white/5 transition-colors">
                <Bell size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                {notificationCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-[9px] text-white font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center border border-[#0a0d14]">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Link>

              <div className="h-4 w-px bg-[#1e2637]" />

              {/* User Info + Avatar */}
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col items-end leading-none gap-0.5">
                  <span className="text-xs font-medium text-white">{user?.fullName || user?.firstName || "User"}</span>
                  <button
                    onClick={() => { setRoleInput(customRole); setIsRoleDialogOpen(true); }}
                    className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-wider"
                    title="Click to edit your designation"
                  >
                    {organization?.name || customRole}
                  </button>
                </div>
                <UserButton appearance={{ baseTheme: dark, elements: { avatarBox: "h-7 w-7 hover:ring-2 hover:ring-blue-500/50 transition-all font-sans" } }} />
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* ── Sidebar ── */}
            <Sidebar mode={sidebarMode} setMode={setSidebarMode} />

            {/* ── Main View ── */}
            <main className="flex flex-1 flex-col overflow-hidden relative">
              {/* ── Paused Workspace Banner ── */}
              {isPaused && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs flex-shrink-0">
                  <Pause size={12} />
                  <span>
                    <strong>{activeWorkspace?.name}</strong> is paused — data is read-only.
                    Go to <button onClick={() => router.push('/workspaces')} className="underline hover:text-amber-300">Workspaces</button> to resume.
                  </span>
                </div>
              )}

              {/* ── Page Content ── */}
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
    </CurrencyProvider>
  );
}
