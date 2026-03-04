"use client";

import { useState } from "react";
import {
    runSimulation,
    type SimulationResult,
    type SimulationScenario,
} from "@/lib/api";

interface SimulationPanelProps {
    botId: string;
}

export default function SimulationPanel({ botId }: SimulationPanelProps) {
    const [scenarioType, setScenarioType] = useState<SimulationScenario["type"]>("adjust_revenue");
    const [value, setValue] = useState("");
    const [target, setTarget] = useState("");
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const period = new Date().toISOString().slice(0, 7);

    const handleRunSimulation = async () => {
        if (!value) return;
        setIsRunning(true);

        const scenario: SimulationScenario = {
            type: scenarioType,
            value: parseFloat(value),
            ...(scenarioType === "adjust_department" && target ? { target } : {}),
        };

        try {
            const res = await runSimulation(botId, period, [scenario]);
            setResult(res);
        } catch {
            setResult(null);
        } finally {
            setIsRunning(false);
        }
    };

    const riskColors: Record<string, string> = {
        low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
        high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        critical: "text-red-400 bg-red-500/10 border-red-500/20",
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Scenario Builder */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span className="text-lg">🧪</span> What-If Scenario Builder
                </h3>

                {/* Scenario Type */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Scenario Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: "adjust_revenue", label: "Revenue" },
                            { value: "adjust_expense", label: "Expenses" },
                            { value: "adjust_department", label: "Department" },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setScenarioType(opt.value as SimulationScenario["type"])}
                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${scenarioType === opt.value
                                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                        : "border-white/10 bg-white/[0.02] text-gray-400 hover:bg-white/5"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Value Input */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                        Change (%) — use negative for decrease
                    </label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="e.g., 20 for +20%, -15 for -15%"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                    />
                </div>

                {/* Department Target */}
                {scenarioType === "adjust_department" && (
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Department Name</label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="e.g., Marketing, Engineering"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                        />
                    </div>
                )}

                <button
                    onClick={handleRunSimulation}
                    disabled={isRunning || !value}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40"
                >
                    {isRunning ? "Running Simulation..." : "Run Simulation"}
                </button>
            </div>

            {/* Results */}
            {result && !result.error && (
                <div className="space-y-4">
                    {/* Risk Badge */}
                    <div className={`rounded-xl border p-4 ${riskColors[result.risk_level] || riskColors.medium}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Risk: {result.risk_level}
                            </span>
                        </div>
                        <p className="mt-1 text-sm opacity-80">{result.risk_message}</p>
                    </div>

                    {/* Comparison Table */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                        <div className="grid grid-cols-4 gap-px bg-white/5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="bg-[#0a0f1a] px-4 py-3">Metric</div>
                            <div className="bg-[#0a0f1a] px-4 py-3 text-right">Baseline</div>
                            <div className="bg-[#0a0f1a] px-4 py-3 text-right">Simulated</div>
                            <div className="bg-[#0a0f1a] px-4 py-3 text-right">Impact</div>
                        </div>
                        {[
                            { key: "total_revenue", label: "Revenue" },
                            { key: "total_expenses", label: "Expenses" },
                            { key: "net_profit", label: "Net Profit" },
                            { key: "profit_margin", label: "Margin (%)" },
                        ].map((metric) => {
                            const impactKey = metric.key.replace("total_", "") + "_change";
                            const impact = result.impact[impactKey] || result.impact[metric.key + "_change"] || 0;
                            return (
                                <div key={metric.key} className="grid grid-cols-4 gap-px bg-white/5">
                                    <div className="bg-[#0a0f1a] px-4 py-3 text-sm text-gray-300">{metric.label}</div>
                                    <div className="bg-[#0a0f1a] px-4 py-3 text-sm text-right text-gray-400">
                                        {metric.key === "profit_margin"
                                            ? `${result.baseline[metric.key]}%`
                                            : `$${result.baseline[metric.key]?.toLocaleString()}`}
                                    </div>
                                    <div className="bg-[#0a0f1a] px-4 py-3 text-sm text-right text-white font-medium">
                                        {metric.key === "profit_margin"
                                            ? `${result.simulated[metric.key]}%`
                                            : `$${result.simulated[metric.key]?.toLocaleString()}`}
                                    </div>
                                    <div className={`bg-[#0a0f1a] px-4 py-3 text-sm text-right font-medium ${impact > 0 ? "text-emerald-400" : impact < 0 ? "text-red-400" : "text-gray-500"
                                        }`}>
                                        {impact > 0 ? "+" : ""}{metric.key === "profit_margin" ? `${impact}%` : `$${impact.toLocaleString()}`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
