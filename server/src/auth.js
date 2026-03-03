import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";
const providedJwtSecret = String(process.env.JWT_SECRET || "").trim();

if (isProduction && !providedJwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

if (isProduction && providedJwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

const JWT_SECRET = providedJwtSecret || "dev-secret-change-me";
const TOKEN_TTL = String(process.env.JWT_EXPIRES_IN || "7d").trim() || "7d";

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    status: user.status || "active",
    roleTitle: user.roleTitle || "",
  };
}

export function makeToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function checkPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function getBearerToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return null;
  }
  return auth.slice(7).trim();
}
