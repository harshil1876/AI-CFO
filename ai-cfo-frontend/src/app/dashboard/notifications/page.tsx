"use client";

import { useEffect, useState } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import {
    Bell, AlertTriangle, CheckCircle, FileUp,
    Info, Zap, RefreshCw, Loader2, Inbox,
    ArrowRight, XCircle
} from "lucide-react";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: "fraud" | "warning" | "info" | "action" | "success" | "error";
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    fraud:   { icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
    warning: { icon: <AlertTriangle className="h-5 w-5" />, color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
    action:  { icon: <Zap className="h-5 w-5" />,           color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
    info:    { icon: <Info className="h-5 w-5" />,           color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
    success: { icon: <CheckCircle className="h-5 w-5" />,    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    error:   { icon: <XCircle className="h-5 w-5" />,        color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
};

const formatRelative = (isoString: string) => {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

// Map type to where the user should go to take action
const TYPE_LINK: Record<string, string> = {
    fraud:   "/dashboard/anomalies",
    warning: "/dashboard/anomalies",
    action:  "/dashboard/pipeline",
    info:    "/dashboard/chat",
    success: "/dashboard/upload",
    error:   "/dashboard/upload",
};

export default function NotificationsPage() {
    const { getToken, orgId } = useAuth();
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    const botId = orgId || user?.id || "default_org";

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`http://127.0.0.1:8000/api/notifications/?bot_id=${botId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error("Failed to load notifications", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { if (botId) fetchNotifications(); }, [botId]);

    const filters = [
        { key: "all",     label: "All" },
        { key: "fraud",   label: "Anomalies" },
        { key: "warning", label: "Warnings" },
        { key: "action",  label: "AI Advice" },
        { key: "success", label: "Uploads" },
    ];

    const displayed = filter === "all"
        ? notifications
        : notifications.filter(n => n.type === filter);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-amber-500/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                        <Bell className="h-8 w-8 text-amber-500" />
                        Notification Centre
                    </h1>
                    <p className="text-slate-400 mt-2">
                        All alerts, AI insights, and upload events —{" "}
                        <span className="text-amber-400 font-semibold">{notifications.length}</span> events
                    </p>
                </div>
                <button
                    onClick={fetchNotifications}
                    className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Refresh"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            filter === f.key
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notification Feed */}
            {isLoading ? (
                <div className="flex justify-center items-center h-48 text-slate-400">
                    <Loader2 className="h-7 w-7 animate-spin text-amber-500 mr-3" />
                    Loading events...
                </div>
            ) : displayed.length === 0 ? (
                <div className="text-center py-24">
                    <Inbox className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold text-lg">No notifications</p>
                    <p className="text-slate-600 text-sm mt-1">
                        Run your Intelligence Pipeline to start generating alerts.
                    </p>
                    <Link
                        href="/dashboard/pipeline"
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-all"
                    >
                        <Zap className="h-4 w-4" /> Run Pipeline
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayed.map((notif) => {
                        const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                        const link = TYPE_LINK[notif.type] || "/dashboard";
                        return (
                            <Link
                                key={notif.id}
                                href={link}
                                className={`block rounded-xl border p-5 transition-all hover:scale-[1.005] hover:shadow-xl group ${cfg.bg} ${cfg.border}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                                        {cfg.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className={`font-semibold text-sm ${cfg.color}`}>
                                                {notif.title}
                                            </p>
                                            <span className="text-slate-500 text-xs shrink-0">
                                                {formatRelative(notif.time)}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                            {notif.description}
                                        </p>
                                    </div>

                                    {/* Action arrow */}
                                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
