"use client";

import { useState } from "react";
import Link from "next/link";
import { addCustomExercise, deleteCustomExercise, useExercises, useHydrated } from "@/lib/training";
import { equipmentTypes, muscleGroups } from "@pt-swipe/shared";

export default function ExercisesPage() {
    const hydrated = useHydrated();
    const exercises = useExercises();
    const [query, setQuery] = useState("");
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [muscleGroup, setMuscleGroup] = useState(muscleGroups[0]);
    const [equipment, setEquipment] = useState(equipmentTypes[0]);
    const [error, setError] = useState("");

    function add(e) {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return setError("Enter an exercise name.");
        if (exercises.some((ex) => ex.name.toLowerCase() === trimmed.toLowerCase())) {
            return setError(`"${trimmed}" is already in your library.`);
        }
        addCustomExercise(trimmed, muscleGroup, equipment);
        setName("");
        setError("");
        setAdding(false);
    }

    function remove(exercise) {
        if (!window.confirm(`Delete "${exercise.name}"? It will be removed from your routines; past workouts are kept.`)) {
            return;
        }
        deleteCustomExercise(exercise.id);
    }

    const q = query.trim().toLowerCase();
    const filtered = exercises.filter((e) => !q || e.name.toLowerCase().includes(q));
    const groups = muscleGroups
        .map((g) => ({ group: g, items: filtered.filter((e) => e.muscleGroup === g) }))
        .filter((g) => g.items.length > 0);

    const fieldClass =
        "w-full p-3 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500";

    return (
        <div className="min-h-screen px-4 py-6 max-w-md mx-auto space-y-4">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Exercises</h1>
                <Link href="/training" className="text-sm text-green-400 font-semibold">
                    ← Training
                </Link>
            </header>

            {adding ? (
                <form onSubmit={add} className="bg-white text-black rounded-2xl p-4 shadow-lg space-y-3">
                    <p className="font-bold">New exercise</p>
                    <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Exercise name"
                        className={fieldClass}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className={fieldClass}>
                            {muscleGroups.map((g) => (
                                <option key={g}>{g}</option>
                            ))}
                        </select>
                        <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className={fieldClass}>
                            {equipmentTypes.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-green-500 text-black p-2 rounded-full font-bold">
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setAdding(false);
                                setError("");
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 p-2 rounded-full font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="w-full border-2 border-dashed border-zinc-500 text-zinc-500 p-3 rounded-2xl font-semibold"
                >
                    + Add custom exercise
                </button>
            )}

            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises…"
                className="w-full p-3 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {!hydrated ? (
                <p className="text-center text-zinc-400">Loading exercises...</p>
            ) : groups.length === 0 ? (
                <p className="text-center text-zinc-400 text-sm">No exercises match “{query}”.</p>
            ) : (
                groups.map(({ group, items }) => (
                    <section key={group}>
                        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">{group}</h2>
                        <ul className="bg-white text-black rounded-2xl shadow-lg divide-y divide-gray-100 overflow-hidden">
                            {items.map((e) => (
                                <li key={e.id} className="flex items-center">
                                    <Link href={`/training/exercises/${e.id}`} className="flex-1 px-4 py-3 hover:bg-gray-50">
                                        <p className="font-semibold">
                                            {e.name}
                                            {e.custom && (
                                                <span className="ml-2 text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    Custom
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">{e.equipment}</p>
                                    </Link>
                                    {e.custom && (
                                        <button
                                            type="button"
                                            onClick={() => remove(e)}
                                            className="px-4 text-red-400"
                                            aria-label={`Delete ${e.name}`}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))
            )}
        </div>
    );
}
