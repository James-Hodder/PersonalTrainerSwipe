"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
    subscribe,
    getMatchesSnapshot,
    getServerSnapshotMatches,
    getTrainerById,
} from "@/lib/matches";

export default function MatchesPage() {
    const matches = useSyncExternalStore(
        subscribe,
        getMatchesSnapshot,
        getServerSnapshotMatches
    );

    return (
        <div className="min-h-screen px-4 py-6 max-w-sm mx-auto">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Your Matches</h1>
                <Link href="/swipe" className="text-sm text-green-400 font-semibold">
                    ← Swipe
                </Link>
            </header>

            {matches.length === 0 ? (
                <div className="bg-white text-gray-700 rounded-2xl p-6 text-center shadow-xl">
                    <p className="text-lg font-bold mb-1 text-black">No matches yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Swipe right on trainers you vibe with to start chatting.
                    </p>
                    <Link
                        href="/swipe"
                        className="inline-block bg-green-500 text-black px-4 py-2 rounded-full font-bold"
                    >
                        Start swiping
                    </Link>
                </div>
            ) : (
                <ul className="space-y-3">
                    {matches.map((m) => {
                        const trainer = getTrainerById(m.trainerId);
                        if (!trainer) return null;

                        return (
                            <li key={m.trainerId}>
                                <Link
                                    href={`/chat/${m.trainerId}`}
                                    className="flex items-center gap-4 bg-white text-black rounded-2xl p-3 shadow-lg"
                                >
                                    <img
                                        src={trainer.photos[0]}
                                        alt={trainer.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-green-400"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold">
                                            {trainer.name}, {trainer.age}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {m.matchScore}% match • {trainer.specialties.join(", ")}
                                        </p>
                                    </div>
                                    <span className="text-xl">💬</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
