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

export function createMessage(sender: "me" | "trainer", text: string): ChatMessage {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sender,
        text,
        timestamp: Date.now(),
    };
}
