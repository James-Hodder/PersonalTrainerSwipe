"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");

    async function signIn(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/`
            }
        });

        setStatus(
            error ? error.message : "Check your email for the magic link ✨"
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <form
                onSubmit={signIn}
                className="w-full max-w-sm bg-white text-gray-900 p-6 rounded-xl space-y-4 shadow-xl"
            >
                <h1 className="text-2xl font-bold text-center">Welcome</h1>

                <input
                    type="email"
                    required
                    placeholder="Email"
                    className="w-full p-3 rounded bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button className="w-full bg-green-500 text-black p-3 rounded font-bold">
                    Send Magic Link
                </button>

                {status && (
                    <p className="text-center text-sm text-gray-500">{status}</p>
                )}
            </form>
        </div>
    );
}
