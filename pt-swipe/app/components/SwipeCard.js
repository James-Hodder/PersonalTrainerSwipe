"use client";

import { useRef, useState } from "react";

export default function SwipeCard({ profile, onSwipe }) {
    const cardRef = useRef(null);
    const startX = useRef(0);
    const [dx, setDx] = useState(0);

    const threshold = 120;

    const handleStart = (e) => {
        startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    };

    const handleMove = (e) => {
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        setDx(currentX - startX.current);
    };

    const handleEnd = () => {
        if (dx > threshold) onSwipe("like", profile);
        else if (dx < -threshold) onSwipe("pass", profile);

        setDx(0);
    };

    return (
        <div
            ref={cardRef}
            onMouseDown={handleStart}
            onMouseMove={dx !== 0 ? handleMove : null}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="absolute w-full h-full bg-white rounded-2xl shadow-xl p-4 select-none"
            style={{
                transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)`,
                transition: dx === 0 ? "transform 0.3s ease" : "none",
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

            {/* Profile content */}
            <img
                src={profile.photos[0]}
                className="w-full h-3/4 object-cover rounded-xl"
            />

            <div className="mt-3">
                <h2 className="text-xl font-bold">
                    {profile.name}, {profile.age}
                </h2>
                <p className="text-sm text-gray-600">
                    {profile.trainingStyle} • {profile.goal}
                </p>
            </div>
        </div>
    );
}
