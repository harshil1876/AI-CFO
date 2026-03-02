import { redirect } from "next/navigation";

// This page redirects based on dynamic params, so it must be dynamic
export const dynamic = "force-dynamic";

export default async function BotRoot({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/bots/${slug}/configure`);
}
