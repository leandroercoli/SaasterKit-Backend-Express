import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { CustomError } from '../lib/errors/CustomError';
import { StatusCodes } from 'http-status-codes';

// Verifies if the webhook signature is valid against the WEBHOOK_SECRET env variable
export const validateClerkWebhookRequest = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Check if the WEBHOOK_SECRET is set
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        return next(new CustomError('You need a WEBHOOK_SECRET in your .env', StatusCodes.INTERNAL_SERVER_ERROR, 'Clerk Webhook Error'));
    }

    // Get the Svix headers for verification
    const svix_id = req.get('svix-id');
    const svix_timestamp = req.get('svix-timestamp');
    const svix_signature = req.get('svix-signature');

    // If there are no Svix headers, error out - this request is not from Clerk
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return next(
            new CustomError(
                'Missing Signature Header',
                StatusCodes.FORBIDDEN,
                'Clerk Webhook Error',
            ),
        );
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Get the raw body of the request to verify the webhook
    const payload = (req as any).rawBody;

    // Attempt to verify the incoming webhook
    // If successful, the payload will be available from 'evt'
    // If the verification fails, error out and  return error code
    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.log('Error verifying webhook:', err.message);
        return next(
            new CustomError(
                'Error verifying webhook',
                StatusCodes.UNAUTHORIZED,
                'Clerk Webhook Error',
            ),
        );
    }

    next();
};
