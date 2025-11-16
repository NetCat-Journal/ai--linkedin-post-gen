import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPost = mutation({
    args: {
        idea: v.string(),
        tone: v.string(),
        posts: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User not authenticated");
        }
        const userId = identity.subject;

        const postId = await ctx.db.insert("posts", {
            userId: userId,
            originalIdea: args.idea,
            tone: args.tone,
            generatedPosts: args.posts,
            createdAt: Date.now(),
        });

        const post = await ctx.db.get(postId);
        return post;
    }
})

export const getPosts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User not authenticated");
        }
        const userId = identity.subject;

        const posts = await ctx.db.query("posts").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).order("desc").collect();
        return posts;
    }
})

export const removePost = mutation({
    args: { id: v.id("posts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User not authenticated");
        }
        const userId = identity.subject;

        const post = await ctx.db.get(args.id);
        if (post?.userId !== userId) {
            throw new Error("Not authorized to delete this post");
        }
        await ctx.db.delete(args.id)
    }
})