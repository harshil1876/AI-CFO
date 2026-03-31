"use client";
import { Bell, AlertTriangle, CheckCircle, Info, ShieldAlert, XCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { getAuthHeaders } from "@/lib/api";

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: string;
}

export default function NotificationsPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const bot_id = organization?.id || user?.id;

    useEffect(() => {
        if (!bot_id) return;

        const fetchNotifications = async () => {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`http://localhost:8000/api/notifications/?bot_id=${bot_id}`, {
                    headers
                });
                const data = await res.json();
                setNotifications(data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [bot_id]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'fraud': return { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" };
            case 'warning': return { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" };
            case 'success': return { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" };
            case 'info': return { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10" };
            case 'action': return { icon: Zap, color: "text-indigo-400", bg: "bg-indigo-500/10" };
            case 'error': return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" };
            default: return { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10" };
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="px-0 py-8 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
                        <p className="text-sm text-slate-400 mt-1">Stay updated with real-time financial intelligence and risk alerts.</p>
                    </div>
                    <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors border border-[#1e2637] px-3 py-1.5 rounded-lg hover:bg-white/5">
                        Mark all as read
                    </button>
                </div>
            </header>

            <div className="grid gap-4">
                {notifications.length === 0 && !loading && (
                    <div className="py-20 text-center border border-dashed border-[#1e2637] rounded-xl">
                        <p className="text-slate-500">No new notifications found.</p>
                    </div>
                )}
                
                {notifications.map((n) => {
                    const { icon: Icon, color, bg } = getIcon(n.type);
                    return (
                        <div key={n.id} className="group flex items-start gap-5 p-5 bg-[#121622] border border-[#1e2637] rounded-xl hover:border-white/10 transition-all cursor-pointer">
                            <div className={`${bg} p-3 rounded-xl transition-transform group-hover:scale-105`}>
                                <Icon size={22} className={color} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white group-hover:text-amber-100 transition-colors">{n.title}</h3>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        {new Date(n.time).toLocaleDateString()} {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{n.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-8 border-t border-[#1e2637] flex justify-center">
                <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                    Back to Overview
                </Link>
            </div>
        </div>
    );
}
