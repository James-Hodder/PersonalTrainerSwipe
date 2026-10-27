"use client";

import { useState } from "react";
import { muscleGroups } from "@pt-swipe/shared";

export default function ExercisePicker({ exercises, onSelect, onClose }) {
    const [query, setQuery] = useState("");
    const [group, setGroup] = useState(null);

    const q = query.trim().toLowerCase();
    const filtered = exercises.filter(
        (e) => (!group || e.muscleGroup === group) && (!q || e.name.toLowerCase().includes(q))
    );

    return (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/70">
            <div className="bg-white text-black rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold">Add exercise</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 text-xl px-1"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 space-y-3 border-b border-gray-200">
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search exercises…"
                        className="w-full p-3 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[null, ...muscleGroups].map((g) => (
                            <button
                                key={g ?? "all"}
                                type="button"
                                onClick={() => setGroup(g)}
                                className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                                    group === g ? "bg-green-500 text-black" : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {g ?? "All"}
                            </button>
                        ))}
                    </div>
                </div>

                <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                        <li className="p-6 text-center text-sm text-gray-500">No exercises found.</li>
                    ) : (
                        filtered.map((e) => (
                            <li key={e.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(e)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                >
                                    <p className="font-semibold">{e.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {e.muscleGroup} • {e.equipment}
                                    </p>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
