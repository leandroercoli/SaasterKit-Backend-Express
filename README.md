# SaasterKit Backend: The Node.js & Express Boilerplate Kit for SaaS Apps

Welcome to SaasterKit Backend, a comprehensive solution designed to simplify the development process and accelerate the creation of modern web applications. This Node.js & Express Boilerplate Kit aims to address the common pain point of spending an excessive amount of time on boilerplate code setup by providing a solid foundation with essential features pre-configured, allowing you to **focus on implementing the core business logic quickly and efficiently.**

If you're looking for a **Next.js** Boilerplate kit instead, [check this link](https://saasterkit.vercel.app).

### Features

The following features are available out-of-the-box and ready to use in this Node.js & Express Boilerplate Kit. The project uses **Nest.js** and **TypeScript**, **Prisma ORM**, **Supabase** and **PostgreSQL** for database management, **Clerk** for authentication, and **Lemon Squeezy** integration for streamlined payment processing.

### Integration With Next.js Boilerplate Kit

SaasterKit is designed specifically as a backend solution using Node.js & Express. This means it provides a robust foundation for building the server-side logic of your SaaS application. While it functions independently, it can also be seamlessly integrated with the existing [Next.js boilerplate kit](https://saasterkit.vercel.app) for a complete frontend and backend solution.

## Getting Started

### Clone the Repository

```sh
git clone https://github.com/yourusername/express-boilerplate.git
cd express-boilerplate
```

### Install Dependencies

```sh
npm install
# or
yarn install
```

### Environment Variables

Create a .env file in the root of the project, or clone `.env.example`, and add the following environment variables:

**Supabase**: Sign up at Supabase and create a new project. In your project settings, you will find the SUPABASE_URL and SUPABASE_KEY.

**Clerk**: Sign up at Clerk and create a new application. You will find your CLERK_API_KEY and CLERK_SECRET_KEY in the application settings.

**Lemon Squeezy**: Sign up at Lemon Squeezy and create a new store. You will find your LEMON_SQUEEZY_API_KEY in the API section of the store settings.

```sh
# Supabase
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>

# Clerk
CLERK_API_KEY=<your-clerk-api-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=<your-lemon-squeezy-api-key>

# Other
PORT=8000
```

### Database Setup

#### Initialize Prisma:

```sh
npx prisma init
```

#### Configure Prisma

Update the prisma/schema.prisma file with your Supabase connection details.

```prisma
datasource db {
  provider = "postgresql"
  url       = env("SUPABASE_DATABASE_URL")
  directUrl = env("SUPABASE_DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Define your models here
```

#### Run Prisma Migrations

```sh
npx prisma migrate dev --name init
npx prisma generate
```

#### Run the Application

```sh
npm start
# or
yarn start
```

The application should now be running on `http://localhost:8000`.

#### Call API Routes from Next.js Frontend:

Within your Next.js components or pages, use the fetch function to make requests to SaasterKit's API backend endpoints:

```javascript
import React, { useState, useEffect } from 'react';

const MyComponent = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    'http://your-saasterkit-backend-url/todo',
                ); // Replace with your SaasterKit's URL
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    // ... render products using the products state
};

export default MyComponent;
```

### Secure Your API with Built-in Clerk Authentication

The code under `todo.routes.ts` demonstrates how to leverage Clerk, a pre-configured authentication solution within SaasterKit, to protect routes from unauthorized access. By utilizing `ClerkExpressRequireAuth` middleware, you can enforce authentication for specific routes. This middleware throws an error when encountering an unauthenticated request, ensuring only authorized users can interact with protected endpoints. You can adjust the protected routes to fit your specific security requirements.

From the frontend application, use `getToken()` from `auth()` (server-side) or `useAuth()` (client-side) to fetch the user's bearer token. Include this token in the Authorization header (Bearer ${bearerToken}) when making API calls to protected endpoints. This ensures only authorized users can access them. Remember to configure the `ClerkExpressRequireAuth` middleware to exclude specific routes as needed.

You can find more information [here](https://clerk.com/docs/backend-requests/handling/nodejs).

### Schema Validation with Zod

This boilerplate includes middleware for validating request data using Zod schemas. Zod is a TypeScript-first schema declaration and validation library. We use a `validateSchema` middleware to ensure that incoming requests adhere to the defined schemas.

You can find a schema example under `/src/lib/schemas.ts`:

```typescript
import { TodoItemCategoryEnum } from '@prisma/client';
import { z } from 'zod';

export const todoSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    category: z.nativeEnum(TodoItemCategoryEnum),
    dueDate: z.string().datetime(),
    done: z.boolean().default(false),
    userId: z.string().min(1, 'User ID is required'),
});
```

Now, use the `validateSchema` middleware to validate incoming request data against the defined schema. If the validation passes, the request proceeds to the next middleware or route handler.

```typescript
router.post('/', [validateSchema(todoSchema)], createTodoItem);
```

### Custom Error Handler

This boilerplate includes a custom error handling middleware that centralizes error handling and ensures consistent error responses. Errors are serialized and include details such as the message, status code, and stack trace (in development mode).

You can find a `CustomError` class under `/src/lib/errors/CustomError.ts`, and the error handler middleware under `/src/lib/errors/errorHandler.ts`.

## Full documentation

Find the full documentation [here](https://saasterkit.vercel.app/docs)
