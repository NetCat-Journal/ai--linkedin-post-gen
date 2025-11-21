import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { api } from "./_generated/api";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const testGenerate = action({
    args: { prompt: v.string() },
    handler: async (ctx, args) => {
        try {
            const complete = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates LinkedIn posts.",
                    },
                    {
                        role: "user",
                        content: args.prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 500,
            })
            const res = complete.choices[0].message?.content;
            return {
                sucess: true,
                content: res,
                tokensUsed: complete.usage?.total_tokens || 0,
                model: complete.model
            };
        }
        catch (error) {
            console.error("Error generating content:", error);
            return {
                sucess: false,
                content: "Error generating content",
                tokensUsed: 0,
                model: ""
            };
        }
    },
});

export const generatePosts = action({
    args: { idea: v.string(), tone: v.string() },
    handler: async (ctx, args) => {
        try {
            // Step 1: Check authentication
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) {
                throw new Error("User not authenticated");
            }

            // Step 2: Get usage and profile
            const usage = await ctx.runQuery(api.usage.check);
            const profile = await ctx.runQuery(api.profiles.get);

            if (!profile) {
                throw new Error("Profile not found");
            }

            console.log("User profile:", profile);
            console.log("Current usage:", usage);

            // Step 3: Calculate limit
            const limit =
                profile.subscriptionTier === "enterprise" ? 100 :
                    profile.subscriptionTier === "pro" ? 50 :
                        5;

            // Step 4: Check usage limit
            if (usage && usage.count >= limit) {
                throw new Error(`Monthly limit reached (${limit} posts). Please upgrade.`);
            }

            // Step 5: Build tone-specific prompt
            const tonePrompts = {
                professional: "Write in a professional, polished tone. Use industry terminology.",
                casual: "Write in a friendly, conversational tone. Use simple language.",
                storytelling: "Write as a compelling story with a hook and insight.",
                thoughtLeader: "Write as a thought leader with unique insights.",
            };

            // ✅ FIX: Get the specific tone prompt
            const selectedTone = tonePrompts[args.tone as keyof typeof tonePrompts] || tonePrompts.professional;

            // ✅ FIX: Insert the tone into system prompt
            const systemPrompt = `You are a LinkedIn content expert. ${selectedTone}

Create 3 different variations of a LinkedIn post based on the user's idea.
Each variation should be unique but maintain the same core message.
Keep posts between 100-300 words.

CRITICAL: Return ONLY a valid JSON array with exactly 3 posts, no markdown:
["post 1 text", "post 2 text", "post 3 text"]`;

            console.log("🤖 Calling OpenAI...");

            // Step 6: Call OpenAI
            const complete = await openai.chat.completions.create({
                model: "gpt-4o-mini",  // ✅ Changed to mini for cost
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: `Create 3 LinkedIn post variations about: ${args.idea}`,
                    },
                ],
                temperature: 0.8,
                max_tokens: 1000,  // ✅ Increased for 3 posts
            });

            const content = complete.choices[0].message?.content;
            console.log("✅ OpenAI response received");

            // ✅ FIX: Parse JSON response
            let posts: string[];
            try {
                // Remove markdown code blocks if present
                const cleanContent = content?.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim() || "";
                posts = JSON.parse(cleanContent);

                if (!Array.isArray(posts) || posts.length !== 3) {
                    throw new Error("Invalid response format");
                }
            } catch (parseError) {
                console.error("❌ Parse error:", content);
                throw new Error("Failed to parse generated posts");
            }

            console.log("✅ Parsed 3 posts successfully");

            // ✅ FIX: Save to database BEFORE returning
            await ctx.runMutation(api.posts.createPost, {
                idea: args.idea,
                tone: args.tone,
                posts: posts,  // ✅ Use actual posts
            });

            console.log("✅ Posts saved to database");

            // ✅ FIX: Increment usage
            await ctx.runMutation(api.usage.increment);
            console.log("✅ Usage incremented");

            // ✅ FIX: Return correct format
            return {
                success: true,
                posts: posts,
                tokensUsed: complete.usage?.total_tokens || 0,
            };

        } catch (error: any) {
            console.error("❌ Generation error:", error);
            return {
                success: false,
                error: error.message || "Failed to generate posts",
                posts: [],
                tokensUsed: 0,
            };
        }
    }
});

