import { getPrice, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/db';
import { CustomError } from '../lib/errors/CustomError';
import { StatusCodes } from 'http-status-codes';

/* Ensures that required environment variables are set and sets up the Lemon
 * Squeezy JS SDK. Throws an error if any environment variables are missing or
 * if there's an error setting up the SDK.
 */
function configureLemonSqueezy() {
    const requiredVars = [
        'LEMONSQUEEZY_API_KEY',
        'LEMONSQUEEZY_STORE_ID',
        'LEMONSQUEEZY_WEBHOOK_SECRET',
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required LEMONSQUEEZY env variables: ${missingVars.join(
                ', ',
            )}. Please, set them in your .env file.`,
        );
    }

    lemonSqueezySetup({
        apiKey: process.env.LEMONSQUEEZY_API_KEY,
        onError: (error) => {
            throw new CustomError(
                error.message,
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Lemon Squeezy API Error',
            );
        },
    });
}

export const processLemonSqueezyWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Lemon Squeezy webhook event
    const event = req.body;

    // Store webhook event in database
    const storedEvent = await prisma.lsWebhookEvent.create({
        data: {
            eventName: event.meta.event_name,
            processed: false,
            body: JSON.parse(JSON.stringify(event)),
        },
    });

    // Configure Lemon Squeezy
    configureLemonSqueezy();

    let processingError = '';
    const eventName = event.meta.event_name;
    const eventData = event.data;

    if (eventName.startsWith('subscription_payment_')) {
        // Save subscription invoices; eventBody is a SubscriptionInvoice
        // Not implemented.
    } else if (eventName.startsWith('subscription_')) {
        // Save subscription events; obj is a Subscription
        const attributes = eventData.attributes;
        const variantId = `${attributes.variant_id}`;

        // We assume that the Plan table is up to date.
        const plan = await prisma.lsSubscriptionPlan.findMany({
            where: {
                variantId: parseInt(variantId, 10),
            },
        });

        if (plan.length < 1) {
            processingError = `Plan with variantId ${variantId} not found.`;
        } else {
            // Update the subscription in the database.

            const priceId = attributes.first_subscription_item.price_id;

            // Get the price data from Lemon Squeezy.
            const priceData = await getPrice(priceId);
            if (priceData.error) {
                processingError = `Failed to get the price data for the subscription ${eventData.id}.`;
            }

            const isUsageBased =
                attributes.first_subscription_item.is_usage_based;
            const price = isUsageBased
                ? priceData.data?.data.attributes.unit_price_decimal
                : priceData.data?.data.attributes.unit_price;

            const updateData = {
                lemonSqueezyId: eventData.id,
                orderId: attributes.order_id as number,
                name: attributes.user_name as string,
                email: attributes.user_email as string,
                status: attributes.status as string,
                statusFormatted: attributes.status_formatted as string,
                renewsAt: attributes.renews_at as string,
                endsAt: attributes.ends_at as string,
                trialEndsAt: attributes.trial_ends_at as string,
                price: price?.toString() ?? '',
                isPaused: false,
                subscriptionItemId: `${attributes.first_subscription_item.id}`,
                isUsageBased: attributes.first_subscription_item.is_usage_based,
                userId: event.meta.custom_data.user_id,
                planId: plan[0].id,
            };

            // Create/update subscription in the database.
            try {
                await prisma.lsUserSubscription.upsert({
                    where: {
                        lemonSqueezyId: updateData.lemonSqueezyId,
                    },
                    create: updateData,
                    update: updateData,
                });
            } catch (error) {
                console.error(error);
                throw new CustomError(processingError, StatusCodes.UNPROCESSABLE_ENTITY, 'Lemon Squeezy Webhook Error');
            }
        }
    } else if (eventName.startsWith('order_')) {
        // Save orders; eventBody is a "Order"
        /* Not implemented */
    } else if (eventName.startsWith('license_')) {
        // Save license keys; eventBody is a "License key"
        /* Not implemented */
    }

    // Update the webhook event in the database.
    await prisma.lsWebhookEvent.update({
        where: {
            id: storedEvent.id,
        },
        data: {
            processed: true,
            processingError,
        },
    });

    return res.status(200).json({ message: 'Webhook received' });
};
