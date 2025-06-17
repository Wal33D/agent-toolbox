import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';

export type JWTVerificationResult =
  | { valid: true; payload: any }
  | { valid: false; error: 'expired' | 'malformed' | 'invalid' };

/**
 * Verify the JWT from an Authorization header.
 * Returns a result describing whether the token is valid and, if not,
 * the reason why.
 */
export function verifyJWT(authorizationHeader?: string): JWTVerificationResult {
        const secret = process.env.JWT_SECRET;
        if (!secret || !authorizationHeader) {
                return { valid: false, error: 'invalid' };
        }
        const token = authorizationHeader.split(' ')[1];
        try {
                const payload = jwt.verify(token, secret, {
                        algorithms: ['HS256'],
                });
                return { valid: true, payload };
        } catch (err) {
                if (err instanceof TokenExpiredError) {
                        return { valid: false, error: 'expired' };
                }
                if (err instanceof JsonWebTokenError) {
                        return { valid: false, error: 'malformed' };
                }
                return { valid: false, error: 'invalid' };
        }
}

/**
 * Convenience helper to verify the token of a request object.
 */
export function verifyRequestToken(
  request: VercelRequest | { headers: any }
): JWTVerificationResult {
        const header = request.headers?.authorization || request.headers?.Authorization;
        return verifyJWT(typeof header === 'string' ? header : undefined);
}
