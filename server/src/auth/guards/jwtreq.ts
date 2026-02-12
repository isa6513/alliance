import type { Request } from 'express';

export enum JWTTokenType {
    access = 'access',
    refresh = 'refresh',
}

export interface JwtRequest extends Request {
    user: JwtPayload;
}
export interface JwtPayload {
    sub: number;
    email: string;
    tokenType: JWTTokenType;
    isImpersonation?: boolean;
}

