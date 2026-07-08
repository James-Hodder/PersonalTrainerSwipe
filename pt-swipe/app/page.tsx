"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getLocalProfile } from "@/lib/localProfile";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        async function check() {
            if (!isSupabaseConfigured) {
                const profile = getLocalProfile();
                router.push(profile ? "/swipe" : "/create-profile");
                return;
            }

            const { data } = await supabase.auth.getSession();

            if (!data.session) {
                router.push("/auth");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", data.session.user.id)
                .single();

            router.push(profile ? "/swipe" : "/create-profile");
        }

        check();
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <p>Loading...</p>
        </main>
    );
}
