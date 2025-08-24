// lib/api-key-auth.ts
import { NextRequest } from "next/server";

/**
 * Validates API key from request headers
 * Supports both 'Authorization: Bearer <key>' and 'X-API-Key: <key>' formats
 */
export async function validateApiKey(req: NextRequest): Promise<boolean> {
  // If no API key is configured, allow all requests (for development)
  const configuredKeys = process.env.PUBLIC_API_KEYS;
  if (!configuredKeys) {
    console.warn('[ApiKeyAuth] No PUBLIC_API_KEYS configured - allowing all requests');
    return true;
  }

  // Parse configured keys (comma-separated)
  const validKeys = configuredKeys.split(',').map(key => key.trim()).filter(Boolean);
  if (validKeys.length === 0) {
    console.warn('[ApiKeyAuth] No valid API keys found in PUBLIC_API_KEYS');
    return true;
  }

  // Extract API key from headers
  let apiKey: string | null = null;
  
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }
  
  // Check X-API-Key header (alternative format)
  if (!apiKey) {
    apiKey = req.headers.get('x-api-key');
  }

  if (!apiKey) {
    console.log('[ApiKeyAuth] No API key provided in request');
    return false;
  }

  // Validate key
  const isValid = validKeys.includes(apiKey);
  
  if (!isValid) {
    console.log('[ApiKeyAuth] Invalid API key provided');
  }

  return isValid;
}

/**
 * Rate limiting by IP address
 * Simple in-memory store (consider Redis for production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  req: NextRequest, 
  maxRequests = 10, 
  windowMs = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(req);
  const now = Date.now();
  
  // Get or create rate limit info for this IP
  let rateLimitInfo = rateLimitStore.get(ip);
  
  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    // Reset window
    rateLimitInfo = {
      count: 0,
      resetTime: now + windowMs
    };
    rateLimitStore.set(ip, rateLimitInfo);
  }
  
  rateLimitInfo.count++;
  
  const allowed = rateLimitInfo.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - rateLimitInfo.count);
  
  return {
    allowed,
    remaining,
    resetTime: rateLimitInfo.resetTime
  };
}

/**
 * Extract client IP from request
 */
function getClientIP(req: NextRequest): string {
  // Check various headers for IP address
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default value
  return 'unknown';
}

/**
 * Clean up old rate limit entries
 * Call this periodically to prevent memory leaks
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, info] of rateLimitStore.entries()) {
    if (now > info.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

// Clean up old entries every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}