import { useEffect, useState } from "react";
import Link from "next/link";
import { getKPIs, type KPI } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import { TrendingUp, TrendingDown, Wallet, CreditCard, Target, AlertTriangle, Activity, X } from "lucide-react";

interface MetricCard {
    title: string;
    value: string;
    subValue?: string;
    trend?: number; // positive = good (green), negative = bad (red)
    trendLabel?: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

export default function MetricsGrid({ botId }: { botId: string }) {
    const [stats, setStats] = useState<KPI | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);
    const { formatAmount } = useCurrency();

    useEffect(() => {
        setIsLoading(true);
        getKPIs(botId).then(data => {
            if (data.length > 0) {
                setStats(data[0]);
            }
        }).catch(console.error).finally(() => setIsLoading(false));
    }, [botId]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl border border-[#1e2637] bg-[#121622] animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats) {
        if (showWelcome) {
            return (
                <div className="w-full rounded-xl border border-[#1e2637] bg-gradient-to-br from-[#121622] to-[#0a0d14] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[200px] animate-in fade-in zoom-in-95 duration-500">
                    <button 
                        onClick={() => setShowWelcome(false)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {/* Background radial glow */}
                    <div className="absolute inset-0 bg-blue-500/5 filter blur-[100px] rounded-full transform -translate-y-1/2" />
                    
                    <div className="bg-blue-500/10 p-4 rounded-2xl mb-4 border border-blue-500/20 relative z-10">
                        <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Welcome to Your AI CFO</h3>
                    <p className="text-sm text-slate-400 max-w-md relative z-10 mb-6">
                        Your financial dashboard is ready. Connect your bank, accounting software, or upload your first dataset to generate live KPI insights.
                    </p>
                    <div className="flex gap-4 relative z-10">
                        <Link href="/dashboard/connectors" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all border border-blue-400/50">
                            Connect Data Source
                        </Link>
                        <Link href="/dashboard/upload" className="px-5 py-2.5 bg-[#1e2637] hover:bg-[#252f43] text-white text-sm font-semibold rounded-lg transition-all border border-white/5">
                            Upload CSV / Excel
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-in fade-in duration-500">
                {[
                    { title: "Total Revenue", value: "— Upload data", icon: TrendingUp, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
                    { title: "Total Expenses", value: "— Run pipeline", icon: Wallet, color: "text-amber-400", bgColor: "bg-amber-500/10" },
                    { title: "Net Profit", value: "— No data yet", icon: CreditCard, color: "text-blue-400", bgColor: "bg-blue-500/10" },
                    { title: "Profit Margin", value: "—", icon: Target, color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
                ].map((card, i) => (
                    <div key={i} className="rounded-xl border border-[#1e2637] bg-[#121622] p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{card.title}</h3>
                            <div className={`${card.bgColor} rounded-lg p-2`}>
                                <card.icon size={18} className={card.color} />
                            </div>
                        </div>
                        <p className="text-lg font-semibold text-slate-600">{card.value}</p>
                    </div>
                ))}
            </div>
        );
    }

    const rev    = Number(stats.total_revenue || 0);
    const exp    = Number(stats.total_expenses || 0);
    const profit = Number(stats.net_profit || 0);
    const margin = stats.profit_margin !== undefined && stats.profit_margin !== null
        ? Number(stats.profit_margin)
        : (rev > 0 ? (profit / rev) * 100 : 0);
    const anomalies = Number((stats as any).anomaly_count || 0);

    const cards: MetricCard[] = [
        {
            title: "Total Revenue",
            value: formatAmount(rev),
            subValue: "Current Period",
            icon: TrendingUp,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
        },
        {
            title: "Total Expenses",
            value: formatAmount(exp),
            subValue: margin > 0 ? `Margin ${margin.toFixed(1)}%` : undefined,
            icon: Wallet,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
        },
        {
            title: "Net Profit / Loss",
            value: formatAmount(profit),
            subValue: profit < 0 ? "Net loss" : "Net income",
            icon: profit >= 0 ? TrendingUp : TrendingDown,
            color: profit >= 0 ? "text-blue-400" : "text-red-400",
            bgColor: profit >= 0 ? "bg-blue-500/10" : "bg-red-500/10",
        },
        {
            title: "Profit Margin",
            value: `${margin.toFixed(1)}%`,
            subValue: margin >= 20 ? "Healthy margin" : margin >= 10 ? "Moderate" : "Low — review expenses",
            icon: Target,
            color: margin >= 20 ? "text-emerald-400" : margin >= 10 ? "text-amber-400" : "text-red-400",
            bgColor: margin >= 20 ? "bg-emerald-500/10" : margin >= 10 ? "bg-amber-500/10" : "bg-red-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {cards.map((card, i) => {
                const Icon = card.icon;
                const trendUp   = card.trend !== undefined && card.trend > 0;
                const trendDown = card.trend !== undefined && card.trend < 0;
                return (
                    <div
                        key={i}
                        className="rounded-xl border border-[#1e2637] bg-[#121622] p-5 shadow-sm relative overflow-hidden group hover:border-white/10 transition-all"
                    >
                        {/* Background glow */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${card.bgColor}`} />

                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{card.title}</h3>
                            <div className={`${card.bgColor} rounded-lg p-2 transition-transform group-hover:scale-110`}>
                                <Icon size={18} className={card.color} />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{card.value}</p>
                            {card.subValue && (
                                <p className="text-[11px] text-slate-500 mt-1">{card.subValue}</p>
                            )}
                        </div>

                        {/* Trend badge */}
                        {card.trendLabel && (
                            <div className="relative z-10 mt-3 flex items-center gap-1.5">
                                <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                    trendUp   ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                    : trendDown ? "text-red-400 bg-red-500/10 border-red-500/20"
                                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                }`}>
                                    {trendUp ? <TrendingUp size={10} /> : trendDown ? <TrendingDown size={10} /> : <Activity size={10} />}
                                    {card.trendLabel}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
