"use client";

import { useUser, useOrganization, UserButton, OrganizationSwitcher, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { organization } = useOrganization();
    const pathname = usePathname();

    const tabs = [
        { href: "/dashboard", label: "Financial Overview", icon: "📊" },
        { href: "/dashboard/chat", label: "AI CFO Chat", icon: "💬" },
        { href: "/dashboard/budget", label: "Budget & Scenarios", icon: "📈" },
        { href: "/dashboard/ap", label: "Accounts Payable", icon: "🧾" },
        { href: "/dashboard/upload", label: "Upload Data", icon: "📤" },
        { href: "/dashboard/pipeline", label: "Run Pipeline", icon: "⚡" },
        { href: "/dashboard/simulation", label: "What-If", icon: "🧪" },
        { href: "/dashboard/connectors", label: "Connectors", icon: "🔌" },
    ];

    // Show loading while Clerk loads
    if (!isUserLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#060a14] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <p className="text-sm text-gray-500">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#060a14] text-white">
            {/* Sidebar */}
            <aside className="flex w-64 flex-col border-r border-white/5 bg-[#080d18]">
                {/* Logo */}
                <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold shadow-lg shadow-blue-500/20">
                        ₹
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">AI CFO</h1>
                        <p className="text-[10px] text-gray-500">Enterprise Intelligence</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all ${
                                    isActive
                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                                        : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
                                }`}
                            >
                                <span className="text-base">{tab.icon}</span>
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Status Footer */}
                <div className="border-t border-white/5 p-4 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8",
                                },
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-gray-300">
                                {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
                            </p>
                            <p className="truncate text-[10px] text-gray-600">
                                {organization?.name || "Personal Account"}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Workspace</p>
                        <OrganizationSwitcher
                            hidePersonal={false}
                            afterCreateOrganizationUrl="/dashboard"
                            afterLeaveOrganizationUrl="/dashboard"
                            afterSelectOrganizationUrl="/dashboard"
                            afterSelectPersonalUrl="/dashboard"
                            appearance={{
                                elements: {
                                    rootBox: "w-full flex items-center justify-start",
                                    organizationSwitcherTrigger: "w-full text-xs text-gray-300 hover:text-white transition-colors bg-transparent",
                                    organizationPreviewTextContainer: "truncate font-mono",
                                }
                            }}
                        />
                    </div>
                    <div className="rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">Model</p>
                        <p className="mt-1 text-xs text-blue-400">Gemini 2.5 Flash</p>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-2">
                        <SignOutButton redirectUrl="/">
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/20 hover:text-red-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.048a.75.75 0 1 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06l-1.048-1.048h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
                                </svg>
                                Log Out
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </aside>

            {/* Main Content Area provided by Next.js child routes */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
