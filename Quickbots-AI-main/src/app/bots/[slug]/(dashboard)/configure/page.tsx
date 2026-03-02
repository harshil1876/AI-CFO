import BotConfigsForm from "@/features/config/configForm";

// This page loads user-specific bot configuration data, so it must be dynamic
export const dynamic = "force-dynamic";

export default async function Configure() {
  return (
    <>
      <BotConfigsForm />
    </>
  );
}
