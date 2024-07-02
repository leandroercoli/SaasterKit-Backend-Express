import { Router } from 'express';
import userRoutes from './user.routes';
import todoRoutes from './todo.routes';
import lemonSqueezyRoutes from './lemon-squeezy.routes';

const router = Router();

// API routes
router.use(`/user`, userRoutes);
router.use(`/todo`, todoRoutes);
router.use(`/lemon-squeezy`, lemonSqueezyRoutes);

// Default route
router.get('/', (req, res, next) => {
    res.status(200)
        .header('Content-Type', 'text/html')
        .send(`<h3>SaasterKit Node.js & Express Backend</hh3>`);
});

export default router;
