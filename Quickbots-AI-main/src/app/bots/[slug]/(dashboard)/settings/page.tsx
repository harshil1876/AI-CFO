import BotSettingsForm from "@/features/settings/settingsForm";

// This page loads user-specific bot settings data, so it must be dynamic
export const dynamic = "force-dynamic";

export default async function Settings() {
  return (
    <>
      <BotSettingsForm />
    </>
  );
}
