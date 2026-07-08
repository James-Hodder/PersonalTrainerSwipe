"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    subscribe,
    getMessagesSnapshot,
    getServerSnapshotMessages,
    getMessages,
    saveMessages,
    getTrainerById,
    createMessage,
} from "@/lib/matches";
import { getLocalProfile } from "@/lib/localProfile";

const trainerReplies = [
    "Love that goal — we can definitely build a plan around it. 💪",
    "Nice! How many days a week can you realistically train?",
    "Perfect. I'd start you with a solid {style} base and build from there.",
    "Got it. Do you have gym access, or are we training at home?",
    "Awesome — consistency beats intensity. Let's lock in your first session!",
    "Great question. I'll put together a starter routine for you tonight.",
];

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const trainerId = Number(params.id);
    const trainer = getTrainerById(trainerId);

    const messages = useSyncExternalStore(
        subscribe,
        () => getMessagesSnapshot(trainerId),
        getServerSnapshotMessages
    );

    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);
    const replyIndex = useRef(0);
    const replyTimer = useRef(null);

    // Seed a greeting from the trainer the first time you open the chat.
    useEffect(() => {
        if (!trainer) return;
        if (getMessages(trainerId).length > 0) return;

        const profile = getLocalProfile();
        const name = profile?.name ? ` ${profile.name}` : "";
        saveMessages(trainerId, [
            createMessage(
                "trainer",
                `Hey${name}! 🎉 So stoked we matched. I specialise in ${trainer.specialties.join(
                    " & "
                )} — what are you hoping to work on?`
            ),
        ]);
    }, [trainerId, trainer]);

    // Keep the latest message in view.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    // Cancel a pending trainer reply if we leave the chat.
    useEffect(() => () => clearTimeout(replyTimer.current), []);

    function send(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || !trainer) return;

        saveMessages(trainerId, [...getMessages(trainerId), createMessage("me", text)]);
        setInput("");

        // Simulated trainer reply so the chat feels alive.
        const template = trainerReplies[replyIndex.current % trainerReplies.length];
        replyIndex.current += 1;
        const replyText = template.replace(
            "{style}",
            trainer.specialties[0]?.toLowerCase() ?? "training"
        );

        setTyping(true);
        replyTimer.current = setTimeout(() => {
            setTyping(false);
            saveMessages(trainerId, [
                ...getMessages(trainerId),
                createMessage("trainer", replyText),
            ]);
        }, 1200);
    }

    if (!trainer) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
                <p>Trainer not found.</p>
                <Link href="/matches" className="text-green-400 font-semibold">
                    ← Back to matches
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center">
            <div className="w-full max-w-md flex flex-col h-screen bg-white text-black">
                {/* Header */}
                <header className="flex items-center gap-3 p-3 border-b border-gray-200 sticky top-0 bg-white">
                    <button
                        onClick={() => router.push("/matches")}
                        className="text-gray-500 text-xl px-1"
                        aria-label="Back to matches"
                    >
                        ←
                    </button>
                    <img
                        src={trainer.photos[0]}
                        alt={trainer.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-green-400"
                    />
                    <div>
                        <p className="font-bold leading-tight">{trainer.name}</p>
                        <p className="text-xs text-gray-500">
                            {trainer.specialties.join(", ")}
                        </p>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex ${
                                m.sender === "me" ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                                    m.sender === "me"
                                        ? "bg-green-500 text-black rounded-br-sm"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                                }`}
                            >
                                {m.text}
                            </div>
                        </div>
                    ))}

                    {typing && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-400 border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">
                                {trainer.name} is typing…
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={send}
                    className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message…"
                        className="flex-1 p-3 rounded-full bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-green-500 text-black font-bold px-5 py-3 rounded-full"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
