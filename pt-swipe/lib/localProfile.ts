export type UserProfile = {
    name: string;
    age: number;
    trainingStyle: string;
    goal: string;
};

const STORAGE_KEY = "ptswipe_local_profile";

export function getLocalProfile(): UserProfile | null {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as UserProfile;
    } catch {
        return null;
    }
}

export function saveLocalProfile(profile: UserProfile) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearLocalProfile() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
}
