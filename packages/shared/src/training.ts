// Training tracking: exercise library, routines (planned sessions) and
// workouts (logged sessions). Weights are in kg throughout.

export type MuscleGroup = "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core" | "Full Body";

export const muscleGroups: MuscleGroup[] = [
    "Chest",
    "Back",
    "Shoulders",
    "Arms",
    "Legs",
    "Core",
    "Full Body",
];

export const equipmentTypes = [
    "Barbell",
    "Dumbbell",
    "Machine",
    "Cable",
    "Kettlebell",
    "Bodyweight",
    "Other",
];

export type Exercise = {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    equipment: string;
    custom?: boolean;
};

export const defaultExercises: Exercise[] = [
    { id: "bench-press", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
    { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell" },
    { id: "push-up", name: "Push-up", muscleGroup: "Chest", equipment: "Bodyweight" },
    { id: "deadlift", name: "Deadlift", muscleGroup: "Back", equipment: "Barbell" },
    { id: "barbell-row", name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell" },
    { id: "pull-up", name: "Pull-up", muscleGroup: "Back", equipment: "Bodyweight" },
    { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable" },
    { id: "overhead-press", name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell" },
    { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbell" },
    { id: "dumbbell-curl", name: "Dumbbell Curl", muscleGroup: "Arms", equipment: "Dumbbell" },
    { id: "tricep-pushdown", name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable" },
    { id: "back-squat", name: "Back Squat", muscleGroup: "Legs", equipment: "Barbell" },
    { id: "romanian-deadlift", name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell" },
    { id: "leg-press", name: "Leg Press", muscleGroup: "Legs", equipment: "Machine" },
    { id: "walking-lunge", name: "Walking Lunge", muscleGroup: "Legs", equipment: "Dumbbell" },
    { id: "hanging-leg-raise", name: "Hanging Leg Raise", muscleGroup: "Core", equipment: "Bodyweight" },
    { id: "cable-crunch", name: "Cable Crunch", muscleGroup: "Core", equipment: "Cable" },
    { id: "kettlebell-swing", name: "Kettlebell Swing", muscleGroup: "Full Body", equipment: "Kettlebell" },
    { id: "burpee", name: "Burpee", muscleGroup: "Full Body", equipment: "Bodyweight" },
];

export function newId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// --- Routines ---------------------------------------------------------------

export type RoutineExercise = {
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number | null;
};

export type Routine = {
    id: string;
    name: string;
    exercises: RoutineExercise[];
    createdAt: number;
    updatedAt: number;
};

// --- Workouts ---------------------------------------------------------------

// `null` means "not entered yet" so an empty input is distinct from 0 kg.
export type LoggedSet = {
    weight: number | null;
    reps: number | null;
    done: boolean;
};

export type WorkoutExercise = {
    exerciseId: string;
    // Copied at log time so history still reads correctly if a custom
    // exercise is later renamed or deleted.
    name: string;
    targetReps: number | null;
    targetWeight: number | null;
    sets: LoggedSet[];
};

export type Workout = {
    id: string;
    name: string;
    routineId: string | null;
    startedAt: number;
    finishedAt: number | null;
    exercises: WorkoutExercise[];
};

export function findExercise(library: Exercise[], id: string): Exercise | undefined {
    return library.find((e) => e.id === id);
}

export function workoutExerciseFor(
    exercise: Exercise,
    target?: Pick<RoutineExercise, "sets" | "reps" | "weight">
): WorkoutExercise {
    const setCount = target?.sets ?? 1;
    return {
        exerciseId: exercise.id,
        name: exercise.name,
        targetReps: target?.reps ?? null,
        targetWeight: target?.weight ?? null,
        sets: Array.from({ length: setCount }, () => ({ weight: null, reps: null, done: false })),
    };
}

export function createWorkout(name: string, routineId: string | null = null, exercises: WorkoutExercise[] = []): Workout {
    return {
        id: newId(),
        name,
        routineId,
        startedAt: Date.now(),
        finishedAt: null,
        exercises,
    };
}

export function workoutFromRoutine(routine: Routine, library: Exercise[]): Workout {
    const exercises = routine.exercises.flatMap((re) => {
        const exercise = findExercise(library, re.exerciseId);
        return exercise ? [workoutExerciseFor(exercise, re)] : [];
    });
    return createWorkout(routine.name, routine.id, exercises);
}

/**
 * Stamps the finish time and drops anything that wasn't actually completed.
 * Returns null when nothing was completed, so callers can offer a discard.
 */
export function finishWorkout(workout: Workout): Workout | null {
    const exercises = workout.exercises
        .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.done && (s.reps ?? 0) > 0) }))
        .filter((ex) => ex.sets.length > 0);

    if (exercises.length === 0) return null;
    return { ...workout, exercises, finishedAt: Date.now() };
}

// --- Stats ------------------------------------------------------------------

export function setVolume(set: LoggedSet): number {
    return (set.weight ?? 0) * (set.reps ?? 0);
}

export function workoutVolume(workout: Workout): number {
    return workout.exercises.reduce(
        (total, ex) => total + ex.sets.reduce((sum, s) => sum + (s.done ? setVolume(s) : 0), 0),
        0
    );
}

export function completedSetCount(workout: Workout): number {
    return workout.exercises.reduce((total, ex) => total + ex.sets.filter((s) => s.done).length, 0);
}

/** Epley formula. Only meaningful for weighted sets. */
export function estimateOneRepMax(weight: number, reps: number): number {
    if (reps <= 1) return weight;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export type ExerciseSession = {
    workoutId: string;
    workoutName: string;
    date: number;
    sets: LoggedSet[];
};

/** Every finished session that included the exercise, newest first. */
export function exerciseHistory(workouts: Workout[], exerciseId: string): ExerciseSession[] {
    return workouts
        .filter((w) => w.finishedAt !== null)
        .flatMap((w) =>
            w.exercises
                .filter((ex) => ex.exerciseId === exerciseId)
                .map((ex) => ({
                    workoutId: w.id,
                    workoutName: w.name,
                    date: w.startedAt,
                    sets: ex.sets,
                }))
        )
        .sort((a, b) => b.date - a.date);
}

export function lastPerformance(workouts: Workout[], exerciseId: string): LoggedSet[] | null {
    return exerciseHistory(workouts, exerciseId)[0]?.sets ?? null;
}

export type PersonalBests = {
    maxWeight: number | null;
    bestOneRepMax: number | null;
    mostReps: number | null;
    bestSessionVolume: number | null;
    sessions: number;
};

export function personalBests(workouts: Workout[], exerciseId: string): PersonalBests {
    const history = exerciseHistory(workouts, exerciseId);
    const bests: PersonalBests = {
        maxWeight: null,
        bestOneRepMax: null,
        mostReps: null,
        bestSessionVolume: null,
        sessions: history.length,
    };

    for (const session of history) {
        let volume = 0;
        for (const set of session.sets) {
            const reps = set.reps ?? 0;
            const weight = set.weight ?? 0;
            volume += weight * reps;
            bests.mostReps = Math.max(bests.mostReps ?? 0, reps);
            if (weight > 0) {
                bests.maxWeight = Math.max(bests.maxWeight ?? 0, weight);
                bests.bestOneRepMax = Math.max(bests.bestOneRepMax ?? 0, estimateOneRepMax(weight, reps));
            }
        }
        if (volume > 0) bests.bestSessionVolume = Math.max(bests.bestSessionVolume ?? 0, volume);
    }

    return bests;
}

// --- Formatting -------------------------------------------------------------

export function formatSet(set: Pick<LoggedSet, "weight" | "reps">): string {
    const reps = set.reps ?? 0;
    return set.weight ? `${set.weight} kg × ${reps}` : `${reps} reps`;
}

/** Live timer format: 4:07 or 1:04:07. */
export function formatClock(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Summary format: 42m or 1h 05m. */
export function formatDuration(ms: number): string {
    const minutes = Math.max(0, Math.round(ms / 60000));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}
