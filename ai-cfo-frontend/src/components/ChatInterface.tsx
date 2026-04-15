"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, type ChatResponse } from "@/lib/api";
import { AGENT_PERSONAS, DEFAULT_AGENT_ID } from "@/config/agents.config";
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, Info } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    suggestedQuestions?: string[];
    // Feature B: Confidence scoring
    confidence?: "high" | "medium" | "low";
    dataGrounded?: boolean; // true = based on user's actual data
}

interface ChatInterfaceProps {
    botId: string;
}

// ─── Derive confidence from response ─────────────────────────────────────────
// We calculate confidence from the response text heuristically on the frontend.
// High: response references numbers, percentages, or explicit data mentions
// Medium: response is contextual but not data-specific
// Low: response is general / fallback
function deriveConfidence(answer: string): { confidence: "high" | "medium" | "low"; dataGrounded: boolean } {
    const hasNumbers = /\d+[\.,]?\d*[%$₹€£k]?/.test(answer);
    const hasDataKeywords = /revenue|expense|profit|margin|budget|invoice|anomaly|forecast|cash flow|KPI/i.test(answer);
    const hasFallback = /i don't have|i'm not sure|i cannot|no data|unable to find/i.test(answer);

    if (hasFallback) return { confidence: "low", dataGrounded: false };
    if (hasNumbers && hasDataKeywords) return { confidence: "high", dataGrounded: true };
    if (hasDataKeywords) return { confidence: "medium", dataGrounded: true };
    return { confidence: "medium", dataGrounded: false };
}

// ─── Confidence Badge Component ───────────────────────────────────────────────
function ConfidenceBadge({ confidence, dataGrounded }: { confidence: "high" | "medium" | "low"; dataGrounded: boolean }) {
    const styles = {
        high:   { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <ShieldCheck className="h-3 w-3" />, label: "High Confidence" },
        medium: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20",       icon: <Info className="h-3 w-3" />,        label: "Medium Confidence" },
        low:    { color: "text-red-400 bg-red-500/10 border-red-500/20",             icon: <AlertCircle className="h-3 w-3" />, label: "Low Confidence" },
    };
    const s = styles[confidence];

    return (
        <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${s.color}`}>
                {s.icon}
                {s.label}
            </span>
            {dataGrounded && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] font-medium text-blue-400">
                    <Sparkles className="h-2.5 w-2.5" />
                    Grounded in your data
                </span>
            )}
        </div>
    );
}

export default function ChatInterface({ botId }: ChatInterfaceProps) {
    const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT_ID);
    const activeAgent = AGENT_PERSONAS[selectedAgentId];

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Hello! I'm ${activeAgent.name}. ${activeAgent.description} How can I assist you today?`,
            timestamp: new Date(),
            suggestedQuestions: activeAgent.quickQuestions,
            confidence: "high",
            dataGrounded: false,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSwitchAgent = (agentId: string) => {
        if (isLoading) return;
        const newAgent = AGENT_PERSONAS[agentId];
        setSelectedAgentId(agentId);
        setMessages([
            {
                role: "assistant",
                content: `Hello! I'm ${newAgent.name}. ${newAgent.description} How can I assist you today?`,
                timestamp: new Date(),
                suggestedQuestions: newAgent.quickQuestions,
                confidence: "high",
                dataGrounded: false,
            },
        ]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const history = messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response: ChatResponse = await sendMessage(botId, text, history, selectedAgentId);
            const { confidence, dataGrounded } = deriveConfidence(response.answer);

            const assistantMessage: Message = {
                role: "assistant",
                content: response.answer,
                timestamp: new Date(),
                suggestedQuestions: response.suggestedQuestions,
                confidence,
                dataGrounded,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                    timestamp: new Date(),
                    confidence: "low",
                    dataGrounded: false,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-full gap-4">
            {/* Agent Sidebar */}
            <div className="w-64 shrink-0 flex flex-col gap-3">
                <div className="px-2 pb-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" />
                        Specialists
                    </h3>
                </div>
                {Object.values(AGENT_PERSONAS).map((agent) => {
                    const isActive = selectedAgentId === agent.id;
                    const Icon = agent.icon;
                    return (
                        <button
                            key={agent.id}
                            onClick={() => handleSwitchAgent(agent.id)}
                            className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                                isActive
                                    ? `bg-[#121622] border-white/20 shadow-lg`
                                    : `bg-transparent border-transparent hover:bg-white/5`
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <div className={`p-1.5 rounded-lg ${isActive ? agent.bgColor : 'bg-white/5'} ${isActive ? agent.color : 'text-slate-500'}`}>
                                    <Icon size={16} />
                                </div>
                                <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                    {agent.name}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium ml-[34px]">{agent.role}</span>
                        </button>
                    )
                })}

                {/* Confidence Legend */}
                <div className="mt-auto px-2 py-3 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Confidence Guide</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                            <ShieldCheck className="h-3 w-3" /> High — cites your actual data
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-amber-400">
                            <Info className="h-3 w-3" /> Medium — contextual analysis
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-red-400">
                            <AlertCircle className="h-3 w-3" /> Low — general / no data
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a0f1a] to-[#0d1525] shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className={`flex items-center gap-3 border-b border-white/10 bg-[#121622]/80 backdrop-blur-md px-6 py-4`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activeAgent.bgColor} ${activeAgent.color}`}>
                        <activeAgent.icon size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">{activeAgent.name}</h2>
                        <p className={`text-xs ${activeAgent.color} opacity-80 font-medium`}>
                            {activeAgent.role}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                    {messages.map((msg, i) => (
                        <div key={i}>
                            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-white/5 text-gray-200 border border-white/5"
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                    <div className={`mt-2 text-[10px] ${msg.role === "user" ? "text-blue-200/60" : "text-gray-500"}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    {/* ── Feature B: Confidence Badge ── */}
                                    {msg.role === "assistant" && msg.confidence && (
                                        <ConfidenceBadge confidence={msg.confidence} dataGrounded={msg.dataGrounded ?? false} />
                                    )}
                                </div>
                            </div>

                            {/* Suggested Questions */}
                            {msg.suggestedQuestions &&
                                msg.suggestedQuestions.length > 0 &&
                                i === messages.length - 1 && (
                                    <div className="mt-3 flex flex-wrap gap-2 pl-2">
                                        {msg.suggestedQuestions.map((q, qi) => (
                                            <button
                                                key={qi}
                                                onClick={() => handleSend(q)}
                                                className="rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs text-blue-300 transition-all hover:bg-blue-500/15 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
                                    </div>
                                    <span className="text-xs text-gray-500">Analyzing your financial data...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-2 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/5 transition-all">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask your AI CFO anything..."
                            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
