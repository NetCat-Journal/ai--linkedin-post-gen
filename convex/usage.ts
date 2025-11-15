import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";

export const check = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("User not authenticated");

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

        const usage = await ctx.db.query("usage").withIndex("by_user_and_month", (q) =>

            q.eq("userId", identity.subject).eq("month", monthKey)).first();

        return {
            count: usage?.postCount || 0,
            month: monthKey
        }
    }
})

export const increment = mutation({
    args: {},
    handler: async (ctx: MutationCtx) => {
        const idemtity = await ctx.auth.getUserIdentity();
        if (!idemtity) throw new Error("User not authenticated");

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

        const user = await ctx.db.query("usage").withIndex("by_user_and_month", (q) => q.eq("userId", idemtity.subject).eq("month", monthKey)).first();

        if (user) {
            await ctx.db.patch(user._id, {
                postCount: user.postCount + 1,
            });
        }
        else {
            await ctx.db.insert("usage", {
                userId: idemtity.subject,
                month: monthKey,
                postCount: 1,
                updatedAt: Date.now(),
            })
        }
    }

})