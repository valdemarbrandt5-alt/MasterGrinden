import { supabase } from "@/lib/supabase";

export async function acquireRefreshLock() {
  const { data, error } = await supabase.rpc("try_acquire_refresh_lock");

  if (error) {
    console.log("LOCK ERROR:", error.message);
    return false;
  }

  return data === true;
}

export async function releaseRefreshLock() {
  const { error } = await supabase.rpc("release_refresh_lock");

  if (error) {
    console.log("UNLOCK ERROR:", error.message);
  }
}