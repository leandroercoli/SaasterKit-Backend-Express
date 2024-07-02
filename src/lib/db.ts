import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient;
}

// Prisma client can be used globally
if (!global.prisma) {
    global.prisma = new PrismaClient();
}

export default global.prisma;
