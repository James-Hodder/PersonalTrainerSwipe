import { supabase } from "./supabaseClient";

export async function requireAuth() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
}
