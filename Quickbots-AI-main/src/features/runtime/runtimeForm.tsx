"use client";

import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useBotData, useBotRuntimeSettings } from "@/components/bot-context";
import { botRuntimeSettingsSchema } from "@/schema";
import type { BotRuntimeSettingsType } from "@/types";

export default function BotRun() {
  const { runtimeSettings } = useBotRuntimeSettings();

  // user's saved settings
  const fetchedSettings = runtimeSettings as BotRuntimeSettingsType;

  // initialize the form and the validator
  const form = useForm<BotRuntimeSettingsType>({
    resolver: zodResolver(
      botRuntimeSettingsSchema
    ) as Resolver<BotRuntimeSettingsType>,
    defaultValues: fetchedSettings,
  });

  // reset the form on changes and set the latest values and also reset isDirty to latest test
  useEffect(() => {
    if (runtimeSettings) form.reset(runtimeSettings);
  }, [runtimeSettings, form]);

  // get the bot for the bot_id property
  const { bot } = useBotData();

  // if no bot id throw err
  if (!bot.bot_id) {
    throw new Error("Bot does not exists.");
  }

  // Note: These fields are read-only, no form submission needed

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Advance Bot Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            View your bot&apos;s operational parameters and resource limits
            (read-only).
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-8">
            {/* Resource Quota Section */}
            <div className="space-y-6 pb-8 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Resource Quotas (Read-Only)
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="rate_limit_per_min"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Rate Limit (per minute)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          placeholder="60"
                          className="h-10 bg-muted border-border cursor-not-allowed"
                          disabled
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Maximum requests per minute (read-only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="token_quota"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Token Quota
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="50000"
                          className="h-10 bg-muted border-border cursor-not-allowed"
                          disabled
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Total tokens available for this bot (read-only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="api_calls_this_month"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        API Calls This Month
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="h-10 bg-muted border-border cursor-not-allowed"
                          disabled
                          {...field}
                          value={field.value ?? 0}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Current API calls used this month (read-only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
