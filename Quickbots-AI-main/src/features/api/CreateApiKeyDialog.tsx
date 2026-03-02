"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { useBotApi, useBotData } from "@/components/bot-context";
import { useApiKeyActions } from "@/lib/hooks/use-api-key";
import { apiKeySchema } from "@/schema";
import type { ApiKeyFormType, ApiKeyRow } from "@/types";
import { TokenRevealDialog } from "./TokenRevealDialog";

const permissions = [
  {
    id: "prod",
    label: "Production",
  },
  {
    id: "dev",
    label: "Development",
  },
];

export default function CreateApiKeyDialog() {
  const { bot } = useBotData();
  if (!bot.bot_id) throw new Error("Bot does not exist");

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showToken, setShowToken] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);

  const { api: apiKeys, setApi } = useBotApi();
  const { createApiKey } = useApiKeyActions();

  const form = useForm<ApiKeyFormType>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "", permissions: ["dev"] },
  });
  const { isDirty, isSubmitting } = form.formState;

  function onSubmit(values: ApiKeyFormType) {
    startTransition(async () => {
      if (apiKeys.some((k) => k.name === values.name)) {
        toast.warning("A key with that name already exists.");
        return;
      }

      const result = await createApiKey(
        bot.bot_id!,
        values.name,
        values.permissions
      );

      if (!result.ok) {
        const isAuthError =
          result.message?.toLowerCase().includes("authentication") ||
          result.message?.toLowerCase().includes("user authentication");
        toast.error(result.message, {
          duration: isAuthError ? 8000 : 5000,
        });
        return;
      }

      // Extract raw_token from response (shown once, never stored)
      const rawToken = result.data?.raw_token;
      if (rawToken && result.data) {
        setLastToken(rawToken); // show it once

        setShowToken(true);
        const newKey: ApiKeyRow = {
          id: result.data.id,
          bot_id: result.data.bot_id,
          name: result.data.name,
          permissions: result.data.permissions,
          created_at: result.data.created_at,
          api_id: result.data.api_id,
          token_hash: "<hidden>",
          user_id: result.data.user_id,
        };

        setApi((prev) => [...prev, newKey]);
      }

      form.reset({ name: "", permissions: ["dev"] }); // clear input for next time
      setOpen(false);

      toast.success("API key created successfully");
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2" disabled={apiKeys.length >= 3}>
            <Plus className="h-4 w-4" />
            Create API Key
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-popover border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Create New API Key
            </DialogTitle>
            <DialogDescription>
              Enter a label to identify this key.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="keyName">API Key Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        id="keyName"
                        placeholder="e.g. staging key, testing key etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Environment Instance
                      </FormLabel>
                      <FormDescription>
                        Select the environment this API key will have access to.
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      {permissions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-center gap-2"
                              >
                                <FormControl>
                                  <input
                                    type="radio"
                                    className="form-radio"
                                    checked={field.value?.[0] === item.id}
                                    onChange={() => field.onChange([item.id])}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty || isPending}
                >
                  {isSubmitting || isPending ? <Spinner /> : "Create API Key"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <TokenRevealDialog
        token={lastToken || ""}
        open={showToken}
        onClose={() => setShowToken(false)}
      />
    </>
  );
}
