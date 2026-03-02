"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useBotActions } from "@/lib/hooks/use-bot";
import { botSchema } from "@/schema";
import type { BotFormInputType, BotType } from "@/types";
import type { Result } from "@/types/result";

export default function BotForm() {
  const router = useRouter();
  const { addBot } = useBotActions();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BotFormInputType>({
    defaultValues: { name: "", description: "" },
    resolver: zodResolver(botSchema),
    mode: "onChange",
    shouldFocusError: false,
  });

  const [state, setState] = useState<Result<BotType>>({
    ok: true,
    data: { name: "", description: "" },
  });
  const [isPending, setIsPending] = useState(false);

  const onSubmit = handleSubmit(async (formData: BotFormInputType) => {
    setIsPending(true);
    const result = await addBot(formData.name, formData.description);
    setState(result);

    if (result.ok && result.data?.bot_id) {
      const botId = result.data.bot_id;
      reset();
      // Use router.push with startTransition for navigation
      startTransition(() => {
        router.push(`/bots/${botId}/configure`);
      });
      return;
    }
    setIsPending(false);
  });

  const isLoading = isSubmitting || isPending;
  return (
    <div className="flex justify-center items-center p-3 sm:p-4 w-full min-w-0 overflow-x-hidden">
      <Card className="border-none shadow-none p-0 w-full max-w-4xl min-w-0">
        <CardHeader className="text-center pb-4 sm:pb-6 px-3 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-semibold">
            Create New Quickbot Project
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">
            Enter the project name and its description.
          </p>
        </CardHeader>

        <CardContent className="px-3 sm:px-6">
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6 w-full min-w-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  {...register("name")}
                  id="name"
                  placeholder="name..."
                  className="h-10"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="text-destructive dark:text-yellow-200 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Project Description and purpose
                </Label>
                <Input
                  {...register("description")}
                  placeholder="description..."
                  id="description"
                  className="h-10"
                  autoComplete="off"
                />
                {errors.description && (
                  <p className="text-destructive dark:text-yellow-200 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {!state.ok && state.message && (
              <p className="dark:text-yellow-200 text-destructive flex justify-center items-center gap-2  text-sm text-center bg-destructive/10 p-3 rounded-md">
                <AlertTriangleIcon className="h-4 w-4" />
                {state.message}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Spinner /> : "Create"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => router.back()}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
