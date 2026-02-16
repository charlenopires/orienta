import { sign, verify } from "hono/jwt"

const SECRET = process.env.JWT_SECRET ?? "dev-secret-do-not-use-in-prod"

export interface JwtPayload {
  sub: string
  name: string
  email: string
  exp: number
}

export async function createToken(user: { id: string; name: string; email: string }): Promise<string> {
  const payload: JwtPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
  }
  return sign(payload, SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  return verify(token, SECRET) as Promise<JwtPayload>
}
