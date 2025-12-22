"use client";

import { useState } from "react";
import SwipeCard from "./SwipeCard";

export default function SwipeDeck({ profiles }) {
    const [index, setIndex] = useState(0);

    const handleSwipe = (direction, profile) => {
        console.log(direction, profile);
        setIndex((prev) => prev + 1);
    };

    return (
        <div className="relative w-full max-w-sm h-[70vh] mx-auto">
            {profiles
                .slice(index, index + 2)
                .reverse()
                .map((profile) => (
                    <SwipeCard
                        key={profile.id}
                        profile={profile}
                        onSwipe={handleSwipe}
                    />
                ))}
        </div>
    );
}
