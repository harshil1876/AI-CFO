import DangerSectionPage from "@/features/delete/DeletePage";

// This page loads user-specific bot data for deletion, so it must be dynamic
export const dynamic = "force-dynamic";

export default function Danger() {
  return <DangerSectionPage />;
}
