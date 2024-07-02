import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/db';
import { CustomError } from '../lib/errors/CustomError';
import { StatusCodes } from 'http-status-codes';

export const processClerkWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Convert the Clerk event to a WebhookEvent
    const event: WebhookEvent = req.body;

    // Process the webhook event
    const type = event.type;
    const { id: clerkUserId } = event.data;

    // Create a new user
    if (type === 'user.created') {
        const { email_addresses = [] } = event.data;
        const email = email_addresses?.[0]?.email_address ?? '';

        if (!email)
            next(
                new CustomError(
                    'No email address provided',
                    StatusCodes.BAD_REQUEST,
                    'Clerk Webhook Error',
                ),
            );

        const user = await prisma.user.upsert({
            where: {
                clerkUserId,
            },
            update: {
                clerkUserId,
                email,
            },
            create: {
                clerkUserId,
                email,
            },
        });

        return res.status(200).json(user);
    }

    // Delete an existing user
    if (type === 'user.deleted') {
        const user = await prisma.user.delete({
            where: {
                clerkUserId,
            },
        });

        return res.status(200).json(user);
    }

    return res.status(200).json({ message: 'Webhook received' });
};
