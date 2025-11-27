import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    profiles: defineTable({
        userId: v.string(),
        name: v.optional(v.string()),
        subscriptionTier: v.string(),   //free, pro, enterprise
        subscriptionStatus: v.string(), //active,inactive,canceled
        stripeCustomerId: v.optional(v.string()),
        stripeSubscriptionId: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        // Fast lookup by Clerk user ID
        .index('by_user', ['userId'])

        // Fast lookup by Stripe customer ID (for webhooks)
        .index('by_stripe_customer', ['stripeCustomerId']),

    posts: defineTable({
        userId: v.string(),
        originalIdea: v.string(),
        tone: v.string(),
        generatedPosts: v.array(v.string()),
        wasHelpful: v.optional(v.boolean()),
        createdAt: v.number(),
    })
        // Fast lookup of all posts by a specific user
        .index('by_user', ['userId'])

        // Fast lookup of user's posts sorted by date (compound index)
        .index('by_user_and_date', ['userId', 'createdAt']),

    usage: defineTable({
        userId: v.string(),
        month: v.string(),
        postCount: v.number(),
        updatedAt: v.number(),
    })
        // Fast lookup of usage for specific user and month
        .index('by_user_and_month', ['userId', 'month']),
})