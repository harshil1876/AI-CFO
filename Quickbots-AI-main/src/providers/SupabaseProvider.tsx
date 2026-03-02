"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import { useSession } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface SupabaseCtx {
  supabase: SupabaseClient | null;
  isReady: boolean;
}

const SupabaseContext = createContext<SupabaseCtx>({
  supabase: null,
  isReady: false,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoaded } = useSession();

  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  const client = useMemo(() => {
    if (!isLoaded) return null;

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        accessToken: async () => session?.getToken() ?? null,
      }
    );
  }, [session, isLoaded]);

  useEffect(() => {
    if (!client) return;

    startTransition(() => {
      setSupabase(client);
      setIsReady(true);
    });
  }, [client]);

  return (
    <SupabaseContext.Provider value={{ supabase, isReady }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
