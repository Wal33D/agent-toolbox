import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';
import { ensureEnv } from './validateEnv';

// Validate JWT_SECRET and related configuration
ensureEnv();

export type JWTVerificationResult<T> = { valid: true; payload: T } | { valid: false; error: 'expired' | 'malformed' | 'invalid' };

/**
 * Verify the JWT from an Authorization header.
 * Returns a result describing whether the token is valid and, if not,
 * the reason why.
 */
export function verifyJWT<T = Record<string, unknown>>(authorizationHeader?: string): JWTVerificationResult<T> {
	const secret = process.env.JWT_SECRET;
	if (!secret || !authorizationHeader) {
		return { valid: false, error: 'invalid' };
	}
	const token = authorizationHeader.split(' ')[1];
	try {
		const payload = jwt.verify(token, secret, {
			algorithms: ['HS256'],
		}) as T;
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
export function verifyRequestToken<T = Record<string, unknown>>(
	request: VercelRequest | { headers: Record<string, string | string[] | undefined> }
): JWTVerificationResult<T> {
	const header = request.headers?.authorization || request.headers?.Authorization;
	return verifyJWT<T>(typeof header === 'string' ? header : undefined);
}
