"use client";

import { useTransition } from "react";
import { Trash, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { ConfirmActionDialog } from "../../components/ConfirmDialog";
import { useBotData } from "@/components/bot-context";
import { useBotActions } from "@/lib/hooks/use-bot";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DangerSectionPage() {
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [isPendingDeleteAll, startDeleteAllTransition] = useTransition();
  const { deleteBot, deleteAllBots } = useBotActions();
  // get the bot for the bot_id property
  const { bot } = useBotData();

  // if no bot id throw err
  if (!bot.bot_id) {
    throw new Error("Bot does not exists.");
  }
  function handleDeleteBot() {
    startDeleteTransition(async () => {
      // db call to delete the bot
      const result = await deleteBot(bot.bot_id!);

      if (result.ok) {
        toast.success(`Bot ${bot.name} is deleted`);
        // Trigger refetch on bots list page
        if (typeof window !== "undefined") {
          const refetch = (window as Window & { refetchBots?: () => void })
            .refetchBots;
          if (refetch) {
            refetch();
          }
        }
        window.location.href = "/bots";
      } else {
        const message = result.message || "Failed to delete bot";
        const isAuthError =
          message.toLowerCase().includes("authentication") ||
          message.toLowerCase().includes("user authentication");
        toast.error(message, {
          duration: isAuthError ? 8000 : 5000,
        });
      }
    });
  }

  function handleDeleteAllBots() {
    startDeleteAllTransition(async () => {
      const result = await deleteAllBots();

      if (result.ok) {
        toast.success("All bots have been deleted");
        // Trigger refetch on bots list page
        if (typeof window !== "undefined") {
          const refetch = (window as Window & { refetchBots?: () => void })
            .refetchBots;
          if (refetch) {
            refetch();
          }
        }
        window.location.href = "/bots";
      } else {
        const message = result.message || "Failed to delete all bots";
        const isAuthError =
          message.toLowerCase().includes("authentication") ||
          message.toLowerCase().includes("user authentication");
        toast.error(message, {
          duration: isAuthError ? 8000 : 5000,
        });
      }
    });
  }
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 py-6 sm:py-8 w-full min-w-0 overflow-x-hidden">
      <div className="space-y-2 mb-6 sm:mb-8 md:mb-10 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">
          Danger Zone
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Manage runtime settings, operational controls, and day-to-day bot
          operations. These actions cannot be undone.
        </p>
      </div>

      <Card className="border border-border/50 shadow-none w-full overflow-hidden">
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border/40 rounded-lg bg-background/50 hover:bg-background/80 transition-colors duration-200">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h4 className="font-medium text-foreground text-sm sm:text-base">
                Bot Status
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Currently bots are locked as active and cannot be changed. You
                can change the status to inactive in future version of
                Quickbots.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-destructive/30 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors duration-200">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h4 className="font-medium text-destructive text-sm sm:text-base">
                Delete Bot
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Permanently delete this bot and all associated data.
              </p>
            </div>
            <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end">
              <ConfirmActionDialog
                title="Are you sure to delete this bot?"
                description="This action is irreversible. All data associated with this bot will be permanently deleted."
                triggerLabel="Delete Bot"
                icon={<Trash2 className="h-4 w-4" />}
                actionLabel="Yes, Delete"
                variant="destructive"
                onConfirm={handleDeleteBot}
                disabled={isPendingDelete}
                isDestructive={true}
                confirmationText={bot.name}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-destructive/40 rounded-lg bg-destructive/10 hover:bg-destructive/15 transition-colors duration-200">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h4 className="font-medium text-destructive text-sm sm:text-base">
                Delete All Bots
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Permanently delete all your bots and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ConfirmActionDialog
                      title="Are you absolutely sure you want to delete ALL bots?"
                      description="This will permanently delete ALL of your bots and all their associated data. This action is completely irreversible and cannot be undone. Please confirm you understand the consequences."
                      triggerLabel="Delete All Bots"
                      icon={<Trash className="h-4 w-4" />}
                      actionLabel="Yes, Delete All"
                      variant="destructive"
                      onConfirm={handleDeleteAllBots}
                      disabled={true}
                      isDestructive={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    This feature is temporarily disabled for safety. Please
                    delete bots individually if needed.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
