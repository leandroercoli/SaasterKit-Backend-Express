import { Router } from 'express';
import { validateLemonSqueezyWebhookRequest } from '../middleware/validateLemonSqueezyWebhookRequest';
import { processLemonSqueezyWebhook } from '../services/lemon-squeezy.service';

const router = Router();

// Clerk webhook endpoint
router.post('/', [validateLemonSqueezyWebhookRequest], processLemonSqueezyWebhook);

export default router;
