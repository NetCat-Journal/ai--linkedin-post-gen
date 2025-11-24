'use client'
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

function Usage() {
    const usage = useQuery(api.usage.check);
    const createProfile = useMutation(api.profiles.getOrCreate);
    const profile = useQuery(api.profiles.get);
    const { isSignedIn, user } = useUser();

    const limit =
        profile?.subscriptionTier === "enterprise" ? 100 :
            profile?.subscriptionTier === "pro" ? 50 :
                5;
    const usedCount = usage?.count || 0;
    const remaining = limit - usedCount;
    const percentage = (usedCount / limit) * 100;

    useEffect(() => {
        if (profile === null) {
            createProfile();
        }
    }, [createProfile, profile]);

    if (usage === undefined || profile === undefined) {
        return (<div>Loading data...</div>)

    }

    if (usage === null || profile === null) {
        return (<div>Loading profile...</div>)

    }

    console.log("=== AUTH DEBUG ===");
    console.log("Clerk isSignedIn:", isSignedIn);
    console.log("Clerk user ID:", user?.id);
    console.log("Convex usage:", usage);
    console.log("Convex profile:", profile);
    console.log("==================");

    return (
        <div className="flex flex-col justify-center items-center mt-8  w-full p-4">
            <div className="w-full p-8 space-y-4 border border-gray-200 rounded-sm backdrop-blur-2xl shadow-gray-50">
                <div>
                    <h2>{profile?.name}</h2>
                </div>
                <div className="space-y-2">
                    <h2>Usage: {usage?.count}</h2>
                    <div className="h-5 w-32 relative bg-gray-100">
                        <div className="absolute h-5 bg-[#0A66C2] transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>

                </div>
                <div className="flex flex-row space-x-7">
                    <h2>Remaining: {remaining} out of {limit}</h2>
                    <h2>{profile.subscriptionTier}</h2>
                </div>
            </div>
        </div>
    )
}

export default Usage