import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, Clock, Zap, Activity } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { BotType } from "@/types";

export default function BotManagementDashboard({ bot }: { bot: BotType }) {
  const [stats, setStats] = useState<{
    total_conversations: number;
    active_users: number;
    avg_response_time_ms: number;
    success_rate: number;
    tokens_used: number;
    tokens_limit: number;
    tokens_used_percent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch analytics - stable effect with no function dependencies
  useEffect(() => {
    const fetchAnalytics = async (isInitialLoad = false) => {
      if (!bot.bot_id) {
        setError("Bot ID is missing");
        setLoading(false);
        return;
      }

      if (isInitialLoad) {
        setLoading(true);
      }

      try {
        const res = await fetch(`/api/analytics/${bot.bot_id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Failed to load analytics: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        setStats(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load analytics";
        console.error("Analytics fetch error:", err);
        setError(errorMessage);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    // Initial load with loading state
    fetchAnalytics(true);

    // Set up 30 second interval for background refetching
    intervalRef.current = setInterval(() => {
      fetchAnalytics(false);
    }, 10000 * 60); // 10 minutes

    // Cleanup interval on unmount or bot_id change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [bot.bot_id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return <div className="p-6 text-destructive text-sm">Failed: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-x-hidden">
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
        <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-card to-card/50 hover:shadow-md hover:border-primary/30 transition-all duration-300">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-primary/20 shadow-md shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm sm:text-base md:text-lg">
                    {bot.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-base sm:text-lg md:text-xl truncate">
                    {bot.name}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm",
                          isOnline
                            ? "bg-green-500 animate-pulse ring-2 ring-green-500/30"
                            : "bg-destructive"
                        )}
                      />
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  {bot.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-2">
                      {bot.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* KEY METRICS */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h4 className="font-bold text-foreground text-base sm:text-lg">
              Key Metrics
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Conversations */}
            <Card className="group border border-border/50 shadow-sm bg-gradient-to-br from-card to-card/80 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 relative">
              <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 pr-10 sm:pr-12">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4 h-4 sm:h-5 flex items-end">
                    Conversations
                  </p>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
                    {stats.total_conversations.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="group border border-border/50 shadow-sm bg-gradient-to-br from-card to-card/80 hover:shadow-lg hover:border-green-500/30 transition-all duration-300 hover:-translate-y-1 relative">
              <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 pr-10 sm:pr-12">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4 h-4 sm:h-5 flex items-end">
                    Active Users
                  </p>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
                    {stats.active_users.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Response Time */}
            <Card className="group border border-border/50 shadow-sm bg-gradient-to-br from-card to-card/80 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 relative">
              <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 pr-10 sm:pr-12">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4 h-4 sm:h-5 flex items-end">
                    Avg Response Time
                  </p>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
                    {stats.avg_response_time_ms >= 1000
                      ? `${(stats.avg_response_time_ms / 1000).toFixed(1)}s`
                      : `${stats.avg_response_time_ms}ms`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="group border border-border/50 shadow-sm bg-gradient-to-br from-card to-card/80 hover:shadow-lg hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 relative">
              <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 pr-10 sm:pr-12">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4 h-4 sm:h-5 flex items-end">
                    Success Rate
                  </p>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
                    {stats.success_rate.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3 sm:pb-4 md:pb-5 border-b border-border/40">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-5 md:pt-6 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Token Usage */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  Tokens Used
                </span>
                <span className="text-base sm:text-lg font-bold text-foreground">
                  {stats.tokens_used.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={stats.tokens_used_percent}
                  className="h-2 sm:h-3 bg-muted/50"
                />
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/60 to-primary opacity-20"
                  style={{
                    width: `${Math.min(stats.tokens_used_percent, 100)}%`,
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm">
                <span className="text-muted-foreground font-medium">
                  {stats.tokens_used.toLocaleString()} /{" "}
                  {stats.tokens_limit.toLocaleString()} tokens
                </span>
                <span className="text-muted-foreground font-semibold">
                  {stats.tokens_used_percent.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
