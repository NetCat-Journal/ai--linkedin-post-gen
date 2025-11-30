import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";

export const getOrCreate = mutation({
    args: {},
    handler: async (ctx: MutationCtx) => {
        // getting user from clerk auth
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        console.log("User identity:", identity);

        const userId = identity.subject;

        // Check if profile already exists in db
        const existingProfiles = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existingProfiles) {
            console.log("Existing profile found:", existingProfiles);
            return existingProfiles;
        }

        // If not, create a new profile
        const profileId = await ctx.db.insert("profiles", {
            userId: userId,
            name: identity.name || identity.email || "User",
            subscriptionTier: "free",
            subscriptionStatus: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        const newProfile = await ctx.db.get(profileId);
        return newProfile;
    },

});

export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const userId = identity.subject;

        const existingProfiles = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existingProfiles) {
            console.log("Existing profile found:", existingProfiles);
            return existingProfiles;
        }

    }
})


export const updateStripeCustomer = mutation({
    args: { customerId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User not authenticated");
        }
        const userId = identity.subject;

        const existingProfile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!existingProfile) {
            throw new Error("Profile not found");
        }

        await ctx.db.patch(existingProfile._id, {
            stripeCustomerId: args.customerId,
            updatedAt: Date.now(),
        });

        const updatedProfile = await ctx.db.get(existingProfile._id);
        return updatedProfile;
    }
})


//for webhook

export const updateSubscription = mutation({
    args: {
        userId: v.string(),
        subscriptionTier: v.string(),
        subscriptionStatus: v.string(),
        stripeCustomerId: v.string(),
        stripeSubscriptionId: v.string(),
    },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (!profile) {
            // Create profile if doesn't exist
            await ctx.db.insert("profiles", {
                userId: args.userId,
                subscriptionTier: args.subscriptionTier,
                subscriptionStatus: args.subscriptionStatus,
                stripeCustomerId: args.stripeCustomerId,
                stripeSubscriptionId: args.stripeSubscriptionId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        } else {
            // Update existing profile
            await ctx.db.patch(profile._id, {
                subscriptionTier: args.subscriptionTier,
                subscriptionStatus: args.subscriptionStatus,
                stripeCustomerId: args.stripeCustomerId,
                stripeSubscriptionId: args.stripeSubscriptionId,
                updatedAt: Date.now(),
            });
        }

        return { success: true };
    },
});

export const downgradeByCustomerId = mutation({
    args: {
        customerId: v.string(),
        subscriptionTier: v.string(),
        subscriptionStatus: v.string(),
    },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_stripe_customer", (q) =>
                q.eq("stripeCustomerId", args.customerId)
            )
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, {
                subscriptionTier: args.subscriptionTier,
                subscriptionStatus: args.subscriptionStatus,
                stripeSubscriptionId: undefined,
                updatedAt: Date.now(),
            });
        }

        return { success: true };
    },
});