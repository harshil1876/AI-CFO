"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { GenerateButton, GenerateFieldSheet } from "@/features/ai-generation";
import type { FieldType } from "@/types/ai.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SaveTriggerUI from "@/components/SaveTriggerUI";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  useBotConfigs,
  useBotData,
  useBotSettings,
} from "@/components/bot-context";
import { usePreviewActions } from "@/lib/hooks/use-bot-preview";
import { useSupabase } from "@/providers/SupabaseProvider";
import { previewSchema } from "@/schema";
import type { PreviewType } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PreviewLayoutFormProps {
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function PreviewLayoutForm({
  onDirtyChange,
}: PreviewLayoutFormProps = {}) {
  const { bot } = useBotData();
  const { configs } = useBotConfigs();
  const { settings } = useBotSettings();
  const { isReady: isLoaded } = useSupabase();
  const { getPreview, updatePreview } = usePreviewActions();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleGenerateClick = (field: FieldType) => {
    setActiveField(field);
    setSheetOpen(true);
  };

  const handleApply = (field: string, value: string | string[]) => {
    if (field === "quick_questions") {
      // Handle array field
      (value as string[]).forEach((q, index) => {
        form.setValue(
          `quickQuestions.${index}` as keyof PreviewType,
          q as PreviewType[keyof PreviewType],
          {
            shouldDirty: true,
            shouldValidate: true,
          }
        );
      });
    } else {
      form.setValue(
        field as keyof PreviewType,
        value as PreviewType[keyof PreviewType],
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
    }
  };

  // Refs for update tracking
  const lastLocalUpdateTimeRef = useRef<number | null>(null);
  const dbUpdatedAtRef = useRef(0);

  const form = useForm<PreviewType>({
    defaultValues: {
      chatbotName: "QuickBot Assistant",
      welcomeMessage: "Hi! How can I assist you today?",
      quickQuestions: ["", "", "", "", ""],
      supportInfo: null,
      position: "bottom-right",
      autoOpenDelayMs: 0,
      autoGreetOnOpen: true,
      askEmailBeforeChat: false,
      persistChat: true,
      showTimestamps: true,
    },
    resolver: zodResolver(previewSchema),
    mode: "onBlur",
    shouldFocusError: false,
  });

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Polling status for chatbot
  const [lastPollTime, setLastPollTime] = useState<number | null>(null);
  const [nextPollIn, setNextPollIn] = useState<number>(30);
  const [pollCount, setPollCount] = useState(0);
  const [lastUpdateHadChanges, setLastUpdateHadChanges] = useState(false);

  const handleUpdate = async (formData: PreviewType) => {
    startTransition(async () => {
      setErrorMessage(null);

      const result = await updatePreview(bot.bot_id!, formData);

      if (result.ok) {
        toast.success("Preview settings saved!");

        if (result.data) {
          const dbTime = result.data.updatedAt
            ? new Date(result.data.updatedAt).getTime()
            : Date.now();
          dbUpdatedAtRef.current = dbTime;
          lastLocalUpdateTimeRef.current = dbTime; // Store the timestamp we expect

          const paddedQuickQuestions = [
            ...(result.data.quickQuestions || []),
            ...Array(5 - (result.data.quickQuestions?.length || 0)).fill(""),
          ].slice(0, 5);

          form.reset({
            ...result.data,
            quickQuestions: paddedQuickQuestions,
          });

          // Clear the local update flag after 2 seconds
          setTimeout(() => {
            lastLocalUpdateTimeRef.current = null;
          }, 2000);
        }
      } else {
        const message = result.message || "Failed to save settings";
        setErrorMessage(message);
        const isAuthError =
          message.toLowerCase().includes("authentication") ||
          message.toLowerCase().includes("user authentication");
        toast.error(message, {
          duration: isAuthError ? 8000 : 5000,
        });
        lastLocalUpdateTimeRef.current = null;
      }
    });
  };

  const onSubmit = form.handleSubmit((data) => {
    const dataWithGreeting = {
      ...data,
      autoGreetOnOpen: true,
    };

    handleUpdate(dataWithGreeting);
  });

  const { isDirty, isSubmitting } = form.formState;

  // Notify parent about dirty state changes
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Load initial data on mount
  useEffect(() => {
    if (!bot.bot_id) {
      setIsLoadingData(false);
      return;
    }

    if (!isLoaded) {
      return;
    }

    let isMounted = true;

    (async () => {
      setIsLoadingData(true);
      try {
        const res = await getPreview(bot.bot_id!);

        if (!isMounted) return;

        if (res.ok && res.data) {
          const data = res.data;

          const dbTime = data.updatedAt
            ? new Date(data.updatedAt).getTime()
            : Date.now();
          dbUpdatedAtRef.current = dbTime;

          const paddedQuickQuestions = [
            ...(data.quickQuestions || []),
            ...Array(5 - (data.quickQuestions?.length || 0)).fill(""),
          ].slice(0, 5);

          // Inherit values from config/settings if not set in UI settings
          const formData = {
            ...data,
            chatbotName:
              data.chatbotName ||
              settings?.product_name ||
              "QuickBot Assistant",
            welcomeMessage:
              data.welcomeMessage ||
              configs?.greetings ||
              "Hi! How can I assist you today?",
            supportInfo: data.supportInfo || settings?.support_email || null,
            quickQuestions: paddedQuickQuestions,
            autoGreetOnOpen: true, // Always enabled, user cannot disable
          };

          form.reset(formData);
        } else if (!res.ok) {
          const message = res.message || "Failed to load preview settings";
          const isAuthError =
            message.toLowerCase().includes("authentication") ||
            message.toLowerCase().includes("user authentication");
          toast.error(message, {
            duration: isAuthError ? 8000 : 5000,
          });
        }
      } catch (error) {
        console.error("Error loading preview:", error);
        if (isMounted) {
          toast.error("Failed to load preview settings");
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot.bot_id, isLoaded]);

  // Watch for changes in configs/settings and update form if UI settings don't have values
  useEffect(() => {
    if (!configs || !settings) return;

    const currentValues = form.getValues();

    // Update chatbot_name if it's empty or default and product_name is available
    if (
      (!currentValues.chatbotName ||
        currentValues.chatbotName === "QuickBot Assistant") &&
      settings.product_name
    ) {
      form.setValue("chatbotName", settings.product_name, {
        shouldDirty: false,
      });
    }

    // Update welcome_message if it's empty or default and greetings is available
    if (
      (!currentValues.welcomeMessage ||
        currentValues.welcomeMessage === "Hi! How can I assist you today?") &&
      configs.greetings
    ) {
      form.setValue("welcomeMessage", configs.greetings, {
        shouldDirty: false,
      });
    }

    // Update support_info if it's empty and support_email is available
    if (!currentValues.supportInfo && settings.support_email) {
      form.setValue("supportInfo", settings.support_email, {
        shouldDirty: false,
      });
    }
  }, [configs, settings, form]);

  // Listen to chatbot polling events
  useEffect(() => {
    if (!bot.bot_id) return;

    const handlePoll = (event: CustomEvent) => {
      const detail = event.detail as { botId: string; timestamp: number };
      if (detail.botId === bot.bot_id) {
        setLastPollTime(detail.timestamp);
        setPollCount((prev) => prev + 1);
        setNextPollIn(30); // Reset countdown
      }
    };

    const handleUpdate = (event: CustomEvent) => {
      const detail = event.detail as {
        botId: string;
        timestamp: number;
        hasChanges: boolean;
      };
      if (detail.botId === bot.bot_id) {
        // Use setTimeout to avoid updating state during render
        setTimeout(() => {
          setLastUpdateHadChanges(detail.hasChanges);
        }, 0);
      }
    };

    window.addEventListener("quickbot-poll", handlePoll as EventListener);
    window.addEventListener("quickbot-update", handleUpdate as EventListener);

    return () => {
      window.removeEventListener("quickbot-poll", handlePoll as EventListener);
      window.removeEventListener(
        "quickbot-update",
        handleUpdate as EventListener
      );
    };
  }, [bot.bot_id]);

  // Countdown timer for next poll
  useEffect(() => {
    if (lastPollTime === null) {
      setNextPollIn(30);
      return;
    }

    // Update immediately
    const updateCountdown = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastPollTime) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setNextPollIn(remaining);

      // If we've reached 0, the next poll should happen soon
      if (remaining === 0) {
        // Keep it at 0 until the next poll event comes
        return;
      }
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const interval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPollTime]);

  return (
    <Card className="border-none shadow-none p-4 w-full h-full flex flex-col overflow-hidden">
      <VisuallyHidden>
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold">
            Preview Editor
          </CardTitle>
          <p className="text-muted-foreground">
            Customize your chatbot preview settings
          </p>
        </CardHeader>
      </VisuallyHidden>

      <CardContent className="flex flex-col p-0 gap-0 flex-1 min-h-0 overflow-hidden">
        <div className="w-full flex flex-col relative flex-1 min-h-0 overflow-hidden">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 relative flex-1 min-h-0 w-full">
              {/* Preview Coming Soon Message */}
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-semibold text-primary">
                    Live preview of your bot will be available soon.
                  </span>
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Section: Bot Identity */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Bot Identity
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Name and welcome message
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="chatbotName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-medium text-foreground">
                            Chatbot Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Support Bot"
                              className="h-9 text-sm bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="welcomeMessage"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-medium text-foreground">
                            Welcome Message
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Hi! How can I assist you today?"
                              className="min-h-[60px] text-sm bg-muted border-border cursor-not-allowed resize-none"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <InfoIcon className="h-3 w-3" />
                            Go to{" "}
                            <span className="font-medium text-foreground">
                              Configuration → Greetings
                            </span>{" "}
                            to modify the welcome message
                          </p>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Section: Quick Questions */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Quick Questions
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Up to 5 quick question buttons
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="quickQuestions"
                      render={() => (
                        <FormItem className="space-y-2">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-medium text-foreground">
                              Quick Questions (up to 5)
                            </FormLabel>
                            <GenerateButton
                              onClick={() =>
                                handleGenerateClick("quick_questions")
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            {[0, 1, 2, 3, 4].map((index) => (
                              <FormField
                                key={index}
                                control={form.control}
                                name={`quickQuestions.${index}`}
                                render={({ field }) => (
                                  <FormControl>
                                    <Input
                                      placeholder={`Q${index + 1} (optional)`}
                                      className="h-8 text-xs bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                      {...field}
                                    />
                                  </FormControl>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Section: Support */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Support
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Contact information
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="supportInfo"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-medium text-foreground">
                            Support Info
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="support@example.com"
                              className="h-9 text-sm bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Section: Widget Behavior */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Widget Behavior
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Position and auto-open settings
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-medium text-foreground">
                            Position
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-9 text-sm bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bottom-right">
                                  Bottom Right
                                </SelectItem>
                                <SelectItem value="bottom-left">
                                  Bottom Left
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoOpenDelayMs"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-xs font-medium text-foreground">
                            Auto Open Delay (ms)
                          </FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupInput
                                // className="h-9 text-sm bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                className="pl-1!"
                                type="number"
                                min="0"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                              <InputGroupAddon>
                                <InputGroupText>2500 + </InputGroupText>
                              </InputGroupAddon>
                              <InputGroupAddon align="inline-end">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InputGroupButton
                                      className="rounded-full"
                                      size="icon-xs"
                                    >
                                      <InfoIcon />
                                    </InputGroupButton>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Your delay is added on top of a base
                                    animation timing (2500ms).
                                  </TooltipContent>
                                </Tooltip>
                              </InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoGreetOnOpen"
                      render={({}) => (
                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                          <div className="space-y-0.5 flex-1">
                            <FormLabel className="text-xs font-medium text-foreground">
                              Auto Greet On Open
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Always enabled - Shows welcome message when widget
                              opens
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={true}
                              onCheckedChange={() => {}}
                              disabled={true}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Section: Chat Settings */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Chat Settings
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Chat behavior and persistence
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="askEmailBeforeChat"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs font-medium text-foreground">
                              Ask Email Before Chat
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Request user email before starting conversation
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showTimestamps"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs font-medium text-foreground">
                              Show Timestamps
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Display message timestamps
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="persistChat"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs font-medium text-foreground">
                              Persist Chat
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Save chat history across sessions
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      <AlertTriangleIcon className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-xs text-destructive">{errorMessage}</p>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          )}
        </div>
      </CardContent>

      {!isLoadingData && (
        <SaveTriggerUI
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          isPendingUpdate={isPending}
          onSave={onSubmit}
          onCancel={async () => {
            // Reset form to last loaded preview data
            const res = await getPreview(bot.bot_id!);
            if (res.ok && res.data) {
              const paddedQuickQuestions = [
                ...(res.data.quickQuestions || []),
                ...Array(5 - (res.data.quickQuestions?.length || 0)).fill(""),
              ].slice(0, 5) as [string, string, string, string, string];
              form.reset({
                ...res.data,
                quickQuestions: paddedQuickQuestions,
              });
            }
          }}
          phrase="Preview Settings"
        />
      )}

      {activeField && (
        <GenerateFieldSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          field={activeField}
          botId={bot.bot_id!}
          currentValue={
            activeField === "quick_questions"
              ? form.getValues("quickQuestions")?.join("\n")
              : (form.getValues(
                  activeField === "welcome_message"
                    ? "welcomeMessage"
                    : (activeField as keyof PreviewType)
                ) as string)
          }
          onApply={(value) => handleApply(activeField, value)}
        />
      )}
    </Card>
  );
}
