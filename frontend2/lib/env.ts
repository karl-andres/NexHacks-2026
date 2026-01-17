/**
 * Environment variable configuration for the application.
 *
 * Next.js automatically loads .env files. This module provides:
 * - Type-safe access to environment variables
 * - Runtime validation to catch missing variables early
 * - Clear documentation of required variables
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const apiKey = env.OVERSHOOT_API_KEY
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key]

  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please add it to your .env file.`
    )
  }

  return value ?? ''
}

/**
 * Server-side environment variables.
 * These are NOT exposed to the client/browser.
 *
 * For client-side variables, prefix with NEXT_PUBLIC_
 */
export const env = {
  /** Overshoot API key for AI vision capabilities */
  OVERSHOOT_API_KEY: getEnvVar('OVERSHOOT_API_KEY'),

  /** Node environment */
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  /** Whether we're in production */
  isProduction: process.env.NODE_ENV === 'production',

  /** Whether we're in development */
  isDevelopment: process.env.NODE_ENV === 'development',
} as const

/**
 * Client-side environment variables (NEXT_PUBLIC_ prefixed).
 * These ARE exposed to the client/browser - do not put secrets here.
 */
export const publicEnv = {
  // Add NEXT_PUBLIC_ variables here as needed
  // Example: API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
} as const

export type Env = typeof env
export type PublicEnv = typeof publicEnv
