import BotRun from "@/features/runtime/runtimeForm";

// This page loads user-specific bot runtime settings data, so it must be dynamic
export const dynamic = "force-dynamic";

export default async function Settings() {
  return (
    <>
      <BotRun />
    </>
  );
}
