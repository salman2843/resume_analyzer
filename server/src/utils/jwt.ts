import crypto from "node:crypto";
import { env } from "../config/env.js";

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

const encoder = new TextEncoder();

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function sign(data: string) {
  return base64Url(crypto.createHmac("sha256", env.jwtSecret).update(data).digest());
}

export function createAccessToken(payload: TokenPayload) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    })
  );
  const unsigned = `${header}.${body}`;

  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyAccessToken(token: string): TokenPayload {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    throw new Error("Invalid token");
  }

  const unsigned = `${header}.${body}`;
  const expectedSignature = sign(unsigned);
  if (signature.length !== expectedSignature.length) {
    throw new Error("Invalid token signature");
  }
  const valid = crypto.timingSafeEqual(encoder.encode(signature), encoder.encode(expectedSignature));

  if (!valid) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(decodeBase64Url(body)) as TokenPayload & { exp?: number };

  if (!payload.sub || !payload.email || !payload.role || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role
  };
}
