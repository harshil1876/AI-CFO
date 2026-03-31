"use client";
import { useEffect, useState } from "react";
import { getKPIs, type KPI } from "@/lib/api";

export default function MetricsGrid({ botId }: { botId: string }) {
    const [stats, setStats] = useState<KPI | null>(null);

    useEffect(() => {
        getKPIs(botId).then(data => {
            if (data.length > 0) {
                setStats(data[0]);
            }
        }).catch(console.error);
    }, [botId]);

    if (!stats) {
        return <div className="animate-pulse bg-white/5 h-32 rounded-2xl w-full"></div>;
    }

    const rev = Number(stats.total_revenue || 0);
    const exp = Number(stats.total_expenses || 0);
    const profit = Number(stats.net_profit || 0);
    
    // Safely parse profit margin or calculate automatically if backend omission occurs
    const margin = stats.profit_margin !== undefined && stats.profit_margin !== null
        ? Number(stats.profit_margin) 
        : (rev > 0 ? (profit / rev) * 100 : 0);

    const cards = [
        { title: "Total Revenue", value: `$${rev.toLocaleString()}`, icon: "💰", color: "text-emerald-400" },
        { title: "Total Expenses", value: `$${exp.toLocaleString()}`, icon: "📉", color: "text-red-400" },
        { title: "Net Profit", value: `$${profit.toLocaleString()}`, icon: "💎", color: "text-blue-400" },
        { title: "Profit Margin", value: `${margin.toFixed(1)}%`, icon: "🎯", color: "text-yellow-400" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {cards.map((card, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#080d18] p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 text-7xl transition-transform group-hover:scale-110">
                        {card.icon}
                    </div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.title}</h3>
                        <div className="bg-white/5 rounded-lg p-2 leading-none">{card.icon}</div>
                    </div>
                    
                    <div className="relative z-10">
                        <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
