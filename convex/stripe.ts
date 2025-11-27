import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const createCheckoutSession = action({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User not authenticated");
        }
        const userId = identity.subject;
        const email = identity.email;

        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

        const profile: any = await ctx.runQuery(api.profiles.get);
        let customerId = profile?.stripeCustomerId;

        // Create Stripe customer if not exists
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: email || undefined,
                metadata: {
                    userId: userId,
                },
            });
            customerId = customer.id;

            // Update profile with Stripe customer ID    
            await ctx.runMutation(api.profiles.updateStripeCustomer, {
                customerId: customerId,
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID!,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
            metadata: {
                userId: userId,
            },
        });

        return {
            sessionId: session.id,
            url: session.url,
        };
    },
});