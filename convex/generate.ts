import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

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