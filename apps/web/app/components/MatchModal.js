"use client";

import { useRouter } from "next/navigation";

export default function MatchModal({ trainer, onClose }) {
    const router = useRouter();

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 rounded-2xl">
            <div className="bg-white text-black rounded-2xl p-6 w-11/12 text-center shadow-2xl">
                <p className="text-3xl mb-2">🎉</p>
                <h2 className="text-2xl font-extrabold mb-1">It&apos;s a Match!</h2>
                <p className="text-gray-600 mb-4">
                    You and {trainer.name} are a {trainer.matchScore}% fit.
                </p>
                <img
                    src={trainer.photos[0]}
                    alt={trainer.name}
                    className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-green-400"
                />
                <button
                    type="button"
                    onClick={() => router.push(`/chat/${trainer.id}`)}
                    className="w-full bg-green-500 text-black p-3 rounded font-bold mb-2"
                >
                    Send a Message
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-700 p-3 rounded font-bold"
                >
                    Keep Swiping
                </button>
            </div>
        </div>
    );
}
