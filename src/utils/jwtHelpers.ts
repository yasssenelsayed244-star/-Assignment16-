import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ==================== GENERATE TOKEN ====================
// توليد JWT token للمستخدم
export const generateToken = (payload: TokenPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE || "7d";

  if (!jwtSecret) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire } as jwt.SignOptions);
};

// ==================== VERIFY TOKEN ====================
// التحقق من صحة الـ token
export const verifyToken = (token: string): TokenPayload => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.verify(token, jwtSecret) as TokenPayload;
};