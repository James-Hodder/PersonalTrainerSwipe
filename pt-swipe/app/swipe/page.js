import SwipeDeck from "@/components/SwipeDeck";

const mockProfiles = [
    {
        id: 1,
        name: "Alex",
        age: 28,
        trainingStyle: "Strength",
        goal: "Hypertrophy",
        photos: ["/pt1.jpg"],
    },
    {
        id: 2,
        name: "Jordan",
        age: 31,
        trainingStyle: "HIIT",
        goal: "Fat Loss",
        photos: ["/pt2.jpg"],
    },
];

export default function SwipePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <SwipeDeck profiles={mockProfiles} />
        </div>
    );
}
