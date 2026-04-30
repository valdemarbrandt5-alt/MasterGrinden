import { supabase } from "@/lib/supabase";

const LOCK_ID = "main";

export async function acquireRefreshLock() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("refresh_lock")
    .select("locked, locked_at")
    .eq("id", LOCK_ID)
    .maybeSingle();

  if (
    existing?.locked &&
    existing.locked_at &&
    existing.locked_at > fiveMinutesAgo
  ) {
    return false;
  }

  const { error } = await supabase.from("refresh_lock").upsert({
    id: LOCK_ID,
    locked: true,
    locked_at: new Date().toISOString(),
  });

  if (error) {
    console.log("LOCK ERROR:", error.message);
    return false;
  }

  return true;
}

export async function releaseRefreshLock() {
  const { error } = await supabase
    .from("refresh_lock")
    .update({
      locked: false,
      locked_at: null,
    })
    .eq("id", LOCK_ID);

  if (error) {
    console.log("UNLOCK ERROR:", error.message);
  }
}