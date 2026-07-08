"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SwipeDeck from "@/app/components/Swipedeck";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getLocalProfile } from "@/lib/localProfile";
import { mockTrainers, computeMatch } from "@/lib/trainers";

export default function SwipePage() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            if (!isSupabaseConfigured) {
                const local = getLocalProfile();
                if (!local) {
                    router.push("/create-profile");
                    return;
                }
                setProfile(local);
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/auth");
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("name, age, training_style, goal")
                .eq("id", session.user.id)
                .single();

            if (!data) {
                router.push("/create-profile");
                return;
            }

            setProfile({
                name: data.name,
                age: data.age,
                trainingStyle: data.training_style,
                goal: data.goal,
            });
            setLoading(false);
        }

        loadProfile();
    }, [router]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading trainers...</p>
            </div>
        );
    }

    const trainerProfiles = mockTrainers.map((trainer) => {
        const { score, isMatch } = computeMatch(profile, trainer);
        return { ...trainer, matchScore: score, isMatch };
    });

    return (
        <div className="min-h-screen flex flex-col items-center px-4 py-6">
            <header className="w-full max-w-sm flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Hey {profile.name} 👋</h1>
                <Link
                    href="/matches"
                    className="bg-green-500 text-black text-sm font-bold px-4 py-2 rounded-full"
                >
                    💬 Matches
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center w-full">
                <SwipeDeck profiles={trainerProfiles} currentUser={profile} />
            </div>
        </div>
    );
}
