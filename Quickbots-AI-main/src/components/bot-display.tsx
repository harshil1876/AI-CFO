"use client";

import Link from "next/link";

import type { BotType } from "@/types";

import { BotIcon, Calendar, Clock, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function BotCard({ bot }: { bot: BotType }) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30 bg-card border-border/50 flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="bg-primary/8 flex h-10 w-10 items-center justify-center rounded-lg shrink-0 group-hover:bg-primary/12 transition-colors">
              <BotIcon className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                {bot.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-medium">
                  Active
                </Badge>
                <Badge
                  onClick={async () => {
                    await navigator.clipboard.writeText(bot.bot_id!);
                  }}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  ID: {bot.bot_id?.slice(0, 12)}...
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-1">
        <CardDescription className="text-xs leading-relaxed line-clamp-2 mb-4 text-muted-foreground">
          {bot.description}
        </CardDescription>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 opacity-60" />
            <span>Created: {formatDate(bot.created_at!)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            <span>Updated: {formatDate(bot.updated_at!)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t border-border/30">
        <Button asChild variant="default" size="sm" className="flex-1">
          <Link href={`/bots/${bot.bot_id}/configure`}>
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Manage
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
