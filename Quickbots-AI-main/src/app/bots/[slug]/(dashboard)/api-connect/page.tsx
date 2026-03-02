import ApiConfig from "@/features/api/apiForm";

// This page loads user-specific bot API data, so it must be dynamic
export const dynamic = "force-dynamic";

export default async function API() {
  return (
    <>
      <ApiConfig />
    </>
  );
}
