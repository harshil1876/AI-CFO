"use client";

import { useEffect, useState } from "react";
import { useBotActions } from "@/lib/hooks/use-bot";
import type { BotType } from "@/types";
import BotCard from "@/components/bot-display";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BotIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

function EmptyState() {
  return (
    <div className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted/30 mb-6 flex h-20 w-20 items-center justify-center rounded-lg">
          <BotIcon className="text-muted-foreground h-10 w-10" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No bots yet</h3>
        <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
          You haven&apos;t created any AI bots yet. Start by creating your first
          bot to begin automating conversations.
        </p>
      </CardContent>

      <div className="mt-12 pt-8 border-t border-border/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-medium mb-1 text-sm">
              Need help getting started?
            </h3>
            <p className="text-xs text-muted-foreground">
              Check out our documentation and tutorials to make the most of your
              bots.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href="/#">View Docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BotsList() {
  const { getBots, isReady } = useBotActions();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch - wait for system readiness
  useEffect(() => {
    if (!isReady) return;

    const fetchBots = async () => {
      setLoading(true);
      setError(null);

      const result = await getBots();
      console.log(result);

      if (result.ok && result.data) {
        setBots(result.data);
      } else {
        setError("message" in result ? result.message : "Failed to fetch bots");
      }
      setLoading(false);
    };

    fetchBots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-6 sm:py-8 w-full min-w-0">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-primary">
                Bot Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Create and manage your AI bots.
              </p>
            </div>

            <Button asChild size="lg" className="shrink-0 w-full sm:w-auto">
              <Link href="/bots/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Bot
              </Link>
            </Button>
          </div>

          {bots.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Total Bots
                  </span>
                  <Badge variant="default" className="text-xs font-semibold">
                    {bots.length}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Active
                  </span>
                  <Badge className="bg-emerald-500/90 text-white text-xs font-semibold">
                    {bots.length}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                You have{" "}
                <span className="font-semibold text-foreground">
                  {bots.length}
                </span>{" "}
                {bots.length === 1 ? "bot" : "bots"} in your collection
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
          {bots.length > 0 ? (
            bots.map((bot) => <BotCard key={bot.bot_id} bot={bot} />)
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
