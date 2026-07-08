"use client";

import { useState } from "react";
import SwipeCard from "./SwipeCard";
import MatchModal from "./MatchModal";
import { addMatch } from "@/lib/matches";

export default function SwipeDeck({ profiles }) {
    const [index, setIndex] = useState(0);
    const [matchedTrainer, setMatchedTrainer] = useState(null);

    const handleSwipe = (direction, trainer) => {
        if (direction === "like" && trainer.isMatch) {
            addMatch(trainer);
            setMatchedTrainer(trainer);
        }
        setIndex((prev) => prev + 1);
    };

    const remaining = profiles.slice(index);

    return (
        <div className="relative w-full max-w-sm h-[70vh] mx-auto">
            {remaining.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-xl p-6">
                    <p className="text-xl font-bold mb-2">No more trainers nearby</p>
                    <p className="text-gray-600 text-sm">
                        Check back later for new matches.
                    </p>
                </div>
            ) : (
                remaining
                    .slice(0, 2)
                    .reverse()
                    .map((profile) => (
                        <SwipeCard
                            key={profile.id}
                            profile={profile}
                            onSwipe={handleSwipe}
                            isTop={profile.id === remaining[0].id}
                        />
                    ))
            )}

            {matchedTrainer && (
                <MatchModal
                    trainer={matchedTrainer}
                    onClose={() => setMatchedTrainer(null)}
                />
            )}
        </div>
    );
}
