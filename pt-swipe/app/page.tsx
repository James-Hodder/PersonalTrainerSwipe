"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        async function check() {
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

            if (!profile) {
                router.push("/create-profile");
            }
        }

        check();
    }, [router]);

    return (
        <main className="p-4">
            {/* Swipe cards component goes here */}
            <p>Loading...</p>
        </main>
    );
}
