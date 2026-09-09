export type LoginRequest = { email: string; password: string };
export type Admin = { id: number; email: string; name: string };
export type LoginResponse = { accessToken: string; tokenType: string; expiresIn: number; admin: Admin };
