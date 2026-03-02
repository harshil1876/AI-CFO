import BotsList from "@/components/bots-list";

// This page loads user-specific bot data, so it must be dynamic
export const dynamic = "force-dynamic";

export default function BotManagementDashboard() {
  return <BotsList />;
}
