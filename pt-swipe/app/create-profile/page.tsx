"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CreateProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const age = formData.get("age") as string;
        const trainingStyle = formData.get("trainingStyle") as string;
        const goal = formData.get("goal") as string;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                router.push("/auth");
                return;
            }

            const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                    id: session.user.id,
                    name,
                    age: parseInt(age),
                    training_style: trainingStyle,
                    goal,
                });

            if (insertError) throw insertError;

            router.push("/swipe");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-zinc-900 p-6 rounded-xl space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Create Your Profile</h1>

                <div>
                    <label htmlFor="name" className="block text-sm mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full p-3 rounded bg-zinc-800"
                    />
                </div>

                <div>
                    <label htmlFor="age" className="block text-sm mb-1">
                        Age
                    </label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        required
                        min="18"
                        max="100"
                        className="w-full p-3 rounded bg-zinc-800"
                    />
                </div>

                <div>
                    <label htmlFor="trainingStyle" className="block text-sm mb-1">
                        Training Style
                    </label>
                    <select
                        id="trainingStyle"
                        name="trainingStyle"
                        required
                        className="w-full p-3 rounded bg-zinc-800"
                    >
                        <option value="">Select a style</option>
                        <option value="Strength">Strength</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Yoga">Yoga</option>
                        <option value="CrossFit">CrossFit</option>
                        <option value="Cardio">Cardio</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="goal" className="block text-sm mb-1">
                        Fitness Goal
                    </label>
                    <select
                        id="goal"
                        name="goal"
                        required
                        className="w-full p-3 rounded bg-zinc-800"
                    >
                        <option value="">Select a goal</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="Hypertrophy">Hypertrophy</option>
                        <option value="Fat Loss">Fat Loss</option>
                        <option value="General Fitness">General Fitness</option>
                    </select>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-black p-3 rounded font-bold disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Profile"}
                </button>
            </form>
        </div>
    );
}
