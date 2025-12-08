import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { api } from "./_generated/api";

//const openai = new OpenAI({
//  apiKey: process.env.OPENAI_API_KEY,
//});

export const generatePosts = action({
    args: { idea: v.string(), tone: v.string() },
    handler: async (ctx, args) => {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
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
            const limit = profile.subscriptionTier === "free" ? 5 : Infinity;

            // Step 4: Check usage limit (only for free users)
            if (profile.subscriptionTier === "free" && usage && usage.count >= limit) {
                throw new Error(`Monthly limit reached (${limit} posts). Upgrade to Pro for unlimited posts!`);
            }

            // At the top of your generate action:
            const baseInstructions = `
FORMATTING RULES (apply to ALL tones):
- Length: 150 words maximum
- Use line breaks after every 2-3 sentences
- Emojis: 1-2 maximum, use strategically
- CAPITALIZE key phrases for emphasis (max 2 per post)
- Use bullet points only when listing 3+ items

STRUCTURE:
- Strong opening hook
- Clear main message
- Engaging call-to-action at the end
`;

            const tonePrompts = {
                professional: `You are a LinkedIn expert writing professional business content.

TONE & STYLE:
- Authoritative but approachable
- Use industry terminology
- Back claims with examples or data
- Be confident and knowledgeable

CALL-TO-ACTION:
- End with "Thoughts?" or "What's your experience with [topic]?"

${baseInstructions}`,

                casual: `You are a friendly LinkedIn content creator having a conversation.

TONE & STYLE:
- Warm and conversational
- Use everyday language (no jargon)
- Sound like talking to a friend
- Be authentic and relatable
- Make it fun and engaging

CALL-TO-ACTION:
- End with "What do you think?" or "Anyone else feel this way?"

${baseInstructions}`,

                storytelling: `You are a master storyteller crafting engaging narratives.

TONE & STYLE:
- Personal and vulnerable
- Start with a vivid scene or surprising moment
- Include specific details (names, places, feelings)
- Build tension then resolve with insight
- Show don't tell

CALL-TO-ACTION:
- End with "Have you experienced something similar?" or "What's your story?"

${baseInstructions}`,

                thoughtLeader: `You are an industry thought leader challenging conventional thinking.

TONE & STYLE:
- Confident and provocative
- Challenge common beliefs
- Share unique frameworks or insights
- Back claims with reasoning
- Be contrarian but constructive

CALL-TO-ACTION:
- End with "What are your thoughts?" or "Agree or disagree?"

${baseInstructions}`,
            };

            const selectedTone = tonePrompts[args.tone as keyof typeof tonePrompts] || tonePrompts.professional;


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

