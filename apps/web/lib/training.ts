import { useMemo, useSyncExternalStore } from "react";
import {
    defaultExercises,
    finishWorkout,
    newId,
    type Exercise,
    type MuscleGroup,
    type Routine,
    type Workout,
} from "@pt-swipe/shared";

// localStorage persistence for training data. Swap these stores for Supabase
// queries later; pages only touch the hooks and actions exported below.

function safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function createStore<T>(key: string, fallback: T) {
    const listeners = new Set<() => void>();

    // Snapshots must return a referentially-stable value while the underlying
    // storage is unchanged, or useSyncExternalStore loops forever.
    let raw: string | null | undefined;
    let snap = fallback;

    function get(): T {
        if (typeof window === "undefined") return fallback;
        const next = window.localStorage.getItem(key);
        if (next !== raw) {
            raw = next;
            snap = safeParse<T>(next, fallback);
        }
        return snap;
    }

    function set(value: T) {
        if (typeof window === "undefined") return;
        if (value === null) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
        listeners.forEach((l) => l());
    }

    function subscribe(listener: () => void) {
        listeners.add(listener);
        window.addEventListener("storage", listener);
        return () => {
            listeners.delete(listener);
            window.removeEventListener("storage", listener);
        };
    }

    function useValue(): T {
        return useSyncExternalStore(subscribe, get, () => fallback);
    }

    return { get, set, useValue };
}

const customExercisesStore = createStore<Exercise[]>("ptswipe_custom_exercises", []);
const routinesStore = createStore<Routine[]>("ptswipe_routines", []);
const workoutsStore = createStore<Workout[]>("ptswipe_workouts", []);
const activeWorkoutStore = createStore<Workout | null>("ptswipe_active_workout", null);

/**
 * False during prerender and hydration, true once localStorage is readable.
 * Lets pages show a loading state instead of flashing "nothing here yet".
 */
export function useHydrated(): boolean {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
}

// --- Exercises --------------------------------------------------------------

export function useExercises(): Exercise[] {
    const custom = customExercisesStore.useValue();
    return useMemo(() => [...defaultExercises, ...custom], [custom]);
}

export function addCustomExercise(name: string, muscleGroup: MuscleGroup, equipment: string): Exercise {
    const exercise: Exercise = { id: `custom-${newId()}`, name, muscleGroup, equipment, custom: true };
    customExercisesStore.set([...customExercisesStore.get(), exercise]);
    return exercise;
}

/** Also strips the exercise from routines. Logged history keeps its copy of the name. */
export function deleteCustomExercise(id: string) {
    customExercisesStore.set(customExercisesStore.get().filter((e) => e.id !== id));
    routinesStore.set(
        routinesStore.get().map((r) => ({
            ...r,
            exercises: r.exercises.filter((e) => e.exerciseId !== id),
        }))
    );
}

// --- Routines ---------------------------------------------------------------

export function useRoutines(): Routine[] {
    return routinesStore.useValue();
}

export function saveRoutine(routine: Routine) {
    const routines = routinesStore.get();
    const exists = routines.some((r) => r.id === routine.id);
    routinesStore.set(
        exists ? routines.map((r) => (r.id === routine.id ? routine : r)) : [...routines, routine]
    );
}

export function deleteRoutine(id: string) {
    routinesStore.set(routinesStore.get().filter((r) => r.id !== id));
}

// --- Workouts ---------------------------------------------------------------

/** Finished workouts, newest first. */
export function useWorkouts(): Workout[] {
    return workoutsStore.useValue();
}

export function renameWorkout(id: string, name: string) {
    workoutsStore.set(workoutsStore.get().map((w) => (w.id === id ? { ...w, name } : w)));
}

export function deleteWorkout(id: string) {
    workoutsStore.set(workoutsStore.get().filter((w) => w.id !== id));
}

export function useActiveWorkout(): Workout | null {
    return activeWorkoutStore.useValue();
}

export function setActiveWorkout(workout: Workout) {
    activeWorkoutStore.set(workout);
}

export function discardActiveWorkout() {
    activeWorkoutStore.set(null);
}

/** Moves the active workout into history. Returns null if nothing was completed. */
export function finishActiveWorkout(): Workout | null {
    const active = activeWorkoutStore.get();
    if (!active) return null;

    const finished = finishWorkout(active);
    if (!finished) return null;

    workoutsStore.set([finished, ...workoutsStore.get()]);
    activeWorkoutStore.set(null);
    return finished;
}
