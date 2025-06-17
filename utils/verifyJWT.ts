import jwt from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';

/**
 * Verify the JWT from an Authorization header.
 * Returns true if valid, false otherwise.
 */
export function verifyJWT(authorizationHeader?: string): boolean {
	const secret = process.env.JWT_SECRET;
	if (!secret || !authorizationHeader) {
		return false;
	}
	const token = authorizationHeader.split(' ')[1];
	try {
		jwt.verify(token, secret);
		return true;
	} catch {
		return false;
	}
}

/**
 * Convenience helper to verify the token of a request object.
 */
export function verifyRequestToken(request: VercelRequest | { headers: any }): boolean {
	const header = request.headers?.authorization || request.headers?.Authorization;
	return verifyJWT(typeof header === 'string' ? header : undefined);
}
