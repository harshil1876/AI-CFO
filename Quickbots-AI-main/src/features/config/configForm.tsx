"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { hasActualFormChanges } from "@/lib/utils/form-change-detector";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import SaveTriggerUI from "@/components/SaveTriggerUI";
import { useBotConfigs, useBotData } from "@/components/bot-context";
import { useConfigActions } from "@/lib/hooks/use-bot-config";
import { botConfigSchema } from "@/schema";
import type { BotConfigType } from "@/types";
import { GenerateButton, GenerateFieldSheet } from "@/features/ai-generation";
import type { FieldType } from "@/types/ai.types";
import { usePreviewModal } from "@/contexts/preview-modal-context";

export default function BotConfigForm() {
  const { configs, setConfigs } = useBotConfigs();
  const { updateBotConfig } = useConfigActions();
  const { setIsAiSheetOpen } = usePreviewModal();
  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sync sheet state with context to hide chatbot
  useEffect(() => {
    setIsAiSheetOpen(sheetOpen);
  }, [sheetOpen, setIsAiSheetOpen]);

  // user's saved configs
  const fetchedConfigs = configs as BotConfigType;
  // initialize the form and the validator
  const form = useForm<BotConfigType>({
    resolver: zodResolver(botConfigSchema) as Resolver<BotConfigType>,
    defaultValues: fetchedConfigs ?? {},
  });

  const handleGenerateClick = (field: FieldType) => {
    setActiveField(field);
    setSheetOpen(true);
  };

  const handleApply = (field: string, value: string | string[]) => {
    form.setValue(field as keyof BotConfigType, value as string, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // reset the form on changes and set the latest values and also reset isDirty to latest test
  useEffect(() => {
    if (configs) form.reset(configs);
  }, [configs, form]);

  // Watch all form values for change detection
  const currentValues = useWatch({ control: form.control });

  // Check for actual content changes (ignoring whitespace-only changes)
  const hasActualChanges = useMemo(() => {
    if (!configs || !currentValues) return false;
    return hasActualFormChanges(configs, currentValues as BotConfigType);
  }, [configs, currentValues]);

  // form states isDirty -> checks the existing config with current and isSubmitting -> persisting loader
  const { isDirty, isSubmitting } = form.formState;

  // Use actual changes instead of isDirty for save bubble
  const shouldShowSave = hasActualChanges;

  // warn user if there is any changes and he is closing the site
  useEffect(() => {
    const warnUser = (e: BeforeUnloadEvent) => {
      if (hasActualChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warnUser);
    return () => window.removeEventListener("beforeunload", warnUser);
  }, [hasActualChanges]);

  // hook
  const [isPendingUpdate, startTransition] = useTransition();

  // get teh bot for the bot_id property
  const { bot } = useBotData();

  // if no bot id throw err
  if (!bot.bot_id) {
    toast.error("Bot not found");
    return null;
    // throw new Error("Bot does not exists.");
  }

  // submit function
  function onSubmit(values: BotConfigType) {
    // console.log(values);
    startTransition(async () => {
      // db call to update the configs
      const result = await updateBotConfig(bot.bot_id!, values);

      if (!result.ok) {
        const isAuthError =
          result.message?.toLowerCase().includes("authentication") ||
          result.message?.toLowerCase().includes("user authentication");
        toast.error(result.message, {
          duration: isAuthError ? 8000 : 5000,
        });
      } else {
        const updated = result.data!;

        // update the global store
        setConfigs(updated);

        toast.success(fetchedConfigs ? "Config updated!" : "Config saved!");
      }
    });
  }
  // console.log(form.formState.errors);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold text-primary">Bot Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Configure your AI bot&apos;s core identity, personality, and
            design-time settings.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            {/* Personality & Character */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Personality & Character
                </h2>
                <p className="text-sm text-muted-foreground">
                  Shape your bot&apos;s personality and core characteristics.
                </p>
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="persona"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-foreground">
                          Persona *
                        </FormLabel>
                        <GenerateButton
                          onClick={() => handleGenerateClick("persona")}
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your bot's personality and character traits..."
                          className="min-h-[100px] bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="botthesis"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-foreground">
                          Bot Mission & Thesis *
                        </FormLabel>
                        <GenerateButton
                          onClick={() => handleGenerateClick("botthesis")}
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="What's your bot's purpose, goal, or philosophy?"
                          className="min-h-[100px] bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Communication Settings */}
            <div className="space-y-6 pt-6 border-t border-border">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Communication Settings
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure communication preferences and response behavior.
                </p>
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="greetings"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-foreground">
                          Greetings
                        </FormLabel>
                        <GenerateButton
                          onClick={() => handleGenerateClick("greetings")}
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Define how your bot greets users (optional)"
                          className="min-h-[80px] bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fallback_message"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-foreground">
                          Fallback Message
                        </FormLabel>
                        <GenerateButton
                          onClick={() =>
                            handleGenerateClick("fallback_message")
                          }
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Message to display when bot cannot respond (optional)"
                          className="min-h-[80px] bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* <div className="flex justify-end pt-8 border-t border-border">
              <Button
                type="submit"
                size="lg"
                className="px-8 h-10 font-medium"
                disabled={isPending || !isDirty || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Configuration"}
              </Button>
            </div> */}
          </form>
        </Form>
      </div>
      <SaveTriggerUI
        isDirty={shouldShowSave}
        isSubmitting={isSubmitting}
        isPendingUpdate={isPendingUpdate}
        onSave={() => form.handleSubmit(onSubmit)()}
        onCancel={() => {
          // Reset form to original values to discard changes
          if (configs) {
            form.reset(configs);
          }
        }}
        phrase="Configuration Settings"
      />

      {activeField && (
        <GenerateFieldSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          field={activeField}
          botId={bot.bot_id!}
          currentValue={
            form.getValues(activeField as keyof BotConfigType) as string
          }
          onApply={(value) => handleApply(activeField, value)}
        />
      )}
    </div>
  );
}
