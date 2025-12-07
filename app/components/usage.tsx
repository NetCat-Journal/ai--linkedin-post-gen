'use client'
import { useEffect, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

function Usage() {
    const usage = useQuery(api.usage.check);
    const createProfile = useMutation(api.profiles.getOrCreate);
    const createCheckOut = useAction(api.stripe.createCheckoutSession);
    const profile = useQuery(api.profiles.get);
    const { isSignedIn, user } = useUser();
    const [upgrading, setUpgrading] = useState(false);

    const limit =
        profile?.subscriptionTier === "pro" ? Infinity :
            5;
    const usedCount = usage?.count || 0;
    const remaining = limit === Infinity ? Infinity : limit - usedCount;
    const percentage = limit === Infinity ? 100 : (usedCount / limit) * 100;

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

    const canUpgrade = remaining <= 0 && profile.subscriptionTier === "free";


    const upgradeHandler = async () => {
        setUpgrading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST'
            })

            if (!res.ok) {
                throw new Error('Checkout failed');
            }
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }

        }
        catch (error) {
            console.error("Error creating checkout session:", error);
            setUpgrading(false);

        }
    };

    return (
        <div className="flex flex-col justify-center items-center mt-8  w-full p-4 ">
            <div className="w-full p-8 space-y-4 border border-gray-200 rounded-sm shadow-xs backdrop-blur-sm flex flex-row justify-between">
                <div>
                    <div>
                        <h2>{profile?.name}</h2>
                    </div>
                    <div className="space-y-2">
                        <h2>{remaining === Infinity ? null : `Usage: ${usage?.count}`}</h2>
                        <div className="h-5 w-32 relative bg-gray-100">
                            <div className="absolute h-5 bg-[#0A66C2] transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                        </div>

                    </div>
                    <div className="flex flex-row space-x-7">
                        <h2>Remaining: {remaining === Infinity ? 'Unlimited' : `${remaining} out of &{limit}`} </h2>
                        <h2>{upgrading ? 'Loading...' : `⭐ You are a ${profile.subscriptionTier.toUpperCase()} member`}</h2>
                    </div></div>
                <div>
                    <div>
                        {profile.subscriptionTier === "free" && (<button onClick={upgradeHandler} disabled={!canUpgrade} className={`rounded-sm px-4 py-2 ${!canUpgrade ? 'bg-gray-600' : 'bg-[#0A66C2]'} border-2 border-transparent text-white ${!canUpgrade ? null : 'hover:bg-[#0a66c2ed]'}`}>Upgrade to Pro</button>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Usage