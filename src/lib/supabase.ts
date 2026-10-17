import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface BookingRow {
  id: string;
  start_date: string;
  end_date: string;
  guest_name: string;
  email: string;
  phone: string;
  nights: number;
  total_cents: number;
  deposit_cents: number;
  status: BookingStatus;
  stripe_session_id: string | null;
  locale: string;
  created_at: string;
}

export interface BlockedDateRow {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Client serveur avec la clé service_role : ne jamais l'importer dans un composant client. */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase non configuré : définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
