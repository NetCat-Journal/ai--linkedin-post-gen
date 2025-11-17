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