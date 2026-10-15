/**
 * Prisma Database Client Singleton
 *
 * This file creates a singleton instance of PrismaClient to prevent
 * multiple database connections in development mode (Next.js hot reload).
 *
 * Key Concepts:
 * - Singleton Pattern: Ensures only one PrismaClient instance exists
 * - Development Optimization: Reuses client across hot reloads
 * - Production: Creates new instance on each serverless function invocation
 *
 * Why Singleton?
 * - Next.js development mode can create multiple PrismaClient instances during hot reload
 * - Multiple instances = multiple database connections = connection pool exhaustion
 * - Storing client in globalThis prevents this issue in development
 */
import { PrismaClient } from '@prisma/client';

/**
 * Factory function that creates a new PrismaClient instance
 * This is wrapped in a function so we can call it lazily
 */
const prismaClientSingleton = () => {
  return new PrismaClient({ datasourceUrl: withConnectTimeout(process.env.DATABASE_URL) });
};

/**
 * The remote Postgres can take ~4s to open a fresh connection (after idle pool
 * connections are dropped); Prisma's 5s default then fails writes with
 * "Can't reach database server". An explicit connect_timeout in the URL wins.
 */
function withConnectTimeout(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('connect_timeout')) parsed.searchParams.set('connect_timeout', '15');
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Type definition for the PrismaClient singleton
 * ReturnType extracts the return type from prismaClientSingleton function
 */
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

/**
 * Global type definition for storing PrismaClient in global scope
 * 
 * globalThis is the standard way to access the global object in any environment
 * (browser, Node.js, etc.). We cast it to our custom type to store the PrismaClient.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

/**
 * Get existing PrismaClient from global scope, or create a new one
 * 
 * Nullish coalescing operator (??) checks if globalForPrisma.prisma exists:
 * - If it exists (development, after hot reload): reuse it
 * - If it doesn't exist (first load, production): create new instance
 */
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

/**
 * Store PrismaClient in global scope during development
 * 
 * This prevents creating multiple instances during Next.js hot reload.
 * In production, each serverless function gets a fresh instance (which is fine).
 * 
 * NODE_ENV check: Only do this in development to avoid memory leaks in production
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
