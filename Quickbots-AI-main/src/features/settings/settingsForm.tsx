"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { hasActualFormChanges } from "@/lib/utils/form-change-detector";

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
import { Textarea } from "@/components/ui/textarea";
import SaveTriggerUI from "@/components/SaveTriggerUI";
import { useBotData, useBotSettings } from "@/components/bot-context";
import { useSettingsActions } from "@/lib/hooks/use-bot-settings";
import { botSettingsSchema } from "@/schema";
import type { BotSettingsType } from "@/types";
import { GenerateButton, GenerateFieldSheet } from "@/features/ai-generation";
import type { FieldType } from "@/types/ai.types";
import { usePreviewModal } from "@/contexts/preview-modal-context";

export default function BotSettingsForm() {
  const { settings, setSettings } = useBotSettings();
  const { updateBotSettings } = useSettingsActions();
  const { setIsAiSheetOpen } = usePreviewModal();
  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sync sheet state with context to hide chatbot
  useEffect(() => {
    setIsAiSheetOpen(sheetOpen);
  }, [sheetOpen, setIsAiSheetOpen]);

  // user's saved settings
  const fetchedSettings = settings as BotSettingsType;

  // initialize the form and the validator
  const form = useForm<BotSettingsType>({
    resolver: zodResolver(botSettingsSchema) as Resolver<BotSettingsType>,
    defaultValues: {
      ...fetchedSettings,
      supported_languages: ["en"], // Always default to English
    },
  });

  const handleGenerateClick = (field: FieldType) => {
    setActiveField(field);
    setSheetOpen(true);
  };

  const handleApply = (field: string, value: string | string[]) => {
    form.setValue(field as keyof BotSettingsType, value as string, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // reset the form on changes and set the latest values and also reset isDirty to latest test
  useEffect(() => {
    if (settings) {
      form.reset({
        ...settings,
        supported_languages: ["en"], // Always set to English
      });
    }
  }, [settings, form]);

  // Watch all form values for change detection
  const currentValues = useWatch({ control: form.control });

  // Check for actual content changes (ignoring whitespace-only changes)
  const hasActualChanges = useMemo(() => {
    if (!settings || !currentValues) return false;
    // Normalize settings to include supported_languages default
    const normalizedSettings = {
      ...settings,
      supported_languages: settings.supported_languages || ["en"],
    };
    return hasActualFormChanges(
      normalizedSettings,
      currentValues as BotSettingsType
    );
  }, [settings, currentValues]);

  // form states isDirty -> checks the existing settings with current and isSubmitting -> persisting loader
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
  const [isPendingUpdate, startUpdateTransition] = useTransition();

  // get the bot for the bot_id property
  const { bot } = useBotData();

  // if no bot id throw err
  if (!bot.bot_id) {
    throw new Error("Bot does not exists.");
  }

  // submit function
  function onSubmit(values: BotSettingsType) {
    startUpdateTransition(async () => {
      // Ensure supported_languages is always set to English
      const updatedValues: BotSettingsType = {
        ...values,
        supported_languages: ["en"] as [string, ...string[]],
      };

      // db call to update the settings
      const result = await updateBotSettings(bot.bot_id!, updatedValues);

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
        setSettings(updated);

        toast.success(
          fetchedSettings ? "Settings updated!" : "Settings saved!"
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Runtime Bot Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure your bot&apos;s business information, product details, and
            operational settings.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            {/* Business Information Section */}
            <div className="space-y-6 pb-8 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Business Information
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Business Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your company name"
                          className="h-10 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        The name of your business.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_type"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Business Type *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., SaaS, E-commerce, Agency"
                          className="h-10 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Category or type of your business.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="business_description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Business Description
                      </FormLabel>
                      <GenerateButton
                        onClick={() =>
                          handleGenerateClick("business_description")
                        }
                      />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your business and what it does..."
                        className="min-h-[100px] bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                        {...field}
                        value={field.value ?? ""}
                        onBlur={(e) => {
                          // Only trim on blur to clean up trailing whitespace
                          const trimmed = e.target.value.trim();
                          if (trimmed !== e.target.value) {
                            field.onChange(trimmed);
                          }
                          field.onBlur();
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      A brief overview of your business operations and services.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Information Section */}
            <div className="space-y-6 pb-8 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Product Information
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Product Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your product name"
                          className="h-10 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        The name of your main product or service.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="product_description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Product Description
                      </FormLabel>
                      <GenerateButton
                        onClick={() =>
                          handleGenerateClick("product_description")
                        }
                      />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product features and benefits..."
                        className="min-h-[100px] bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                        {...field}
                        value={field.value ?? ""}
                        onBlur={(e) => {
                          // Only trim on blur to clean up trailing whitespace
                          const trimmed = e.target.value.trim();
                          if (trimmed !== e.target.value) {
                            field.onChange(trimmed);
                          }
                          field.onBlur();
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Detailed description of your product and its capabilities.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact & Configuration Section */}
            <div className="space-y-6 pb-8 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Contact & Configuration
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="support_email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Support Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="support@example.com"
                          className="h-10 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Email address for customer support inquiries.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contacts"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Contacts
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact information (phone, address, etc.)"
                          className="h-10 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Additional contact details.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supported_languages"
                render={() => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground">
                      Supported Languages
                    </FormLabel>
                    <FormControl>
                      <Input
                        value="English"
                        disabled
                        className="h-10 bg-muted border-border cursor-not-allowed"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Currently only English is supported. Additional languages
                      coming soon.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            {/* <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                className="px-8 h-10 font-medium"
                disabled={isSubmitting || isPendingUpdate || !isDirty}
              >
                {isSubmitting ? "Saving..." : "Save Settings"}
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
          if (settings) {
            form.reset({
              ...settings,
              supported_languages: ["en"],
            });
          }
        }}
        phrase="Runtime Settings"
      />

      {activeField && (
        <GenerateFieldSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          field={activeField}
          botId={bot.bot_id!}
          currentValue={
            form.getValues(activeField as keyof BotSettingsType) as string
          }
          onApply={(value) => handleApply(activeField, value)}
        />
      )}
    </div>
  );
}
