import { useEffect, useState } from "react";
import { getKPIs, type KPI } from "@/lib/api";
import { TrendingUp, Wallet, CreditCard, Target } from "lucide-react";

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
        return <div className="animate-pulse bg-amber-500/5 h-32 rounded-2xl w-full"></div>;
    }

    const rev = Number(stats.total_revenue || 0);
    const exp = Number(stats.total_expenses || 0);
    const profit = Number(stats.net_profit || 0);
    
    // Safely parse profit margin or calculate automatically if backend omission occurs
    const margin = stats.profit_margin !== undefined && stats.profit_margin !== null
        ? Number(stats.profit_margin) 
        : (rev > 0 ? (profit / rev) * 100 : 0);

    const cards = [
        { title: "Total Revenue", value: `$${rev.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        { title: "Total Expenses", value: `$${exp.toLocaleString()}`, icon: Wallet, color: "text-amber-400", bgColor: "bg-amber-500/10" },
        { title: "Net Profit", value: `$${profit.toLocaleString()}`, icon: CreditCard, color: "text-blue-400", bgColor: "bg-blue-500/10" },
        { title: "Profit Margin", value: `${margin.toFixed(1)}%`, icon: Target, color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div key={i} className="rounded-xl border border-[#1e2637] bg-[#121622] p-5 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{card.title}</h3>
                            <div className={`${card.bgColor} rounded-lg p-2 transition-transform group-hover:scale-110`}>
                                <Icon size={18} className={card.color} />
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <p className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{card.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
