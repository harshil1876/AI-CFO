"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, type ChatResponse } from "@/lib/api";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    suggestedQuestions?: string[];
}

interface ChatInterfaceProps {
    botId: string;
}

export default function ChatInterface({ botId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Hello! I'm your AI CFO. I can analyze your financial data, provide forecasts, detect anomalies, and give you actionable recommendations. How can I help you today?",
            timestamp: new Date(),
            suggestedQuestions: [
                "What are my current KPIs?",
                "Show me revenue forecast",
                "Any anomalies detected?",
                "Give me financial recommendations",
            ],
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

            const response: ChatResponse = await sendMessage(botId, text, history);

            const assistantMessage: Message = {
                role: "assistant",
                content: response.answer,
                timestamp: new Date(),
                suggestedQuestions: response.suggestedQuestions,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                    timestamp: new Date(),
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
        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a0f1a] to-[#0d1525] shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
                    ₹
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">AI CFO</h2>
                    <p className="text-xs text-blue-300/70">
                        Financial Intelligence • Always Online
                    </p>
                </div>
                <div className="ml-auto flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                {messages.map((msg, i) => (
                    <div key={i}>
                        <div
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-white/5 text-gray-200 border border-white/5"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                <div
                                    className={`mt-2 text-[10px] ${msg.role === "user"
                                            ? "text-blue-200/60"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {msg.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
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
                                <span className="text-xs text-gray-500">Analyzing...</span>
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                        >
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
