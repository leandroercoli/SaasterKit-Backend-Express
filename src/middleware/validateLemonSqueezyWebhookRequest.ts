import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { webhookHasData, webhookHasMeta } from '../lib/lemon-squeezy.utils';
import { CustomError } from '../lib/errors/CustomError';
import { StatusCodes } from 'http-status-codes';

// Verifies if the webhook signature is valid against the WEBHOOK_SECRET env variable
export const validateLemonSqueezyWebhookRequest = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Check if the WEBHOOK_SECRET is set
    const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        return next(
            new CustomError(
                'You need a LEMONSQUEEZY_WEBHOOK_SECRET in your .env',
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Lemon Squeezy Webhook Error',
            ),
        );
    }

    // Get the raw body of the request to verify the webhook
    const rawBody = (req as any).rawBody;

    // Check the request signature
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signature = Buffer.from(req.get('x-signature') || '', 'utf8');

    // If there are no signature headers, error out - this request is not from Lemon Squeezy
    if (!signature) {
        return next(
            new CustomError(
                'Missing Signature Header',
                StatusCodes.FORBIDDEN,
                'Lemon Squeezy Webhook Error',
            ),
        );
    }

    // If the signature is invalid, error out - this request is not from Lemon Squeezy
    if (!crypto.timingSafeEqual(digest, signature)) {
        return next(
            new CustomError(
                'Invalid Signature Header',
                StatusCodes.FORBIDDEN,
                'Lemon Squeezy Webhook Error',
            ),
        );
    }

    // Check if the event has meta data
    if (!webhookHasMeta(JSON.parse(rawBody))) {
        return next(
            new CustomError(
                'Missing Event Meta',
                StatusCodes.BAD_REQUEST,
                'Lemon Squeezy Webhook Error',
            ),
        );
    }

    // Check if the event has data
    if (!webhookHasData(JSON.parse(rawBody))) {
        return next(
            new CustomError(
                'Missing Event Data',
                StatusCodes.BAD_REQUEST,
                'Lemon Squeezy Webhook Error',
            ),
        );
    }

    next();
};
