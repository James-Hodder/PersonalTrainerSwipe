import { mockTrainers, type Trainer } from "./trainers";

export type Match = {
    trainerId: number;
    matchScore: number;
    matchedAt: number;
};

export type ChatMessage = {
    id: string;
    sender: "me" | "trainer";
    text: string;
    timestamp: number;
};

const MATCHES_KEY = "ptswipe_matches";
const chatKey = (trainerId: number) => `ptswipe_chat_${trainerId}`;

function safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function write(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
    emit();
}

// --- External store plumbing (for useSyncExternalStore) ---------------------

const listeners = new Set<() => void>();

export function subscribe(listener: () => void) {
    listeners.add(listener);
    if (typeof window !== "undefined") {
        window.addEventListener("storage", listener);
    }
    return () => {
        listeners.delete(listener);
        if (typeof window !== "undefined") {
            window.removeEventListener("storage", listener);
        }
    };
}

function emit() {
    listeners.forEach((l) => l());
}

// Snapshots must return a referentially-stable value while the underlying
// storage is unchanged, or useSyncExternalStore loops forever.
const EMPTY_MATCHES: Match[] = [];
let matchesRaw: string | null | undefined;
let matchesSnap: Match[] = EMPTY_MATCHES;

export function getMatchesSnapshot(): Match[] {
    if (typeof window === "undefined") return EMPTY_MATCHES;
    const raw = window.localStorage.getItem(MATCHES_KEY);
    if (raw !== matchesRaw) {
        matchesRaw = raw;
        matchesSnap = safeParse<Match[]>(raw, EMPTY_MATCHES);
    }
    return matchesSnap;
}

const EMPTY_MESSAGES: ChatMessage[] = [];
const msgRaw: Record<number, string | null | undefined> = {};
const msgSnap: Record<number, ChatMessage[]> = {};

export function getMessagesSnapshot(trainerId: number): ChatMessage[] {
    if (typeof window === "undefined") return EMPTY_MESSAGES;
    const raw = window.localStorage.getItem(chatKey(trainerId));
    if (raw !== msgRaw[trainerId]) {
        msgRaw[trainerId] = raw;
        msgSnap[trainerId] = safeParse<ChatMessage[]>(raw, EMPTY_MESSAGES);
    }
    return msgSnap[trainerId] ?? EMPTY_MESSAGES;
}

export function getServerSnapshotMatches(): Match[] {
    return EMPTY_MATCHES;
}

export function getServerSnapshotMessages(): ChatMessage[] {
    return EMPTY_MESSAGES;
}

// --- Reads / writes ---------------------------------------------------------

export function getMatches(): Match[] {
    return getMatchesSnapshot();
}

export function addMatch(trainer: { id: number; matchScore?: number }) {
    const matches = getMatches();
    if (matches.some((m) => m.trainerId === trainer.id)) return;

    write(MATCHES_KEY, [
        {
            trainerId: trainer.id,
            matchScore: trainer.matchScore ?? 0,
            matchedAt: Date.now(),
        },
        ...matches,
    ]);
}

export function getTrainerById(id: number): Trainer | undefined {
    return mockTrainers.find((t) => t.id === id);
}

export function getMessages(trainerId: number): ChatMessage[] {
    return getMessagesSnapshot(trainerId);
}

export function saveMessages(trainerId: number, messages: ChatMessage[]) {
    write(chatKey(trainerId), messages);
}

export function createMessage(sender: "me" | "trainer", text: string): ChatMessage {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sender,
        text,
        timestamp: Date.now(),
    };
}
