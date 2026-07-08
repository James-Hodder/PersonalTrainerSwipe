import type { UserProfile } from "./localProfile";

export type Trainer = {
    id: number;
    name: string;
    age: number;
    bio: string;
    photos: string[];
    specialties: string[];
    goals: string[];
};

export const mockTrainers: Trainer[] = [
    {
        id: 1,
        name: "Alex",
        age: 28,
        bio: "Powerlifting coach who loves turning first-timers into iron addicts.",
        photos: ["/pt1.svg"],
        specialties: ["Strength", "CrossFit"],
        goals: ["Muscle Gain", "Hypertrophy"],
    },
    {
        id: 2,
        name: "Jordan",
        age: 31,
        bio: "HIIT specialist. Bring a towel, you'll need it.",
        photos: ["/pt2.svg"],
        specialties: ["HIIT", "Cardio"],
        goals: ["Fat Loss", "Weight Loss"],
    },
    {
        id: 3,
        name: "Sam",
        age: 34,
        bio: "Yoga and mobility coach focused on sustainable, long-term fitness.",
        photos: ["/pt1.svg"],
        specialties: ["Yoga"],
        goals: ["General Fitness", "Weight Loss"],
    },
    {
        id: 4,
        name: "Casey",
        age: 26,
        bio: "CrossFit competitor turned coach. Let's chase a PR together.",
        photos: ["/pt2.svg"],
        specialties: ["CrossFit", "Strength"],
        goals: ["Hypertrophy", "General Fitness"],
    },
    {
        id: 5,
        name: "Riley",
        age: 29,
        bio: "Cardio-first coach who makes conditioning actually fun.",
        photos: ["/pt1.svg"],
        specialties: ["Cardio", "HIIT"],
        goals: ["Weight Loss", "Fat Loss"],
    },
    {
        id: 6,
        name: "Morgan",
        age: 33,
        bio: "Strength & hypertrophy specialist for lifters of every level.",
        photos: ["/pt2.svg"],
        specialties: ["Strength"],
        goals: ["Muscle Gain", "Hypertrophy"],
    },
];

export type MatchResult = {
    score: number;
    isMatch: boolean;
};

/**
 * Compatibility score between a user and a trainer, out of 100.
 * Weighted toward shared training style/goal since that's what
 * actually predicts a good coaching fit; age proximity is a minor tiebreaker.
 */
export function computeMatch(user: UserProfile, trainer: Trainer): MatchResult {
    let score = 40; // baseline so every card feels like a plausible fit

    if (trainer.specialties.includes(user.trainingStyle)) score += 30;
    if (trainer.goals.includes(user.goal)) score += 20;

    const ageGap = Math.abs(trainer.age - user.age);
    score += Math.max(0, 10 - ageGap);

    score = Math.min(99, Math.round(score));

    return { score, isMatch: score >= 70 };
}
