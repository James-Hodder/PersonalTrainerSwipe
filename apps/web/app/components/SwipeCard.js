"use client";

import { useRef, useState } from "react";

export default function SwipeCard({ profile, onSwipe, isTop }) {
    const cardRef = useRef(null);
    const startX = useRef(0);
    const dragging = useRef(false);
    const [dx, setDx] = useState(0);

    const threshold = 120;

    const handleStart = (e) => {
        if (!isTop) return;
        dragging.current = true;
        startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    };

    const handleMove = (e) => {
        if (!dragging.current) return;
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        setDx(currentX - startX.current);
    };

    const handleEnd = () => {
        if (!dragging.current) return;
        dragging.current = false;

        if (dx > threshold) onSwipe("like", profile);
        else if (dx < -threshold) onSwipe("pass", profile);

        setDx(0);
    };

    const swipe = (direction) => {
        if (!isTop) return;
        onSwipe(direction, profile);
    };

    return (
        <div
            ref={cardRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="absolute w-full h-full bg-white text-black rounded-2xl shadow-xl p-4 select-none flex flex-col"
            style={{
                transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`,
                transition: dx === 0 ? "transform 0.3s ease" : "none",
                zIndex: isTop ? 10 : 0,
            }}
        >
            {/* LIKE / PASS overlay */}
            {dx > 20 && (
                <div className="absolute top-6 left-6 text-green-500 font-bold text-2xl">
                    🔥 LIKE
                </div>
            )}
            {dx < -20 && (
                <div className="absolute top-6 right-6 text-red-500 font-bold text-2xl">
                    ❌ PASS
                </div>
            )}

            {/* Match score badge */}
            {typeof profile.matchScore === "number" && (
                <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {profile.matchScore}% Match
                </div>
            )}

            {/* Profile content */}
            <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-3/5 object-cover rounded-xl"
                draggable={false}
            />

            <div className="mt-3 flex-1 flex flex-col">
                <h2 className="text-xl font-bold">
                    {profile.name}, {profile.age}
                </h2>
                <p className="text-sm text-gray-600">
                    {profile.specialties?.join(", ")} • {profile.goals?.join(", ")}
                </p>
                {profile.bio && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {profile.bio}
                    </p>
                )}

                {isTop && (
                    <div className="mt-auto flex justify-center gap-6 pt-3">
                        <button
                            type="button"
                            onClick={() => swipe("pass")}
                            aria-label="Pass"
                            className="w-14 h-14 rounded-full bg-white border-2 border-red-400 text-red-500 text-2xl shadow flex items-center justify-center"
                        >
                            ✕
                        </button>
                        <button
                            type="button"
                            onClick={() => swipe("like")}
                            aria-label="Like"
                            className="w-14 h-14 rounded-full bg-white border-2 border-green-400 text-green-500 text-2xl shadow flex items-center justify-center"
                        >
                            ♥
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
