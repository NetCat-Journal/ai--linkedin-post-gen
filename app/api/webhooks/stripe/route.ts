import { NextResponse } from "next/server";
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { ConvexHttpClient } from "convex/browser";
import { api } from '@/convex/_generated/api';
import { cn } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia' as any,
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;


export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');


    if (!endpointSecret) {
        throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    if (!signature) {
        console.error('No signature found');
        return NextResponse.json(
            { error: 'No signature' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            endpointSecret,
        )
    }
    catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook signature failed' }, { status: 500 });
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId as string;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;
            if (!userId) {
                console.error('No userId in session metadata');
                break;
            }
            await convex.mutation(api.profiles.updateSubscription, {
                userId: userId,
                subscriptionTier: 'pro',
                subscriptionStatus: 'active',
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
            });
            break;
        }
        case 'customer.subscription.deleted': {
            const paymentMethod = event.data.object;
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            await convex.mutation(api.profiles.downgradeByCustomerId, {
                customerId: customerId,
                subscriptionTier: 'free',
                subscriptionStatus: 'canceled',
            })
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            const status = subscription.status === 'active' ? 'active' : 'inactive';
            const tier = subscription.status === 'active' ? 'pro' : 'free';

            await convex.mutation(api.profiles.downgradeByCustomerId, {
                customerId,
                subscriptionTier: tier,
                subscriptionStatus: status,
            });
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
}