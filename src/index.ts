import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import { Request, Response } from 'express';
import { errorHandler } from './lib/errors/errorHandler';

const PORT = process.env.PORT || 8000;

export const app = express();
app.use(cors()); // Enable CORS
app.use(helmet()); // Enable security headers

// Only add the rawbody string if this is a webhook request.
// This is used by the /user POST endpoint to verify the webhook signature from Clerk and Lemon Squeezy
const rawBodyBuffer = (
    req: Request,
    res: Response,
    buffer: Buffer,
    encoding: BufferEncoding,
) => {
    if (!req.headers['svix-signature'] && !req.headers['x-signature']) {
        return;
    }

    if (buffer && buffer.length) {
        (req as any).rawBody = buffer.toString(encoding || 'utf8');
    }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.use('/api', routes); // Add the routes

// Default route
app.get('/', (req, res, next) => {
    res.status(200)
        .header('Content-Type', 'text/html')
        .send(`<h3>SaasterKit Node.js & Express Backend</hh3>`);
});

// Wildcard route
app.get('*', (req, res, next) => {
    return res.status(404).json('404 Not Found');
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log('Server running at PORT: ', PORT);
});
