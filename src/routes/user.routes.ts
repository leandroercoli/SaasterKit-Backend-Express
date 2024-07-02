import { Router } from 'express';
import { validateClerkWebhookRequest } from '../middleware/validateClerkWebhookRequest';
import { processClerkWebhook } from '../services/clerk.service';

const router = Router();

// Clerk webhook endpoint
router.post('/', [validateClerkWebhookRequest], processClerkWebhook);

export default router;
