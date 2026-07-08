"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) router.push("/swipe");
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) router.push("/swipe");
        });

        return () => listener.subscription.unsubscribe();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-2">
                    PT Swipe
                </h1>

                <p className="text-center text-gray-600 mb-6">
                    Log in or create an account
                </p>

                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: "#000000",
                                    brandAccent: "#111111",
                                },
                            },
                        },
                    }}
                    providers={[]}     // no OAuth yet
                    magicLink={false}  // ❌ disable magic link
                />
            </div>
        </div>
    );
}
