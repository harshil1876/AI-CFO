"use client";
import { useState, ReactNode, useEffect } from "react";
import { useUser, useOrganization, UserButton, SignOutButton, OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, MessageSquare, BarChart3, Receipt, 
  UploadCloud, Zap, FlaskConical, Link2, 
  ChevronLeft, ChevronRight, Bell, Search, 
  LogOut, Settings, BarChart
} from "lucide-react";
import { getAuthHeaders } from "@/lib/api";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { organization } = useOrganization();
    const pathname = usePathname();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const botId = organization?.id || "org_default";

    const fetchNotificationCount = async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/count/?bot_id=${botId}`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                setNotificationCount(data.count);
            }
        } catch (error) {
            console.error("Failed to fetch notification count", error);
        }
    };

    // Initial fetch and poll
    useEffect(() => {
        if (isUserLoaded) {
            fetchNotificationCount();
            const interval = setInterval(fetchNotificationCount, 30000); // Check every 30s
            return () => clearInterval(interval);
        }
    }, [isUserLoaded, botId]);

    // Resync when viewing notifications page
    useEffect(() => {
        if (pathname === "/dashboard/notifications") {
            setNotificationCount(0);
        }
    }, [pathname]);

    // Persist sidebar state
    useEffect(() => {
        const stored = localStorage.getItem("sidebar-collapsed");
        if (stored !== null) setIsCollapsed(stored === "true");
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar-collapsed", String(newState));
    };

    const tabs = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/chat", label: "AI CFO Chat", icon: MessageSquare },
        { href: "/dashboard/budget", label: "Budgeting", icon: BarChart3 },
        { href: "/dashboard/ap", label: "Accounts Payable", icon: Receipt },
        { href: "/dashboard/upload", label: "Upload Data", icon: UploadCloud },
        { href: "/dashboard/pipeline", label: "Intelligence", icon: Zap },
        { href: "/dashboard/simulation", label: "Scenarios", icon: FlaskConical },
        { href: "/dashboard/connectors", label: "Connectors", icon: Link2 },
    ];

    // Show loading while Clerk loads
    if (!isUserLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050814] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    <p className="text-sm text-gray-500">Loading your executive workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0c0f17] text-white">
            {/* Sidebar */}
            <aside 
                className={`flex flex-col transition-all duration-300 border-r border-[#1e2637] bg-[#121622] ${
                    isCollapsed ? "w-20" : "w-64"
                }`}
            >
                {/* Sidebar Header: Branding (Only show if not collapsed?) actually STRATOS has symbol? */}
                {/* Actually STRATOS sidebar has "Dashboard, Financials..." etc. */}
                
                <div className="flex flex-col flex-1 mt-6">
                    {/* Collapse Toggle at Top */}
                    <div className="px-4 mb-4 flex justify-start">
                        <button 
                            onClick={toggleSidebar}
                            className={`flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all group ${isCollapsed ? 'w-full' : 'w-10'}`}
                        >
                            {isCollapsed ? <ChevronRight size={20} className="group-hover:text-white" /> : <ChevronLeft size={20} className="group-hover:text-white" />}
                        </button>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group ${
                                        isActive
                                            ? "bg-white/10 text-white font-semibold"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <Icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                                    {!isCollapsed && <span>{tab.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="px-4 py-4 border-t border-[#1e2637] space-y-2">
                        <SignOutButton redirectUrl="/">
                            <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                                <LogOut size={20} />
                                {!isCollapsed && <span className="text-sm">Log Out</span>}
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col overflow-hidden relative">
                
                {/* Top Navbar */}
                <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#1e2637] bg-[#0c0f17]/80 backdrop-blur-md px-8 z-20">
                    
                    {/* Left: CFOlytics Logo & Title */}
                    <div className="flex items-center gap-4">
                        <img 
                            src="/Logo.png" 
                            alt="CFOlytics Logo" 
                            className="h-10 w-auto object-contain"
                        />
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-lg font-bold text-white tracking-tight">CFOlytics</h1>
                            <span className="text-sm text-slate-400 border-l border-[#1e2637] pl-3 hidden sm:block">AI CFO Platform</span>
                        </div>
                    </div>

                    {/* Center: Search Box */}
                    <div className="flex-1 max-w-xl mx-auto px-6 hidden md:block">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search dashboards, transactions, or ask AI..."
                                className="w-full bg-[#1e2637]/50 border border-[#1e2637] rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-[#1e2637] transition-all"
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-6">
                        {/* Workspace Switcher */}
                        <div className="hidden sm:block">
                            <OrganizationSwitcher 
                                hidePersonal 
                                appearance={{
                                    elements: {
                                        organizationSwitcherTrigger: "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e2637] bg-[#121622] text-slate-400 hover:text-white transition-all",
                                        organizationPreviewMainIdentifier: "text-white text-xs font-semibold",
                                        organizationPreviewSecondaryIdentifier: "text-slate-500 text-[10px]",
                                    }
                                }}
                            />
                        </div>

                        <Link href="/dashboard/notifications" className="relative group">
                            <Bell size={22} className="text-slate-300 group-hover:text-white transition-colors" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] text-white font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-[#0c0f17]">
                                    {notificationCount}
                                </span>
                            )}
                        </Link>

                        <div className="h-6 w-px bg-[#1e2637]"></div>

                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex flex-col items-end leading-tight">
                                <span className="text-sm font-semibold text-white">{user?.fullName || "A. Chen (CFO)"}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{organization?.name || "Corporate Treasury"}</span>
                            </div>
                            <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
                        </div>
                    </div>
                </header>

                {/* Sub-Pages Content */}
                <div className="flex-1 overflow-auto relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
